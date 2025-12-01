// ========================================
// FUSIONSYSTEM.JS - Système de Fusion des Ombres
// ========================================

import { FUSED_CARDS_POOL } from './fusedcards.js';

export class FusionSystem {
    constructor(gameManager) {
        this.gm = gameManager;
        this.fusionLevel = 0;  // Augmente à chaque fusion
    }

    /**
     * Compte le nombre de tokens Ombre sur le board
     */
    countShadowTokensOnBoard() {
        const allSlots = this.gm.board.getAllSlots();
        let count = 0;
        
        allSlots.forEach(slot => {
            if (slot.card && 
                slot.card.id === 'token_ombre' &&
                slot.type !== 'enemy' && 
                slot.type !== 'player') {
                count++;
            }
        });
        
        return count;
    }

    /**
     * Récupère les slots contenant des tokens Ombre
     */
    getShadowTokenSlots() {
        const allSlots = this.gm.board.getAllSlots();
        return allSlots.filter(slot => 
            slot.card && 
            slot.card.id === 'token_ombre' &&
            slot.type !== 'enemy' && 
            slot.type !== 'player'
        );
    }

    /**
     * Récupère les tiers de fusion disponibles
     */
    getAvailableFusionTiers() {
        const tokenCount = this.countShadowTokensOnBoard();
        const tiers = [];

        // Parcourir tous les tiers du pool
        for (const tier of FUSED_CARDS_POOL) {
            if (tokenCount >= tier.requiredTokens) {
                tiers.push(tier);
            }
        }

        return tiers;
    }

    /**
     * Effectue une fusion de tokens
     */
    fuseShadowTokens(tierId) {
        const tier = FUSED_CARDS_POOL.find(t => t.id === tierId);
        if (!tier) {
            this.gm.log(`❌ Tier ${tierId} introuvable`);
            return;
        }

        const tokenSlots = this.getShadowTokenSlots();
        if (tokenSlots.length < tier.requiredTokens) {
            this.gm.log(`❌ Pas assez de tokens (besoin: ${tier.requiredTokens}, disponibles: ${tokenSlots.length})`);
            return;
        }

        // Supprimer les tokens requis
        const slotsToRemove = tokenSlots.slice(0, tier.requiredTokens);
        slotsToRemove.forEach(slot => {
            this.gm.log(`🌑 Token Ombre consumé de ${slot.id}`);
            slot.removeCard();
        });
        
        // Augmenter fusionLevel
        this.fusionLevel += 1;
        this.gm.log(`⚡ Fusion Level: ${this.fusionLevel}`);


        // Créer la carte fusionnée
        const fusedCard = tier.createCard();

        // Trouver un slot libre pour placer la carte
        const emptySlots = this.gm.board.getAllSlots().filter(s => 
            !s.card && 
            (s.type === 'damage' || s.type === 'block' || s.type === 'shared' || s.type === 'state')
        );

        if (emptySlots.length === 0) {
            this.gm.log(`⚠️ Aucun slot libre ! Carte ${fusedCard.name} perdue.`);
            return;
        }

        // Choisir slot aléatoire
        const targetSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        
        // Placer la carte fusionnée sur le board
        targetSlot.placeCard(fusedCard);
        this.gm.log(`🌑 FUSION: ${fusedCard.name} (${tier.requiredTokens} tokens) → ${targetSlot.id}`);

        // Résoudre les effets de la carte fusionnée
        this.gm.effectResolver.resolveCardEffects(fusedCard, targetSlot.id);

        // Recalculer maxxers (au cas où la carte a un effet maxxer)
        this.gm.recalculateMaxxers();

        // Rafraîchir l'UI
        this.gm.ui.render();
    }

    /**
     * Calcule le bonus de value pour les tokens Ombre selon fusionLevel
     */
    getTokenValueBonus() {
        if (this.fusionLevel === 0) return 0;
        if (this.fusionLevel <= 2) return 1;
        if (this.fusionLevel <= 4) return 2;
        if (this.fusionLevel <= 6) return 4;
        if (this.fusionLevel <= 8) return 6;
        return 9; // 9+
    }

    /**
     * Applique le bonus de fusionLevel aux tokens Ombre
     * (Appelé dans board.getFinalCardValue ou dans createToken)
     */
    applyTokenBonus(card) {
        if (card.id === 'token_ombre') {
            return this.getTokenValueBonus();
        }
        return 0;
    }

    /**
     * Reset du système (début de combat)
     */
    reset() {
        this.fusionLevel = 0;
        this.gm.log(`🌑 Fusion System reset`);
    }
}
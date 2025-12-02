import { createToken } from './tokens.js';
import { ALL_CARDS } from './cards.js';

export class MirrorSystem {
    constructor(gameManager) {
        this.gm = gameManager;
        
        // État du miroir
        this.isActive = false;        // Miroir disponible si ≥50% Illusions
        this.state = 'empty';          // 'empty' ou 'full'
        this.storedCard = null;        // Carte copiée
        this.mirrorLevel = 0;          // Niveau évolutif (0 → N)
        this.fragility = 0;            // Fragilité 0% → 100%
        this.isBroken = false;         // Miroir brisé ?
        this.canInvokeThisTurn = true; // Flag timing (false après copie)
    }

    // Vérifier si miroir disponible (≥50% Illusions dans deck)
    checkActivation() {
        // Compter toutes les cartes (deck + main + défausse)
        const allCards = [...this.gm.deck, ...this.gm.hand, ...this.gm.discard];
        const totalCards = allCards.length;
        
        if (totalCards === 0) {
            this.isActive = false;
            this.gm.log('🪞 Pas de cartes dans le deck');
            return;
        }
        
        // Compter créatures Illusions
        const illusionCount = allCards.filter(card => 
            card.tags && card.tags.includes('Illusion')
        ).length;
        
        const ratio = illusionCount / totalCards;
        
        // Activer si ≥25%
        this.isActive = ratio >= 0.25;
        
        // LOG DEBUG (TEMPORAIRE)
        this.gm.log(`🪞 Check Miroir : ${illusionCount} Illusions / ${totalCards} cartes (${(ratio * 100).toFixed(1)}%)`);
        
        if (this.isActive) {
            this.gm.log('🪞✨ Miroir des Illusions ACTIVÉ !');
        } else {
            this.gm.log('🪞❌ Miroir inactif (besoin ≥25% Illusions)');
        }
    }

    // Copier une carte du board dans le miroir
    copyCard(slotId) {
        // Vérifications de sécurité
        if (this.state !== 'empty') {
            this.gm.log('⚠️ Miroir déjà plein');
            return;
        }
        
        if (this.isBroken) {
            this.gm.log('⚠️ Miroir brisé');
            return;
        }
        
        const slot = this.gm.board.getSlot(slotId);
        if (!slot || !slot.card) {
            this.gm.log('⚠️ Aucune carte sur ce slot');
            return;
        }
        
        // Copier la carte (deep copy)
        this.storedCard = {...slot.card};
        this.state = 'full';
        this.canInvokeThisTurn = false; // ← Bloque invoke ce tour
        
        this.gm.log(`🪞 Miroir copie ${this.storedCard.name}`);
    }

    // Invoquer le reflet sur un slot
    invokeReflection(slotId) {
        // Vérifications
        if (this.state !== 'full') {
            this.gm.log('⚠️ Miroir vide');
            return;
        }
        
        if (this.isBroken) {
            this.gm.log('⚠️ Miroir brisé');
            return;
        }
        
        if (!this.canInvokeThisTurn) {
            this.gm.log('⚠️ Vous devez attendre le tour suivant');
            return;
        }
        
        if (!this.storedCard) {
            this.gm.log('⚠️ Aucune carte stockée');
            return;
        }
        
        const targetSlot = this.gm.board.getSlot(slotId);
        if (!targetSlot || targetSlot.card) {
            this.gm.log('⚠️ Slot invalide ou occupé');
            return;
        }
        
        // Placer la carte sur le slot
        targetSlot.placeCard({...this.storedCard});
        this.gm.log(`✨ Reflet invoqué : ${this.storedCard.name}`);
        
        // Résoudre effets de la carte
        this.gm.effectResolver.resolveCardEffects(this.storedCard, slotId);
        
        // Check duplication (cap à 80%)
        const dupeChance = Math.min(this.mirrorLevel * 10, 80);
        const roll = Math.random() * 100;
        
        if (roll < dupeChance) {
            // DUPLICATION : miroir reste plein
            this.gm.log(`✨✨ DUPLICATION (${dupeChance}%) ! Le reflet reste dans le miroir`);
            // this.storedCard reste inchangé
            // this.state reste 'full'
            // canInvokeThisTurn reste true
        } else {
            // Pas de dupe : miroir se vide
            this.gm.log(`✨ Pas de duplication (${dupeChance}%)`);
            this.storedCard = null;
            this.state = 'empty';

            this.mirrorLevel++;
        }
        
        this.fragility += 10;
        
        this.gm.log(`🪞 Miroir : Niveau ${this.mirrorLevel}, Fragilité ${this.fragility}%`);
        
        // Vérifier si le miroir se brise
        this.checkMirrorBreak();
        
        // Recalculer maxxers car carte posée
        this.gm.recalculateMaxxers();
    }

    // Vérifier si le miroir se brise
    checkMirrorBreak() {
        // Si fragilité ≤70%, pas de risque
        if (this.fragility <= 70) return;
        
        // Si >70% : 50% de chance de bris
        const breakChance = 50;
        const roll = Math.random() * 100;
        
        if (roll < breakChance) {
            this.gm.log(`💥💥 EXPLOSION ! Le miroir se BRISE (${breakChance}% à ${this.fragility}% fragilité) !`);
            this.triggerExplosion();
        } else {
            this.gm.log(`⚠️ Le miroir vacille mais tient bon... (${breakChance}% à ${this.fragility}% fragilité)`);
        }
    }

    // Explosion du miroir : ajoute carte "Miroir Brisé" en main
    triggerExplosion() {
        this.isBroken = true;
        this.state = 'empty';
        this.storedCard = null;
        
        // Créer la carte Miroir Brisé
        const mirrorShardCard = this.createMirrorShardCard();
        
        // Ajouter en main si possible
        if (this.gm.hand.length < 10) {
            this.gm.hand.push(mirrorShardCard);
            this.gm.log(`💎 "Éclat du Miroir Brisé" ajouté en main !`);
        } else {
            this.gm.log(`⚠️ Main pleine, Miroir Brisé perdu`);
        }
        
        this.gm.log(`🪞 Le Miroir est définitivement brisé pour ce combat`);
    }

    // Créer la carte "Éclat du Miroir Brisé"
    createMirrorShardCard() {
        return {
            id: 'miroir_brise',
            name: 'Éclat du Miroir Brisé',
            value: 77,
            slotTypes: ['damage', 'block', 'shared', 'state'],
            rarity: 'Mythique',
            effect: [
                { type: 'instant_draw', value: 2 },
                { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Illusion' } }
            ],
            description: 'Draw 2, crée Illusion aléatoire sur slot à la défausse',
            cardType: 'creature',
            tags: ['Illusion']
        };
    }

    // Reset début de combat
    reset() {
        this.isActive = false;
        this.state = 'empty';
        this.storedCard = null;
        this.mirrorLevel = 0;
        this.fragility = 0;
        this.isBroken = false;
        this.canInvokeThisTurn = true;
        
        this.gm.log('🪞 Miroir réinitialisé');
    }
}
// ========================================
// LOTTERYSYSTEM.JS - Système de roulette des Zigouilleurs
// ========================================

import { LOTTERY_TIERS } from './lotteryRewards.js';

export class LotterySystem {
    constructor(gameManager) {
        this.gm = gameManager;
    }
    
    /**
     * Vérifie si le joueur peut jouer un tier
     */
    canPlay(tierId) {
        const tier = LOTTERY_TIERS[tierId];
        if (!tier) return false;
        
        return this.gm.munitions >= tier.cost;
    }
    
    /**
     * Vérifie si la main est pleine
     */
    isHandFull() {
        return this.gm.hand.length >= 10;
    }
    
    /**
     * Lance la loterie pour un tier donné
     */
    playLottery(tierId) {
        const tier = LOTTERY_TIERS[tierId];
        if (!tier) {
            console.error(`❌ Tier ${tierId} introuvable`);
            return;
        }
        
        // Vérifier munitions
        if (!this.canPlay(tierId)) {
            this.gm.log(`❌ Pas assez de munitions (besoin: ${tier.cost})`);
            return;
        }
        
        // Dépenser munitions
        this.gm.munitions -= tier.cost;
        this.gm.log(`🎰 ${tier.name} - Coût: ${tier.cost} munitions`);
        this.gm.ui.render();
        // Tirer résultat
        const result = this.rollResult(tier);
        
        // Déclencher animation dans l'UI
        this.gm.ui.popups.triggerLotteryAnimation(result, () => {
            // Callback après animation : appliquer effet
            this.applyResult(result);
            this.gm.ui.render(); // Refresh UI
        });
    }
    
    /**
     * Tire un résultat aléatoire selon les weights
     * Si lastLotteryWasLoss = true, double les chances de raté (tilt)
     */
    rollResult(tier) {
        // Copier les résultats pour modification temporaire
        const results = tier.results.map(r => ({...r}));
        
        // 😈 MALUS TILT : Si dernière loterie était ratée, doubler weight des ratés
        if (this.gm.lastLotteryWasLoss) {
            results.forEach(r => {
                if (r.id === 'oups' || r.id === 'rate_critique') {
                    r.weight *= 2; // Doubler chances de raté
                }
            });
            //this.gm.log('😈 Malus tilt actif : chances de raté doublées !');
        }
        
        // Calculer total des weights
        const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
        
        // Générer nombre aléatoire
        const rand = Math.random() * totalWeight;
        
        // Trouver le résultat correspondant
        let cumulative = 0;
        for (const result of results) {
            cumulative += result.weight;
            if (rand < cumulative) {
                return tier.results.find(r => r.id === result.id); // Retourner l'original
            }
        }
        
        // Fallback (ne devrait jamais arriver)
        return tier.results[tier.results.length - 1];
    }
    
    /**
     * Applique le résultat tiré
     */
    applyResult(result) {
        // Si pas d'effets (raté)
        if (!result.effects) {
            this.gm.log(`🎰 ${result.message}`);
            this.gm.lastLotteryWasLoss = true; 
            return;
        }
        
        // Log message
        this.gm.log(`🎰 ${result.message}`);
        this.gm.lastLotteryWasLoss = false; 
        
        // Appliquer chaque effet
        result.effects.forEach(effect => {
            this.resolveSpecialEffect(effect);
        });
    }
    
    /**
     * Résout les effets spéciaux de la loterie
     */
    resolveSpecialEffect(effect) {
        switch(effect.type) {
            case 'instant_damage_player':
                // Raté critique : dégâts au joueur
                this.gm.player.currentHp = Math.max(0, this.gm.player.currentHp - effect.value);
                this.gm.log(`💀 Vous perdez ${effect.value} PV !`);
                break;
                
            case 'instant_random_slot_bonus':
                // Big boost : utilise la méthode existante de turnResolver
                this.gm.turnResolver.applyRandomSlotBonus(effect.value);
                break;
                
            case 'instant_create_tokens_all_empty':
                // Jackpot : remplir tous les slots vides avec tokens
                this.fillEmptySlotsWithTokens(effect.tokenId);
                break;
                
            case 'instant_all_slots_bonus':
                // Bonus sur tous les slots d'un type (ZIGOUILLEUR LÉGENDAIRE)
                this.applyBonusToSlotTypes(effect.value, effect.targetTypes);
                break;
                
            default:
                // Effets standards : déléguer à effectResolver
                this.gm.effectResolver.resolveEffect(effect, null, null);
                break;
        }
    }
    
    /**
     * Remplit tous les slots vides avec des tokens (JACKPOT)
     */
    fillEmptySlotsWithTokens(tokenId) {
        const allSlots = this.gm.board.getAllSlots();
        let count = 0;
        
        allSlots.forEach(slot => {
            // Seulement slots joueur vides
            if (slot.type !== 'enemy' && slot.type !== 'player' && !slot.card) {
                const token = this.gm.createToken(tokenId);
                if (token) {
                    slot.card = token;
                    count++;
                }
            }
        });
        
        this.gm.log(`🎰 ${count} tokens Zigouilleur créés sur le board !`);
    }
    
    /**
     * Applique un bonus à tous les slots d'un certain type (ZIGOUILLEUR LÉGENDAIRE)
     */
    applyBonusToSlotTypes(value, targetTypes) {
        const allSlots = this.gm.board.getAllSlots();
        let count = 0;
        
        allSlots.forEach(slot => {
            if (targetTypes.includes(slot.type)) {
                // Ajouter bonus pending pour tour suivant
                this.gm.pendingSlotBonuses.push({ 
                    type: 'specific', 
                    slotId: slot.id, 
                    value: value 
                });
                count++;
            }
        });
        
        this.gm.log(`🎰 +${value} sur ${count} slots ${targetTypes.join('/')} (prochain tour)`);
    }
}
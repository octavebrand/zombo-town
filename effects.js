// ========================================
// EFFECTS.JS - Résolution des effets de cartes
// ========================================

export class EffectResolver {
    constructor(gameManager) {
        this.gm = gameManager;
    }
    
    // ========================================
    // RÉSOLUTION PRINCIPALE
    // ========================================
    
    resolveCardEffects(card, slotId) {
        if (!card.effect) return;
        
        const slot = this.gm.board.getSlot(slotId);
        if (!slot) return;
        
        // Si effet unique
        if (!Array.isArray(card.effect)) {
            this.resolveEffect(card.effect, card, slot);
        } else {
            // Si liste d'effets
            card.effect.forEach(eff => this.resolveEffect(eff, card, slot));
        }
    }
    
    resolveEffect(effect, card, slot) {
        switch (effect.type) {
            case 'maxxer_dmg':
            case 'maxxer_block':
            case 'maxxer_all':
            case 'maxxer_any':
                break;
            case 'bonus_neighbors':
                this.resolveBonusNeighbors(slot, effect.value);
                break;
            case 'penalty_neighbors':
                this.resolveBonusNeighbors(slot, -effect.value);
                break;
            case 'heal':
                // Sera résolu par bouton Player Resolve
                break;
            case 'draw':
                // Sera résolu par bouton Player Resolve
                break;
            default:
                console.warn(`Effet inconnu: ${effect.type}`);
        }
    }
    
    // ========================================
    // MAXXER BOOST
    // ========================================
    
    resolveMaxxerBoost(type, amount) {
        const maxxer = this.gm.maxxers[type];
        if (!maxxer) return;
        
        const oldLevel = maxxer.level;
        maxxer.boost(amount);
        const newLevel = maxxer.level;
        
        const icon = type === 'damage' ? '🔥' : '🛡️';
        this.gm.log(`${icon} Maxxer ${type.toUpperCase()} : +${amount} (${oldLevel} → ${newLevel})`);
    }
    
    // ========================================
    // BONUS VOISINS
    // ========================================
    
    resolveBonusNeighbors(slot, bonus) {
        const neighbors = this.gm.board.getNeighbors(slot.id);
        
        if (neighbors.length === 0) {
            this.gm.log(`Aucun voisin pour ${slot.id}`);
            return;
        }
        
        neighbors.forEach(neighborSlot => {
            // 🆕 Appliquer bonus sur le SLOT, pas sur la carte
            neighborSlot.bonus += bonus;
            
            const sign = bonus > 0 ? '+' : '';
            this.gm.log(`🔗 ${neighborSlot.id}: bonus ${sign}${bonus} (total: ${neighborSlot.bonus})`);
        });
    }
    
    // ========================================
    // RÉSOLUTION PLAYER (Heal/Draw)
    // ========================================
    
    resolvePlayerSlots() {
        const playerSlots = this.gm.board.getSlotsByType('player');
        let totalHeal = 0;
        let totalDraw = 0;
        
        playerSlots.forEach(slot => {
            if (!slot.card) return;
            
            const card = slot.card;
            if (!card.effect) return;
            
            // Gérer liste ou effet unique
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            
            effects.forEach(effect => {
                if (effect.type === 'heal') {
                    totalHeal += effect.value;
                } else if (effect.type === 'draw') {
                    totalDraw += effect.value;
                }
            });
        });
        
        // Appliquer heal
        if (totalHeal > 0) {
            const oldHp = this.gm.player.currentHp;
            this.gm.player.currentHp = Math.min(this.gm.player.maxHp, oldHp + totalHeal);
            const actualHeal = this.gm.player.currentHp - oldHp;
            this.gm.log(`💚 Soin: +${actualHeal} HP (${oldHp} → ${this.gm.player.currentHp})`);
        }
        
        // Appliquer draw
        if (totalDraw > 0) {
            for (let i = 0; i < totalDraw; i++) {
                if (this.gm.deck.length === 0 && this.gm.discard.length > 0) {
                    this.gm.reshuffle();
                }
                
                if (this.gm.deck.length > 0 && this.gm.hand.length < 12) {
                    const drawn = this.gm.deck.pop();
                    this.gm.hand.push(drawn);
                }
            }
            this.gm.log(`📥 Pioche: ${totalDraw} carte(s)`);
        }
        
        return { heal: totalHeal, draw: totalDraw };
    }
}
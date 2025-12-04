export class FortressSystem {
    constructor(gameManager) {
        this.gm = gameManager;
        this.shield = 0;
        this.meter = 0;
        this.protectedCardSlotIds = [];
        
        this.DECAY_RATE = 0.2;
        this.METER_FILL_RATE = 1;
        
        this.TIERS = [
            { threshold: 15, id: 'lv1', name: 'Maxxer Damage +1', cost: 15 },
            { threshold: 30, id: 'lv2', name: 'Draw 1', cost: 30 },
            { threshold: 50, id: 'lv3', name: 'All Maxxers +1 and Draw 1', cost: 30 },
            { threshold: 70, id: 'lv4', name: 'Protéger carte de la défausse', cost: 50 },
            { threshold: 100, id: 'lv5', name: 'Détruire enemy', cost: 70 }
        ];
    }
    
    addBlock(blockValue) {
        this.shield += blockValue;
    }
    
    processAfterCombat(enemyAttack) {
        // Shield absorbe l'attaque
        const blocked = Math.min(this.shield, enemyAttack);
        this.shield = Math.max(0, this.shield - enemyAttack);
        
        // Remplir meter AVANT decay
        const meterGain = Math.floor(this.shield * this.METER_FILL_RATE);
        this.meter = Math.min(100, this.meter + meterGain);
        
        // Decay
        this.shield = Math.floor(this.shield * (1 - this.DECAY_RATE));
        
        return { blocked, meterGain };
    }
    
    // Récupérer tous les tiers disponibles
    getAvailableTiers() {
        return this.TIERS.filter(tier => this.meter >= tier.threshold);
    }
    
    hasAvailableReward() {
        return this.getAvailableTiers().length > 0;
    }
    
    // Pour l'UI : affiche le tier le plus haut
    getNextReward() {
        const available = this.getAvailableTiers();
        if (available.length === 0) return null;
        
        // Retourner le plus haut
        available.sort((a, b) => b.threshold - a.threshold);
        return available[0];
    }
    
    claimReward(tierId, choice = null) {
        const tier = this.TIERS.find(t => t.id === tierId);
        if (!tier) return;
        
        // Dépenser le coût
        this.meter = Math.max(0, this.meter - tier.cost);
        
        // Appliquer l'effet
        switch(tierId) {
            case 'lv1':
                this.gm.maxxers.damage.level += 1;
                break;
            case 'lv2':
                this.gm.drawCards(1);
                break;
            case 'lv3':
                this.gm.drawCards(1);
                this.gm.maxxers.damage.level += 1;
                this.gm.maxxers.block.level += 1;
                break;
            case 'lv4':
                this.protectedCardSlotIds.push(choice);
                break;
            case 'lv5':
                const slot = this.gm.board.getSlot(choice);
                if (slot?.card) {
                    slot.card = null; // ← Détruire directement au lieu de mettre HP à 0
                }
                break;
        }
    }
    
    isCardProtected(slotId) {
        return this.protectedCardSlotIds.includes(slotId);
    }
    
    resetProtection() {
        this.protectedCardSlotIds = [];
    }
    
    getMeterPercent() {
        return this.meter;
    }
}
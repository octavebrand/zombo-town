// ========================================
// CONSTANTS.JS - Classes de base
// ========================================

// Énumération des états du jeu
export const GameState = {
    DRAFT: "DRAFT",
    PLACEMENT: "PLACEMENT",
    PLAYER_RESOLVE: "PLAYER_RESOLVE",
    END_TURN_CONFIRM: "END_TURN_CONFIRM",
    RESOLUTION: "RESOLUTION",
    ENEMY_TURN: "ENEMY_TURN",
    END_TURN: "END_TURN",
    VICTORY: "VICTORY",
    DEFEAT: "DEFEAT"
};

// Raretés
export const Rarity = {
    COMMUNE: "Commune",
    UNCOMMON: "Uncommon",
    RARE: "Rare",
    MYTHIQUE: "Mythique"
};

// ========================================
// CLASSE CARD
// ========================================
export class Card {
    constructor(id, name, value, slotTypes, rarity, effect = null, description = "") {
        this.id = id;
        this.name = name;
        this.value = value;              // Value de base (damage ou block selon slot)
        this.slotTypes = slotTypes;      // ["damage", "block", "shared", "player", "enemy", "state"]
        this.rarity = rarity;
        this.effect = effect;            // Effet additionnel (maxxer boost, neighbors, etc.)
        this.description = description;
        this.isArtifact = false;         // True si créé par create_artifact_on_discard
    }
}

// ========================================
// CLASSE SLOT
// ========================================
export class Slot {
    constructor(id, type, position, isPermanent = false) {
        this.id = id;                    // "block_left", "damage_top", "shared_1"
        this.type = type;                // "block", "damage", "state", "shared", "enemy", "player"
        this.position = position;        // { x: 15, y: 40 } en %
        this.isPermanent = isPermanent;
        this.card = null;
        this.isBlocked = false;          // Debuff enemy (futur)
        this.neighbors = [];             // IDs des slots voisins
        this.neighborBonus = 0;  // 🆕 Bonus des cartes voisines
        this.rewardBonus = 0;     // 🆕 Bonus des rewards (random/all)
    }
    
    // 🆕 Getter pour compatibilité
    get bonus() {
        return this.neighborBonus + this.rewardBonus;
    }

    canAccept(card) {
        if (!card) return false;
        return card.slotTypes.includes(this.type) && !this.isBlocked;
    }
    
    placeCard(card) {
        // Si slot a déjà une carte ET n'est pas permanent
        if (this.card && !this.isPermanent) {
            // Retourner l'ancienne carte (sera défaussée par le GameManager)
            const oldCard = this.card;
            this.card = card;
            return oldCard;
        }
        
        // Si slot permanent avec carte, remplacer quand même (défausse ancienne)
        if (this.card && this.isPermanent) {
            const oldCard = this.card;
            this.card = card;
            return oldCard;
        }
        
        // Slot vide
        this.card = card;
        return null;
    }
    
    removeCard() {
        const card = this.card;
        this.card = null;
        return card;
    }
    
    isEmpty() {
        return this.card === null;
    }
}

// ========================================
// CLASSE MAXXER
// ========================================
export class Maxxer {
    constructor(type) {
        this.type = type;      // "damage" ou "block"
        this.level = 0;        // Niveau actuel
    }
    
    boost(amount = 1) {
        this.level += amount;
    }
    
    decay(amount = 1) {
        this.level = Math.max(0, this.level - amount);
    }
    
    getMultiplier() {
        if (this.level === 0) return 0;
        return 1 + ((this.level - 1) * 0.25);
        // Niveau 0 → x0
        // Niveau 1 → x1
        // Niveau 2 → x1.25
        // Niveau 3 → x1.5
        // Niveau 4 → x1.75
        // etc.
    }
    
    reset() {
        this.level = 0;
    }
}

// ========================================
// CLASSE ENEMY CARD
// ========================================
export class EnemyCard {
    constructor(id, name, maxHp, effect = null) {
        this.id = id;
        this.name = name;
        this.currentHp = maxHp;
        this.maxHp = maxHp;
        this.effect = effect;  // { type: 'boost_damage', value: 10 } ou { type: 'boost_block', value: 10 }
    }
    
    takeDamage(amount) {
        this.currentHp = Math.max(0, this.currentHp - amount);
        return this.currentHp <= 0;  // Retourne true si morte
    }
    
    isAlive() {
        return this.currentHp > 0;
    }
}
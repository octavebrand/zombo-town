// ========================================
// GAME CONSTANTS
// ========================================

export const GameState = {
    DRAFT: "DRAFT",
    ACTIVE_DRAFT: "ACTIVE_DRAFT",
    PLAY_SELECT: "PLAY_SELECT",
    PLAY_RESOLVE: "PLAY_RESOLVE",
    ENEMY_TURN: "ENEMY_TURN",
    END_TURN: "END_TURN",
    VICTORY: "VICTORY",
    DEFEAT: "DEFEAT"
};

export const CardType = {
    REVE: "Rêve",
    CAUCHEMAR: "Cauchemar",
    TRANSCENDANT: "Transcendant"
};

export const Rarity = {
    COMMUNE: "Commune",
    UNCOMMON: "Uncommon",
    RARE: "Rare",
    MYTHIQUE: "Mythique"
};

// ========================================
// CLASSES
// ========================================

export class Card {
    constructor(id, name, type, rarity, description, effects) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.rarity = rarity;
        this.description = description;
        this.effects = effects;
    }
}

export class Player {
    constructor(maxHp) {
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.block = 0;
    }

    takeDamage(amount) {
        const damageAfterBlock = Math.max(0, amount - this.block);
        this.currentHp = Math.max(0, this.currentHp - damageAfterBlock);
        this.block = Math.max(0, this.block - amount);
        return damageAfterBlock;
    }

    heal(amount) {
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    }

    addBlock(amount) {
        this.block += amount;
    }

    resetBlock() {
        this.block = 0;
    }
}

export class Enemy {
    constructor(name, maxHp, type, attacks, ability = null) {
        this.name = name;
        this.maxHp = maxHp;
        this.currentHp = maxHp;
        this.type = type;
        this.attacks = attacks;
        this.currentAttackIndex = 0;
        this.ability = ability;
        this.abilityName = "";
        this.abilityDescription = "";
    }

    takeDamage(amount) {
        this.currentHp = Math.max(0, this.currentHp - amount);
    }

    chooseAttack(player) {
        // Simple pattern: cycle through attacks
        const attack = this.attacks[this.currentAttackIndex];
        this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;
        return attack;
    }

    getNextAttack() {
        return this.attacks[this.currentAttackIndex];
    }
}

export class GameRules {
    constructor() {
        this.draftCount = 4;
        this.cardsPerDraft = 3;
        this.cardsToSelect = 1;
        this.showCardTypes = true;
        this.showCardDamage = true;
        this.canReorderHand = true;
        this.reshuffleMode = "normal"; // "normal" | "ordered"
    }
}
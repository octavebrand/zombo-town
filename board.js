// ========================================
// BOARD.JS - Gestion du plateau
// ========================================

import { Slot } from './constants.js';

// Positions spatiales (en % de l'écran pour responsive)
const SLOT_POSITIONS = {
    // BLOCK (left side)
    block_left:   { x: 15, y: 40 },
    block_top:    { x: 25, y: 30 },
    block_bottom: { x: 25, y: 50 },
    
    // DAMAGE (center)
    damage_top:    { x: 50, y: 30 },
    damage_bottom: { x: 50, y: 50 },
    
    // STATE (right side)
    state_right:  { x: 85, y: 40 },
    state_top:    { x: 75, y: 30 },
    state_bottom: { x: 75, y: 50 },
    
    // SHARED (between entities)
    shared_1: { x: 37.5, y: 40 }, // BLOCK ↔ DAMAGE
    shared_2: { x: 62.5, y: 40 }, // DAMAGE ↔ STATE
    
    // ENEMY (top)
    enemy_1: { x: 35, y: 20 },
    enemy_2: { x: 50, y: 20 },
    enemy_3: { x: 65, y: 20 },
    
    // PLAYER (bottom)
    player_1: { x: 40, y: 60 },
    player_2: { x: 50, y: 60 },
    player_3: { x: 60, y: 60 }
};

// Voisinage (selon schéma corrigé)
const NEIGHBORS = {
    // BLOCK
    block_left:   ["block_top", "block_bottom"],
    block_top:    ["shared_1", "block_left"],
    block_bottom: ["shared_1", "block_left"],
    
    // DAMAGE
    damage_top:    ["shared_1", "shared_2"],
    damage_bottom: ["shared_1", "shared_2"],
    
    // STATE
    state_right:  ["state_top", "state_bottom"],
    state_top:    ["shared_2", "state_right"],
    state_bottom: ["shared_2", "state_right"],
    
    // SHARED
    shared_1: ["block_top", "block_bottom", "damage_top", "damage_bottom"],
    shared_2: ["damage_top", "damage_bottom", "state_top", "state_bottom"],
    
    // ENEMY et PLAYER : pas de voisins pour l'instant
    enemy_1: [],
    enemy_2: [],
    enemy_3: [],
    player_1: [],
    player_2: [],
    player_3: []
};

export class BoardState {
    constructor() {
        this.slots = {
            block: [],   // 3 slots
            damage: [],  // 2 slots
            state: [],   // 3 slots
            shared: [],  // 2 slots
            enemy: [],   // 3 slots
            player: []   // 3 slots
        };
        
        this.initializeSlots();
        this.assignPermanentSlots();
        this.defineNeighbors();
    }
    
    initializeSlots() {
        // BLOCK (3)
        this.slots.block.push(new Slot("block_left", "block", SLOT_POSITIONS.block_left));
        this.slots.block.push(new Slot("block_top", "block", SLOT_POSITIONS.block_top));
        this.slots.block.push(new Slot("block_bottom", "block", SLOT_POSITIONS.block_bottom));
        
        // DAMAGE (2)
        this.slots.damage.push(new Slot("damage_top", "damage", SLOT_POSITIONS.damage_top));
        this.slots.damage.push(new Slot("damage_bottom", "damage", SLOT_POSITIONS.damage_bottom));
        
        // STATE (3)
        this.slots.state.push(new Slot("state_right", "state", SLOT_POSITIONS.state_right));
        this.slots.state.push(new Slot("state_top", "state", SLOT_POSITIONS.state_top));
        this.slots.state.push(new Slot("state_bottom", "state", SLOT_POSITIONS.state_bottom));
        
        // SHARED (2) - JAMAIS permanents
        this.slots.shared.push(new Slot("shared_1", "shared", SLOT_POSITIONS.shared_1));
        this.slots.shared.push(new Slot("shared_2", "shared", SLOT_POSITIONS.shared_2));
        
        // ENEMY (3)
        this.slots.enemy.push(new Slot("enemy_1", "enemy", SLOT_POSITIONS.enemy_1));
        this.slots.enemy.push(new Slot("enemy_2", "enemy", SLOT_POSITIONS.enemy_2));
        this.slots.enemy.push(new Slot("enemy_3", "enemy", SLOT_POSITIONS.enemy_3));
        
        // PLAYER (3)
        this.slots.player.push(new Slot("player_1", "player", SLOT_POSITIONS.player_1));
        this.slots.player.push(new Slot("player_2", "player", SLOT_POSITIONS.player_2));
        this.slots.player.push(new Slot("player_3", "player", SLOT_POSITIONS.player_3));
    }
    
    assignPermanentSlots() {
        // 🆕 Plus de slots permanents
        console.log('Slots permanents désactivés');
    }
    
    defineNeighbors() {
        // Appliquer le mapping de voisinage
        for (let slotId in NEIGHBORS) {
            const slot = this.getSlot(slotId);
            if (slot) {
                slot.neighbors = NEIGHBORS[slotId];
            }
        }
    }
    
    getSlot(slotId) {
        for (let type in this.slots) {
            const found = this.slots[type].find(s => s.id === slotId);
            if (found) return found;
        }
        return null;
    }
    
    getAllSlots() {
        return Object.values(this.slots).flat();
    }
    
    getSlotsByType(type) {
        return this.slots[type] || [];
    }
    
    // Récupérer voisins d'un slot (retourne objets Slot)
    getNeighbors(slotId) {
        const slot = this.getSlot(slotId);
        if (!slot) return [];
        
        return slot.neighbors
            .map(neighborId => this.getSlot(neighborId))
            .filter(s => s !== null);
    }
    
    // Vider un slot et retourner la carte
    clearSlot(slotId) {
        const slot = this.getSlot(slotId);
        if (slot) {
            return slot.removeCard();
        }
        return null;
    }
    
    // Placer une carte sur un slot
    placeCard(slotId, card) {
        const slot = this.getSlot(slotId);
        if (!slot) return { success: false, reason: "Slot introuvable" };
        
        if (!slot.canAccept(card)) {
            return { success: false, reason: "Carte incompatible avec ce slot" };
        }
        
        const oldCard = slot.placeCard(card);
        return { success: true, oldCard: oldCard };
    }

    // 🆕 Calculer value finale d'une carte avec ses charmes
    getFinalCardValue(slotId) {
        const slot = this.getSlot(slotId);
        if (!slot || !slot.card) return 0;
        
        let total = slot.card.value;
        
        // Appliquer charmes
        slot.equipments.forEach(charm => {
            if (!charm.effect) return;
            
            const effects = Array.isArray(charm.effect) ? charm.effect : [charm.effect];
            
            effects.forEach(eff => {
                if (eff.type === 'charm_boost_creature') {
                    total += eff.value;
                }
                if (eff.type === 'charm_random_boost' && charm._appliedBoost) {
                    total += charm._appliedBoost;
                }
            });
        });
        
        // Appliquer bonus neighbors/rewards
        total += slot.neighborBonus + slot.rewardBonus;
        
        return total;
    }
}
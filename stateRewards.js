// ========================================
// STATEREWARDS.JS - Pool de rewards STATE
// ========================================

export const STATE_REWARDS_POOL = {
    tier0: [
        { id: 't0_draw1', name: 'Pioche 1', effects: [{ type: 'draw', value: 1 }] },
        { id: 't0_heal5', name: 'Heal 5', effects: [{ type: 'heal', value: 5 }] },
        { id: 't0_random2', name: 'Random slot +2', effects: [{ type: 'random_slot_bonus', value: 2 }] }
    ],
    tier1: [
        { id: 't1_draw2', name: 'Pioche 2', effects: [{ type: 'draw', value: 2 }] },
        { id: 't1_heal10', name: 'Heal 10', effects: [{ type: 'heal', value: 10 }] },
        { id: 't1_random4', name: 'Random slot +4', effects: [{ type: 'random_slot_bonus', value: 4 }] }
    ],
    tier2: [
        { id: 't2_draw3', name: 'Pioche 3', effects: [{ type: 'draw', value: 3 }] },
        { id: 't2_heal15', name: 'Heal 15', effects: [{ type: 'heal', value: 15 }] },
        { id: 't2_random4x2', name: '2x Random slots +4', effects: [
            { type: 'random_slot_bonus', value: 4 },
            { type: 'random_slot_bonus', value: 4 }
        ]}
    ],
    tier3: [
        { id: 't3_draw3_heal5', name: 'Pioche 3 + Heal 5', effects: [
            { type: 'draw', value: 3 },
            { type: 'heal', value: 5 }
        ]},
        { id: 't3_heal20', name: 'Heal 20', effects: [{ type: 'heal', value: 20 }] },
        { id: 't3_all1', name: 'All slots +1', effects: [{ type: 'all_slots_bonus', value: 1 }] }
    ],
    tier4: [
        { id: 't4_draw3_heal15', name: 'Pioche 3 + Heal 15', effects: [
            { type: 'draw', value: 3 },
            { type: 'heal', value: 15 }
        ]},
        { id: 't4_draw2_all1', name: 'Pioche 2 + All slots +1', effects: [
            { type: 'draw', value: 2 },
            { type: 'all_slots_bonus', value: 1 }
        ]},
        { id: 't4_heal30_draw1', name: 'Heal 30 + Pioche 1', effects: [
            { type: 'heal', value: 30 },
            { type: 'draw', value: 1 }
        ]}
    ]
};

export const STATE_TIER_THRESHOLDS = [0, 10, 20, 30, 40];

export function getTierFromValue(stateValue) {
    for (let i = STATE_TIER_THRESHOLDS.length - 1; i >= 0; i--) {
        if (stateValue >= STATE_TIER_THRESHOLDS[i]) {
            return i;
        }
    }
    return 0;
}

export function getRandomRewards(tier, count = 2) {
    const tierKey = `tier${tier}`;
    const pool = STATE_REWARDS_POOL[tierKey];
    
    if (!pool || pool.length === 0) return [];
    
    // Mélanger et prendre les N premiers
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, pool.length));
}
// ========================================
// CARDS.JS - Les 15 cartes du prototype
// ========================================

import { Card, Rarity } from './constants.js';

export const ALL_CARDS = [
    
    // ========================================
    // COMMUNES (5 cartes)
    // ========================================
    

    // Coup bas 
    new Card(
        'Coup_bas',
        'Coup bas',
        10,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        'Value 10'
    ),

    // Botte 
    new Card(
        'botte',
        'Botte',
        3,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 1 },
        'Value 3, draw 1'
    ),
    
    new Card(
        'dmg_boost',
        'DMG Boost',
        6,
        ['damage', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_dmg', value: 1 },
        'Value 6 + Maxxer DMG +1'
    ),
    
    new Card(
        'block_boost',
        'BLOCK Boost',
        6,
        ['block', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_block', value: 1 },
        'Value 6 + Maxxer BLOCK +1'
    ),
    
    // ========================================
    // UNCOMMON (5 cartes)
    // ========================================
    
    // Déluge
    new Card(
        'deluge',
        'Déluge',
        5,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        { type: 'maxxer_all', value: 1 },
        'Value 5 + Tous maxxers +1'
    ),

    // Body stretch
    new Card(
        'Body_stretch',
        'Body stretch',
        5,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Draw 1 + Slot maxxer +1'
    ),

     // Renaissance
    new Card(
        'Renaissance',
        'Renaissance',
        0,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 2 }
        ],
        'Draw 2 + Slot maxxer +1'
    ),

    // Maintenance
    new Card(
        'Maintenance',
        'Maintenance',
        2,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_all', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Draw 1 + Tous maxxers +1'
    ),

    // Joie Communicative
    new Card(
        'joie_communicative',
        'Joie Communicative',
        5,
        ['damage', 'block', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        { type: 'bonus_neighbors', value: 5 },
        'Value 5 + Voisins +5'
    ),
    
    new Card(
        'gne',
        'Gné',
        20,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'penalty_neighbors', value: 5 },
        'Value 20 + Voisins -5'
    ),
    
    // Boost Léger
    new Card(
        'boost_man',
        'Boost Man',
        2,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 2 + Maxxer du slot +1, draw 1'
    ),

    new Card(
         'all_boost',
        'Catalyseur',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_all_slots_bonus', value: 1 },
        'Value 4 + All slots +1'
    ),
        
    // ========================================
    // RARES (3 cartes)
    // ========================================
    
    new Card(
        'Coup_du_chapeau',
        'Coup du chapeau',
        13,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        'Value 13'
    ),
    
    new Card(
        'coup_puissant',
        'Coup Puissant',
        15,
        ['damage'],
        Rarity.RARE,
        null,
        'Value 15 (damage only)'
    ),
    
    new Card(
        'forteresse',
        'Forteresse',
        15,
        ['block'],
        Rarity.RARE,
        null,
        'Value 15 (block only)'
    ),
    
    // Résonance Parfaite
    new Card(
        'resonance_parfaite',
        'Résonance Parfaite',
        4,
        ['damage', 'block', 'state'],  // 🆕 + state
        Rarity.RARE,
        { type: 'bonus_neighbors', value: 6 },
        'Value 4 + Voisins +6'
    ),

    new Card(
        'all_boost',
        'Catalyseur',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_all_slots_bonus', value: 2 },
        'Value 0 + All slots +2'
    ),
    
    // ========================================
    // MYTHIQUES (2 cartes)
    // ========================================
    
    new Card(
        'tempete',
        'Tempête',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'maxxer_all', value: 2 },
        'Value 2, Tous maxxers +2'
    ),

    // Commune - Cycle peon
    new Card(
        'card_peon_cycle',
        'Cycle Peon',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMON,
        { type: 'instant_draw', value: 1 },
        'draw 1'
        
    ),

    // Uncommon - Moteur
    new Card(
        'card_engine',
        'Moteur',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_draw', value: 2 },
        'value 3, draw 2'
    )
];
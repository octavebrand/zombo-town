// ========================================
// CARDS.JS - Les 15 cartes du prototype
// ========================================

import { Card, Rarity } from './constants.js';

export const ALL_CARDS = [
    
    // ========================================
    // COMMUNES (5 cartes)
    // ========================================
    
    // Botte Simple
    new Card(
        'botte_simple',
        'Botte Simple',
        10,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        null,
        'Value 10'
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
    
    
    // Coup Moyen
    new Card(
        'coup_moyen',
        'Coup Moyen',
        15,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        null,
        'Value 15'
    ),
    
    // ========================================
    // UNCOMMON (5 cartes)
    // ========================================
    
    // Déluge
    new Card(
        'deluge',
        'Déluge',
        3,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        { type: 'maxxer_all', value: 1 },
        'Value 3 + Tous maxxers +1'
    ),

    // Joie Communicative
    new Card(
        'joie_communicative',
        'Joie Communicative',
        5,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
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
        'boost_leger',
        'Boost Léger',
        4,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.UNCOMMON,
        { type: 'maxxer_any', value: 1 },
        'Value 4 + Maxxer du slot +1'
    ),
    
    // ========================================
    // RARES (3 cartes)
    // ========================================
    
    new Card(
        'coup_puissant',
        'Coup Puissant',
        20,
        ['damage'],
        Rarity.RARE,
        null,
        'Value 20 (damage only)'
    ),
    
    new Card(
        'forteresse',
        'Forteresse',
        20,
        ['block'],
        Rarity.RARE,
        null,
        'Value 20 (block only)'
    ),
    
    // Résonance Parfaite
    new Card(
        'resonance_parfaite',
        'Résonance Parfaite',
        6,
        ['damage', 'block', 'shared', 'state'],  // 🆕 + state
        Rarity.RARE,
        { type: 'bonus_neighbors', value: 6 },
        'Value 6 + Voisins +6'
    ),
    
    // ========================================
    // MYTHIQUES (2 cartes)
    // ========================================
    
    new Card(
        'tempete',
        'Tempête',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'maxxer_all', value: 2 },
        'Tous maxxers +2'
    )
];
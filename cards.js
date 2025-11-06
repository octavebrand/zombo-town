// ========================================
// CARDS.JS - Cartes du prototype
// ========================================

import { Card, Rarity, CardType } from './constants.js';

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
        null,
        'Value 10',
        CardType.CREATURE,  // 🆕
        []                  // 🆕 Pas de tag (neutre)
    ),

    // Botte 
    new Card(
        'botte',
        'Botte',
        5,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 1 },
        'Value 5, draw 1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'dmg_boost',
        'DMG Boost',
        6,
        ['damage', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_dmg', value: 1 },
        'Value 6 + Maxxer DMG +1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'block_boost',
        'BLOCK Boost',
        6,
        ['block', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_block', value: 1 },
        'Value 6 + Maxxer BLOCK +1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'Coup_du_chapeau',
        'Coup du chapeau',
        13,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        null,
        'Value 13',
        CardType.CREATURE,
        []
    ),
    
    // ========================================
    // UNCOMMON (10 cartes)
    // ========================================
    
    // Déluge
    new Card(
        'deluge',
        'Déluge',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'maxxer_all', value: 1 },
        'Value 5 + Tous maxxers +1',
        CardType.CREATURE,
        []
    ),

    // Body stretch
    new Card(
        'Body_stretch',
        'Body stretch',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Draw 1 + Slot maxxer +1',
        CardType.CREATURE,
        []
    ),

     // Renaissance
    new Card(
        'Renaissance',
        'Renaissance',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 2 }
        ],
        'Draw 2 + Slot maxxer +1',
        CardType.CREATURE,
        []
    ),

    // Maintenance
    new Card(
        'Maintenance',
        'Maintenance',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_all', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Draw 1 + Tous maxxers +1',
        CardType.CREATURE,
        []
    ),

    // Joie Communicative
    new Card(
        'joie_communicative',
        'Joie Communicative',
        5,
        ['damage', 'block', 'state'],
        Rarity.UNCOMMON,
        { type: 'bonus_neighbors', value: 5 },
        'Value 5 + Voisins +5',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'gne',
        'Gné',
        20,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'penalty_neighbors', value: 5 },
        'Value 20 + Voisins -5',
        CardType.CREATURE,
        []
    ),
    
    // Boost Léger
    new Card(
        'boost_man',
        'Boost Man',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_dmg', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 3 + Maxxer DMG +1, draw 1',
        CardType.CREATURE,
        []
    ),

    // Tower man
    new Card(
        'tower_man',
        'Tower Man',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_block', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 3 + Maxxer BLOCK +1, draw 1',
        CardType.CREATURE,
        []
    ),

    new Card(
        'all_boost',
        'Catalyseur',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_all_slots_bonus', value: 1 },
        'Value 4 + All slots +1',
        CardType.CREATURE,
        []
    ),
    
    // Commune - Cycle peon
    new Card(
        'card_peon_cycle',
        'Cycle Peon',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_draw', value: 1 },
        'Value 5, draw 1',
        CardType.CREATURE,
        []
    ),
        
    // ========================================
    // RARES (3 cartes)
    // ========================================
    
    new Card(
        'coup_puissant',
        'Coup Puissant',
        15,
        ['damage'],
        Rarity.RARE,
        null,
        'Value 15 (damage only)',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'forteresse',
        'Forteresse',
        15,
        ['block'],
        Rarity.RARE,
        null,
        'Value 15 (block only)',
        CardType.CREATURE,
        []
    ),
    
    // Résonance Parfaite
    new Card(
        'resonance_parfaite',
        'Résonance Parfaite',
        4,
        ['damage', 'block', 'state'],
        Rarity.RARE,
        { type: 'bonus_neighbors', value: 6 },
        'Value 4 + Voisins +6',
        CardType.CREATURE,
        []
    ),
    
    // ========================================
    // MYTHIQUES (1 carte)
    // ========================================
    
    new Card(
        'tempete',
        'Tempête',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'maxxer_all', value: 2 },
        'Value 2, Tous maxxers +2',
        CardType.CREATURE,
        []
    ),

    // ========================================
    // v2.0 - CRÉATURES SIMPLES (value pure + tags)
    // ========================================
    
    // MOLLUSQUES
    new Card(
        'mollusque_devoue',
        'Mollusque Dévoué',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Mollusque']
    ),
    
    new Card(
        'mollusque_curieux',
        'Mollusque Curieux',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Mollusque']
    ),
    
    // ZIGOUILLEURS
    new Card(
        'archiviste_zigouilleur',
        'Archiviste Zigouilleur',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Zigouilleur']
    ),
    
    // TRAFIQUANTS
    new Card(
        'trafiquant_legumes',
        'Trafiquant de Légumes',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Trafiquant']
    ),
    
    new Card(
        'trafiquant_biens',
        'Trafiquant de Biens',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Trafiquant']
    ),
    
    // OMBRES
    new Card(
        'ombre_studieuse',
        'Ombre Studieuse',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 2 },
        'Value 3, draw 2',
        CardType.CREATURE,
        ['Ombre']
    ),
    
    new Card(
        'ombre_amplificatrice',
        'Ombre Amplificatrice',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Ombre']
    ),
    
    // ILLUSIONS
    new Card(
        'illusion_simple',
        'Illusion Simple',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Illusion']
    ),
    
    new Card(
        'illusion_fouineuse',
        'Illusion Fouineuse',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 2 },
        'Value 3, draw 2',
        CardType.CREATURE,
        ['Illusion']
    ),
    
    // NEUTRES (pour équilibrer le deck)
    new Card(
        'tacticien',
        'Tacticien',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_all_slots_bonus', value: 3 },
        'Value 0, tous slots +3',
        CardType.CREATURE,
        []  // Pas de tag
    )
];
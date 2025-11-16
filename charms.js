// ========================================
// CHARMS.JS - Charmes (équipements)
// ========================================

import { Card, CardType, Rarity } from './constants.js';

export const ALL_CHARMS = [
    
    // COMMUNS
    new Card(
        'charme_forgeron',
        'Charme du Forgeron',
        0,  // Pas de value propre
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'charm_boost_neighbors', value: 3 }
        ],
        'Maxxer +1, voisins +3',
        CardType.CHARM,
        []
    ),
    
    // UNCOMMON
    new Card(
        'totem_flammes',
        'Totem de Flammes',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'charm_boost_neighbors', value: 6 },
        'Voisins +6',
        CardType.CHARM,
        []
    ),
    
    new Card(
        'massif',
        'Charme Massif',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_boost_creature', value: 15 },
            { type: 'charm_penalty_neighbors', value: -2 }
        ],
        'Créature +15, voisins -2',
        CardType.CHARM,
        []
    ),
    
    new Card(
        'charme_instabilite',
        'Charme d\'Instabilité',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'charm_random_boost', min: 5, max: 20 },
        'Créature +5 à +20 (aléatoire)',
        CardType.CHARM,
        []
    ),
    
    new Card(
        'charme_vampirique',
        'Charme Vampirique',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_boost_creature', value: 8 },
            { type: 'charm_heal_on_discard', value: 8 }
        ],
        'Créature +8, heal 8 à la défausse',
        CardType.CHARM,
        []
    ),

    // ========================================
    // NOUVEAUX CHARMES - BATCH 1
    // ========================================

    // CHARMES 1-5: Maxxer slot +1 + créature tribale on discard

    new Card(
        'charme_des_mollusques',
        'Charme des Mollusques',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Mollusque' } }
        ],
        'Maxxer +1, Mollusque aléatoire sur slot on discard',
        CardType.CHARM,
        []
    ),

    new Card(
        'charme_des_zigouilleurs',
        'Charme des Zigouilleurs',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Zigouilleur' } }
        ],
        'Maxxer +1, Zigouilleur aléatoire sur slot on discard',
        CardType.CHARM,
        []
    ),

    new Card(
        'charme_des_trafiquants',
        'Charme des Trafiquants',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Trafiquant' } }
        ],
        'Maxxer +1, Trafiquant aléatoire sur slot on discard',
        CardType.CHARM,
        []
    ),

    new Card(
        'charme_des_ombres',
        'Charme des Ombres',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Ombre' } }
        ],
        'Maxxer +1, Ombre aléatoire sur slot on discard',
        CardType.CHARM,
        []
    ),

    new Card(
        'charme_des_illusions',
        'Charme des Illusions',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Illusion' } }
        ],
        'Maxxer +1, Illusion aléatoire sur slot on discard',
        CardType.CHARM,
        []
    ),

    // CHARMES 6-10: Transform créature + tokens voisins

    new Card(
        'metamorphose_mollusque',
        'Métamorphose Mollusque',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Mollusque' } },
            { type: 'instant_create_token_on_neighbors', tokenId: 'token_mollusque' }
        ],
        'Transform en Mollusque aléatoire + Tokens Mollusque sur voisins',
        CardType.CHARM,
        []
    ),

    new Card(
        'metamorphose_zigouilleur',
        'Métamorphose Zigouilleur',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Zigouilleur' } },
            { type: 'instant_create_token_on_neighbors', tokenId: 'token_zigouilleur' }
        ],
        'Transform en Zigouilleur aléatoire + Tokens Zigouilleur sur voisins',
        CardType.CHARM,
        []
    ),

    new Card(
        'metamorphose_trafiquant',
        'Métamorphose Trafiquant',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Trafiquant' } },
            { type: 'instant_create_token_on_neighbors', tokenId: 'token_trafiquant' }
        ],
        'Transform en Trafiquant aléatoire + Tokens Trafiquant sur voisins',
        CardType.CHARM,
        []
    ),

    new Card(
        'metamorphose_ombre',
        'Métamorphose Ombre',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Ombre' } },
            { type: 'instant_create_token_on_neighbors', tokenId: 'token_ombre' }
        ],
        'Transform en Ombre aléatoire + Tokens Ombre sur voisins',
        CardType.CHARM,
        []
    ),

    new Card(
        'metamorphose_illusion',
        'Métamorphose Illusion',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'on_discard_create_creature_same_slot', filter: { tag: 'Illusion' } },
            { type: 'instant_create_token_on_neighbors', tokenId: 'token_illusion' }
        ],
        'Transform en Illusion aléatoire + Tokens Illusion sur voisins',
        CardType.CHARM,
        []
    ),

    // CHARME 11: Maxxer all +1, draw on discard 2

    new Card(
        'charme_catalyseur',
        'Charme du Catalyseur',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'charm_maxxer_slot', value: 1 },  // Pour le slot
            { type: 'on_discard_draw', value: 2 }
        ],
        'Maxxer slot +1, pioche 2 on discard',
        CardType.CHARM,
        []
    ),

    // CHARME 12: Rare aléatoire + draw on discard

    new Card(
        'charme_fortune',
        'Charme de Fortune',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIC,
        [
            { type: 'on_discard_add_rare_card' },
            { type: 'on_discard_draw', value: 1 }
        ],
        'Rare aléatoire en main + pioche 1 on discard',
        CardType.CHARM,
        []
    ),

    // CHARME 13: Maxxer slot +1, discover charme

    new Card(
        'charme_exploration',
        'Charme d\'Exploration',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'instant_discover', pool: 'charms', count: 3 }
        ],
        'Maxxer +1, discover un charme',
        CardType.CHARM,
        []
    ),

    // CHARME 14: Maxxer all +1, all slots +3

    new Card(
        'charme_cosmique',
        'Charme Cosmique',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIC,
        [
            { type: 'charm_maxxer_slot', value: 1 },
            { type: 'instant_all_slots_bonus', value: 3 }
        ],
        'Maxxer ALL +1, tous les slots +3',
        CardType.CHARM,
        []
    )
];
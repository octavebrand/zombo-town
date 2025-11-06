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
        'Massif',
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
    )
];
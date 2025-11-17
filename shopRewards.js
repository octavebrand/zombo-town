// ========================================
// SHOPREWARDS.JS - Cartes achetables avec marchandises
// ========================================

import { Card, CardType, Rarity } from './constants.js';

export const SHOP_REWARDS = {
    tier1: [
        // Tier 1: 5 marchandises - Cartes puissantes
        new Card(
            'contrebandier_expert',
            'Contrebandier Expert',
            15,
            ['damage', 'block', 'shared', 'state'],
            Rarity.RARE,
            { type: 'gain_goods', value: 2 },
            'Value 20, gagne 2 marchandises',
            CardType.CREATURE,
            ['Trafiquant']
        ),
        new Card(
            'negociant_habile',
            'Négociant Habile',
            13,
            ['damage', 'block', 'shared', 'state'],
            Rarity.RARE,
            { type: 'instant_draw', value: 2 },
            'Value 13, pioche 2',
            CardType.CREATURE,
            ['Trafiquant']
        )
    ],
    
    tier2: [
        // Tier 2: 10 marchandises - Cartes très puissantes
        new Card(
            'baron_commerce',
            'Baron du Commerce',
            20,
            ['damage', 'block', 'shared', 'state'],
            Rarity.MYTHIC,
            [
                { type: 'instant_draw', value: 2 }
            ],
            'Value 20, pioche 2',
            CardType.CREATURE,
            ['Trafiquant']
        )
    ],
    
    tier3: [
        // Tier 3: 15 marchandises - Carte surpuissante
        new Card(
            'empereur_marche',
            'Empereur du Marché',
            30,
            ['damage', 'block', 'shared', 'state'],
            Rarity.MYTHIC,
            [
                { type: 'maxxer_all', value: 2 },
                { type: 'instant_draw', value: 1 }
            ],
            'Value 30, maxxer all +2, pioche 1',
            CardType.CREATURE,
            ['Trafiquant']
        )
    ]
};

export const SHOP_PRICES = {
    tier1: 5,
    tier2: 10,
    tier3: 15
};
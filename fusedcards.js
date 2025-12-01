// ========================================
// FUSEDCARDS.JS - Pool de cartes fusionnées (Ombres)
// ========================================

import { Card, CardType, Rarity } from './constants.js';

/**
 * Pool des tiers de fusion
 * Chaque tier a un nombre de tokens requis et génère une carte spécifique
 */
export const FUSED_CARDS_POOL = [
    // ========================================
    // TIER 1 : 2 TOKENS
    // ========================================
    {
        id: 'fusion_tier_1',
        name: 'Ombre Mineure',
        requiredTokens: 2,
        createCard: () => new Card(
            'fused_ombre_mineure',
            'Ombre Mineure',
            18,
            ['damage', 'block', 'shared', 'state'],
            Rarity.RARE,
            { type: 'instant_create_token', tokenId: 'token_ombre'},
            '1 token en main',
            CardType.CREATURE,
            ['Ombre']
        )
    },

    // ========================================
    // TIER 2 : 3 TOKENS
    // ========================================
    {
        id: 'fusion_tier_2',
        name: 'Ombre Coalisée',
        requiredTokens: 3,
        createCard: () => new Card(
            'fused_ombre_coalisee',
            'Ombre Coalisée',
            28,
            ['damage', 'block', 'shared', 'state'],
            Rarity.RARE,
            [
                { type: 'instant_distribute', value: 15, targetTypes: ['damage', 'block'], onlyOccupied: true },
                { type: 'instant_create_token', tokenId: 'token_ombre'}
            ],
            'Distribue 15, 1 token en main',
            CardType.CREATURE,
            ['Ombre']
        )
    },

    // ========================================
    // TIER 3 : 4 TOKENS
    // ========================================
    {
        id: 'fusion_tier_3',
        name: 'Ombre Majeure',
        requiredTokens: 4,
        createCard: () => new Card(
            'fused_ombre_majeure',
            'Ombre Majeure',
            40,
            ['damage', 'block', 'shared', 'state'],
            Rarity.MYTHIC,
            [
                { type: 'aura_tribal', tag: 'Ombre', value: 5, includesSelf: false },
                { type: 'instant_create_token', tokenId: 'token_ombre'}
            ],
            'Aura Ombre +5, 1 token en main',
            CardType.CREATURE,
            ['Ombre']
        )
    },

    // ========================================
    // TIER 4 : 5 TOKENS
    // ========================================
    {
        id: 'fusion_tier_4',
        name: 'Archonte des Ombres',
        requiredTokens: 5,
        createCard: () => new Card(
            'fused_archonte_ombres',
            'Archonte des Ombres',
            55,
            ['damage', 'block', 'shared', 'state'],
            Rarity.MYTHIC,
            [
                { type: 'aura_tribal', tag: 'Ombre', value: 8, includesSelf: false },
                { type: 'instant_create_token', tokenId: 'token_ombre'},
                { type: 'instant_draw', value: 2 },
                { type: 'instant_all_slots_bonus', value: 5 }
            ],
            'Aura Ombre +8, 1 token en main, pioche 2, tous slots +5',
            CardType.CREATURE,
            ['Ombre']
        )
    }
];

/**
 * Helper pour récupérer un tier par ID
 */
export function getFusionTierById(tierId) {
    return FUSED_CARDS_POOL.find(t => t.id === tierId);
}

/**
 * Helper pour récupérer le tier minimum requis
 */
export function getMinimumFusionTier() {
    return FUSED_CARDS_POOL.reduce((min, tier) => 
        tier.requiredTokens < min.requiredTokens ? tier : min
    );
}

/**
 * Helper pour récupérer le tier maximum
 */
export function getMaximumFusionTier() {
    return FUSED_CARDS_POOL.reduce((max, tier) => 
        tier.requiredTokens > max.requiredTokens ? tier : max
    );
}
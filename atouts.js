// ========================================
// ATOUTS.JS - Cartes permanentes (slots player)
// ========================================

import { Card, CardType, Rarity } from './constants.js';

export const ALL_ATOUTS = [
    
    // UNCOMMON
    new Card(
        'petit_moteur',
        'Petit Moteur',
        0,
        ['player'],  // Uniquement slots player
        Rarity.UNCOMMON,
        { type: 'atout_draw_eot', value: 1, max_hand: 7 },
        'Draw 1 fin tour, max 7 main',
        CardType.ATOUT,
        []
    ),
    
    // RARE
    new Card(
        'usine_mollusques',
        'Usine à Mollusques',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_token_on_discard', tag: 'Mollusque', tokenId: 'token_mollusque' },
        'Crée jeton Mollusque quand Mollusque défaussé',
        CardType.ATOUT,
        []
    ),
    
    new Card(
        'stabilisateur',
        'Stabilisateur',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_maxxer_start', start: 1, max: 2 },
        'Maxxers débutent à 1, max 2',
        CardType.ATOUT,
        []
    )
];
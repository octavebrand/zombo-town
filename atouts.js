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

    // Dans atouts.js, ajouter après l'Usine à Mollusques:

    new Card(
        'usine_zigouilleurs',
        'Usine à Zigouilleurs',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_token_on_discard', tag: 'Zigouilleur', tokenId: 'token_zigouilleur' },
        'Crée jeton Zigouilleur quand Zigouilleur défaussé',
        CardType.ATOUT,
        []
    ),

    new Card(
        'usine_trafiquants',
        'Usine à Trafiquants',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_token_on_discard', tag: 'Trafiquant', tokenId: 'token_trafiquant' },
        'Crée jeton Trafiquant quand Trafiquant défaussé',
        CardType.ATOUT,
        []
    ),

    new Card(
        'usine_ombres',
        'Usine à Ombres',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_token_on_discard', tag: 'Ombre', tokenId: 'token_ombre' },
        'Crée jeton Ombre quand Ombre défaussé',
        CardType.ATOUT,
        []
    ),

    new Card(
        'usine_illusions',
        'Usine à Illusions',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_token_on_discard', tag: 'Illusion', tokenId: 'token_illusion' },
        'Crée jeton Illusion quand Illusion défaussé',
        CardType.ATOUT,
        []
    ),

    new Card(
        'fortification',
        'Fortification',
        0,
        ['player'],
        Rarity.UNCOMMON,
        { type: 'atout_block_eot', value: 5 },
        '+5 block permanent',
        CardType.ATOUT,
        []
    ),

    new Card(
        'arsenal',
        'Arsenal',
        0,
        ['player'],
        Rarity.UNCOMMON,
        { type: 'atout_damage_eot', value: 5 },
        '+5 damage permanent',
        CardType.ATOUT,
        []
    ),

    new Card(
        'coeur_enchante',
        'Cœur Enchanté',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_heal_on_charm_played', value: 5 },
        'Heal 5 PV à chaque charme joué',
        CardType.ATOUT,
        []
    ),

    new Card(
        'gun_room',
        'Gun Room',
        0,
        ['player'],
        Rarity.UNCOMMON,
        { type: 'atout_munitions_on_charm_played', value: 2 },
        '+2 munition à chaque charme joué',
        CardType.ATOUT,
        []
    ),
        
    new Card(
        'stabilisateur',
        'Stabilisateur',
        0,
        ['player'],
        Rarity.RARE,
        { type: 'atout_maxxer_start', start: 1, max: 1 },
        'Maxxers débutent à 1, ne peuvent pas augmenter',
        CardType.ATOUT,
        []
    )
];
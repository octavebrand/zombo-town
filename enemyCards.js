// ========================================
// ENEMYCARDS.JS - Pool de cartes ennemies
// ========================================

import { EnemyCard } from './constants.js';

export const ENEMY_CARDS_POOL = [
    new EnemyCard(
        'enemy_guard_dmg',
        'Garde Offensif',
        20,
        { type: 'boost_damage', value: 10 }
    ),
    
    new EnemyCard(
        'enemy_guard_block',
        'Garde Défensif',
        20,
        { type: 'boost_block', value: 10 }
    ),
    
    new EnemyCard(
        'enemy_guard_balanced',
        'Garde Équilibré',
        25,
        [
            { type: 'boost_damage', value: 5 },
            { type: 'boost_block', value: 5 }
        ]
    ),

    // 🆕 NOUVELLES CARTES AVANCÉES
    new EnemyCard(
        'enemy_treasure_guard',
        'Trésor Gardé',
        15,
        { type: 'boost_block', value: 5 },
        { type: 'add_rare_card' },  // onDeath
        null                         // timer
    ),

    new EnemyCard(
        'enemy_bomber',
        'Bombardier',
        20,
        null,  // pas d'effet passif
        null,  // pas d'onDeath
        { turns: 3, effect: { type: 'damage_player', value: 50 } }  // timer
    ),

    new EnemyCard(
        'enemy_living_chest',
        'Coffre Vivant',
        20,
        { type: 'boost_damage', value: 15 },
        { type: 'draw', value: 2 },  // onDeath
        null
    ),

    new EnemyCard(
        'enemy_corrupted_priest',
        'Prêtre Corrompu',
        15,
        { type: 'boost_block', value: 5 },
        null,
        { turns: 3, effect: { type: 'heal_enemy', value: 50 } }  // timer
    )
];
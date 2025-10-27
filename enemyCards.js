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
    )
];
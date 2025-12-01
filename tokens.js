// ========================================
// TOKENS.JS - Jetons générés en jeu
// ========================================

import { Card, CardType, Rarity } from './constants.js';

export const TOKENS = [
    // Jeton Mollusque (créé par Générateur, Usine à Mollusques)
    new Card(
        'token_mollusque',
        'Jeton Mollusque',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Jeton créé par effets Mollusque',
        CardType.TOKEN,
        ['Mollusque']
    ),
    
    // Jeton Ombre (créé par Générateur d'Ombres, Ombre Persistante)
    new Card(
        'token_ombre',
        'Jeton Ombre',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Jeton créé par effets Ombre',
        CardType.TOKEN,
        ['Ombre']
    ),

    // Jeton Trafiquant (créé par charmes)
    new Card(
        'token_trafiquant',
        'Jeton Trafiquant',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Jeton créé par effets Trafiquant',
        CardType.TOKEN,
        ['Trafiquant']
    ),
    
    // Jeton Zigouilleur (créé par futurs effets)
    new Card(
        'token_zigouilleur',
        'Jeton Zigouilleur',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Jeton créé par effets Zigouilleur',
        CardType.TOKEN,
        ['Zigouilleur']
    ),
    
    // Jeton Illusion (créé par Illusion Gênante)
    new Card(
        'token_illusion',
        'Jeton Illusion',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Jeton créé par Illusion Gênante',
        CardType.TOKEN,
        ['Illusion']
    )
];

// Helper pour créer un jeton (copie profonde)
export function createToken(tokenId, gameManager = null) {
    const template = TOKENS.find(t => t.id === tokenId);
    if (!template) {
        console.error(`❌ Token ${tokenId} introuvable`);
        return null;
    }
    
    // Créer copie profonde
    const token = new Card(
        template.id,
        template.name,
        template.value,
        [...template.slotTypes],
        template.rarity,
        template.effect,
        template.description,
        template.cardType,
        [...template.tags]
    );

    
    /* if (gameManager && tokenId === 'token_ombre') {
        const bonus = gameManager.fusionSystem.getTokenValueBonus();
        token.value += bonus;
    } */
    
    return token;
}
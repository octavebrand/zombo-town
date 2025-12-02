// ========================================
// LOTTERYREWARDS.JS - Système de roulette des Zigouilleurs
// ========================================

export const LOTTERY_TIERS = {
    petit: {
        cost: 10,
        name: 'Petite Mise 🎲',
        results: [
            { 
                id: 'oups', 
                weight: 20, 
                effects: null,
                message: '💥 BOUM ! Raté !',
                flashColor: '#8B0000' // Rouge sombre
            },
            { 
                id: 'bonus', 
                weight: 20,
                effects: [{ type: 'gain_munitions', value: 15 }],
                message: '💰 Bonus de munitions !',
                flashColor: '#FFD700' // Or
            },
            { 
                id: 'ricochet', 
                weight: 20,
                effects: [{ 
                    type: 'instant_missiles', 
                    count: 2, 
                    value: 4, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '🎯 Ricochet de missiles !',
                flashColor: '#FF4500' // Orange rouge
            },
            { 
                id: 'pluie', 
                weight: 20,
                effects: [{ 
                    type: 'instant_distribute', 
                    value: 15, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '☔ Pluie acide !',
                flashColor: '#32CD32' // Vert
            },
            { 
                id: 'utile_mini', 
                weight: 20,
                effects: [
                    { type: 'maxxer_all', value: 1 },
                    { type: 'instant_draw', value: 1 }
                ],
                message: '✨ Utile Mini !',
                flashColor: '#4169E1' // Bleu royal
            }
        ]
    },
    
    gambling: {
        cost: 20,
        name: 'Gambling 🎰',
        results: [
            { 
                id: 'oups', 
                weight: 20, 
                effects: null,
                message: '💥 BOUM ! Raté !',
                flashColor: '#8B0000'
            },
            { 
                id: 'distribution', 
                weight: 20,
                effects: [{ 
                    type: 'instant_missiles', 
                    count: 5, 
                    value: 4, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '🎯 Distribution de missiles !',
                flashColor: '#FF4500'
            },
            { 
                id: 'bonus', 
                weight: 20,
                effects: [{ type: 'gain_munitions', value: 35 }],
                message: '💰 GROS Bonus de munitions !',
                flashColor: '#FFD700'
            },
            { 
                id: 'cling_cling', 
                weight: 20,
                effects: [{ 
                    type: 'instant_distribute', 
                    value: 35, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '💸 Cling Cling !',
                flashColor: '#32CD32'
            },
            { 
                id: 'utile_plus', 
                weight: 15,
                effects: [
                    { type: 'maxxer_all', value: 2 },
                    { type: 'instant_draw', value: 2 }
                ],
                message: '✨✨ Utile+ !',
                flashColor: '#4169E1'
            },
            { 
                id: 'jackpot', 
                weight: 5,
                effects: [{ 
                    type: 'instant_create_tokens_all_empty',
                    tokenId: 'token_zigouilleur'
                }],
                message: '🎰🎉 JACKPOT ! 🎉🎰',
                flashColor: '#FF00FF' // Magenta
            }
        ]
    },
    
    allin: {
        cost: 40,
        name: 'All-In 💣',
        results: [
            { 
                id: 'rate_critique', 
                weight: 20, 
                effects: [{ type: 'instant_damage_player', value: 50 }],
                message: '💀 RATÉ CRITIQUE ! -50 PV',
                flashColor: '#000000' // Noir
            },
            { 
                id: 'mission_missiles', 
                weight: 25,
                effects: [{ 
                    type: 'instant_missiles', 
                    count: 12, 
                    value: 4, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '🚀 Mission Missiles !',
                flashColor: '#FF4500'
            },
            { 
                id: 'big_boost', 
                weight: 25,
                effects: [{ type: 'instant_random_slot_bonus', value: 50 }],
                message: '🎲 BIG BOOST sur slot aléatoire !',
                flashColor: '#FFD700'
            },
            { 
                id: 'explosion_jetons', 
                weight: 15,
                effects: [{ 
                    type: 'instant_distribute', 
                    value: 75, 
                    targetTypes: ['damage', 'block', 'shared', 'state'],
                    onlyOccupied: true 
                }],
                message: '💥 Explosion de jetons !',
                flashColor: '#32CD32'
            },
            { 
                id: 'mega_jackpot', 
                weight: 10,
                effects: [
                    { 
                        type: 'instant_distribute', 
                        value: 60, 
                        targetTypes: ['damage', 'block', 'shared', 'state'],
                        onlyOccupied: true 
                    },
                    { type: 'maxxer_all', value: 3 }
                ],
                message: '🎰💎 MEGA JACKPOT ! 💎🎰',
                flashColor: '#9400D3' // Violet foncé
            },
            { 
                id: 'zigouilleur_legendaire', 
                weight: 5,
                effects: [
                    { 
                        type: 'instant_missiles', 
                        count: 5, 
                        value: 4, 
                        targetTypes: ['damage', 'shared'],
                        onlyOccupied: true 
                    },
                    { 
                        type: 'instant_all_slots_bonus', 
                        value: 25, 
                        targetTypes: ['damage', 'shared']
                    },
                    { type: 'maxxer_dmg', value: 4 }
                ],
                message: '🔥💥🎰 ZIGOUILLEUR LÉGENDAIRE !!! 🎰💥🔥',
                flashColor: '#FF1493' // Rose profond
            }
        ]
    }
};

// Messages variés pour rendre l'expérience plus dynamique (optionnel)
export const LOTTERY_MESSAGES = {
    opening: [
        '🎰 Que la zigouille soit avec vous...',
        '🎲 Les dés sont lancés !',
        '💣 Explosion de possibilités !',
        '🎰 Zigouilleurs en action !'
    ],
    oups: [
        '💥 BOUM ! Raté !',
        'Pas de chance, essaie encore !',
        'Huhu... !',
        'Oupsiii !'
    ],
    jackpot: [
        '🎰🎉 JACKPOT !!! 🎉🎰',
        '💰💰💰 BOUYAAA !!! 💰💰💰',
        '🔥🔥🔥 PWIP PWIP !!! 🔥🔥🔥'
    ]
};
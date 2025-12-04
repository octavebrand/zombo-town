// ========================================
// CARDS.JS - Cartes du prototype
// ========================================

import { Card, Rarity, CardType } from './constants.js';

export const ALL_CARDS = [
    
    // ========================================
    // COMMUNES (5 cartes)
    // ========================================
    
    // Coup bas 
    new Card(
        'Coup_bas',
        'Homme au chapeau',
        10,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        null,
        'Value 10',
        CardType.CREATURE,  
        []                  
    ),

    // Botte 
    new Card(
        'botte',
        'Intello',
        5,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 1 },
        'Value 5, draw 1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'dmg_boost',
        'Jeune aggressif',
        6,
        ['damage', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_dmg', value: 1 },
        'Value 6 + Maxxer DMG +1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'block_boost',
        'Jeune victime',
        6,
        ['block', 'shared'],
        Rarity.COMMUNE,
        { type: 'maxxer_block', value: 1 },
        'Value 6 + Maxxer BLOCK +1',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'Coup_du_chapeau',
        'Corbeau',
        13,
        ['damage', 'block', 'shared', 'state'],  
        Rarity.COMMUNE,
        null,
        'Value 13',
        CardType.CREATURE,
        []
    ),
    
    // ========================================
    // UNCOMMON (10 cartes)
    // ========================================
    
    // Déluge
    new Card(
        'deluge',
        'Perroquet bavard',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'maxxer_all', value: 1 },
        'Value 5 + Tous maxxers +1',
        CardType.CREATURE,
        []
    ),

    // Body stretch
    new Card(
        'Body_stretch',
        'Préparateur physique',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Draw 1 + Slot maxxer +1',
        CardType.CREATURE,
        []
    ),

     // Renaissance
    new Card(
        'Renaissance',
        'Maitre nageur',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 2 }
        ],
        'Draw 2 + Slot maxxer +1',
        CardType.CREATURE,
        []
    ),

    // Maintenance
    new Card(
        'Maintenance',
        'Ouvrier polyvalent',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_all', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Draw 1 + Tous maxxers +1',
        CardType.CREATURE,
        []
    ),

    // Joie Communicative
    new Card(
        'joie_communicative',
        'Jeune euphorique',
        5,
        ['damage', 'block', 'state'],
        Rarity.UNCOMMON,
        { type: 'bonus_neighbors', value: 5 },
        'Value 5 + Voisins +5',
        CardType.CREATURE,
        []
    ),
    
/*     new Card(
        'gne',
        'Gné',
        20,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'penalty_neighbors', value: 5 },
        'Value 20 + Voisins -5',
        CardType.CREATURE,
        []
    ), */
    
    // Boost Léger
    new Card(
        'boost_man',
        'Ingénieur',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_dmg', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 3 + Maxxer DMG +1, draw 1',
        CardType.CREATURE,
        []
    ),

    // Tower man
    new Card(
        'tower_man',
        'Contremaitre',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_block', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 3 + Maxxer BLOCK +1, draw 1',
        CardType.CREATURE,
        []
    ),

    new Card(
        'all_boost',
        'Mécanicien',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_all_slots_bonus', value: 1 },
        'Value 4 + All slots +1',
        CardType.CREATURE,
        []
    ),
    
    // Commune - Cycle peon
    new Card(
        'card_peon_cycle',
        'Peon',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_draw', value: 1 },
        'Value 5, draw 1',
        CardType.CREATURE,
        []
    ),
        
    // ========================================
    // RARES (3 cartes)
    // ========================================
    
    new Card(
        'coup_puissant',
        'Horacio',
        15,
        ['damage'],
        Rarity.RARE,
        null,
        'Value 15 (damage only)',
        CardType.CREATURE,
        []
    ),
    
    new Card(
        'forteresse',
        'Humain',
        15,
        ['block'],
        Rarity.RARE,
        null,
        'Value 15 (block only)',
        CardType.CREATURE,
        []
    ),
    
    // Résonance Parfaite
    new Card(
        'resonance_parfaite',
        'Cuisinier généreux',
        4,
        ['damage', 'block', 'state'],
        Rarity.RARE,
        { type: 'bonus_neighbors', value: 6 },
        'Value 4 + Voisins +6',
        CardType.CREATURE,
        []
    ),
    
    // ========================================
    // MYTHIQUES (1 carte)
    // ========================================
    
    new Card(
        'tempete',
        'Maestro',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'maxxer_all', value: 2 },
        'Value 2, Tous maxxers +2',
        CardType.CREATURE,
        []
    ),

    // ========================================
    // v2.0 - CRÉATURES SIMPLES (value pure + tags)
    // ========================================
    
    // MOLLUSQUES
    new Card(
        'mollusque_devoue',
        'Mollusque Dévoué',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Mollusque']
    ),
    
    new Card(
        'mollusque_curieux',
        'Mollusque Curieux',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'guerrier_mollusque',
        'Guerrier Mollusque',
        10,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'count_tribal', tag: 'Mollusque', value: 2, includesSelf: false },
        'Value 10, +2 par autre Mollusque',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'commandant_mollusque',
        'Commandant Mollusque',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'aura_tribal', tag: 'Mollusque', value: 3, includesSelf: false },
        'Value 8, autres Mollusques +3',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'artisan_mollusque',
        'Artisan Mollusque',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_discover', pool: 'charms', count: 3 },
        'Value 6, révèle 3 Charmes, choisis-en 1',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'mollusque_joyeux',
        'Mollusque Joyeux',
        10,
        ['damage', 'block', 'state'],
        Rarity.RARE,
        { type: 'bonus_neighbors', value: 4 },
        'Value 10, voisins +4',
        CardType.CREATURE,
        ['Mollusque']
    ),

        new Card(
        'mollusque_archiviste',
        'Mollusque Archiviste',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Mollusque' }, count: 3 }
        ],
        'Value 5, Maxxer +1, discover Mollusque',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'mollusque_reproducteur',
        'Mollusque Reproducteur',
        7,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'on_discard_create_token', tokenId: 'token_mollusque' },
        'Value 7, crée jeton Mollusque à la défausse',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'mollusque_mutagene',
        'Mollusque Mutagène',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_transform_neighbor', pool: 'creatures', filter: { tag: 'Mollusque' } },
        'Value 6, transforme voisin en Mollusque',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'mollusque_a_mollusque',
        'Mollusque à Mollusque',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'on_discard_create_creature_same_slot', pool: 'creatures', filter: { tag: 'Mollusque' } },
        'Value 8, crée Mollusque aléatoire sur même slot',
        CardType.CREATURE,
        ['Mollusque']
    ),

    new Card(
        'mollusque_erudit',
        'Mollusque Érudit',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'on_discard_draw', value: 2 },
        'Value 8, draw 2 à la défausse',
        CardType.CREATURE,
        ['Mollusque']
    ),

    
    // ZIGOUILLEURS
    new Card(
        'archiviste_zigouilleur',
        'Archiviste Zigouilleur',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_artificier',
        'Zigouilleur Artificier',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_missiles', count: 5, value: 2, targetTypes: ['damage', 'shared'] },
        'Value 3, 5 missiles ×2 sur slots damage/shared',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'ingenieur_zigouilleur',
        'Ingénieur Zigouilleur',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Zigouilleur' }, count: 3 }
        ],
        'Value 3, Maxxer +1, discover Zigouilleur',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_affame',
        'Zigouilleur Affamé',
        8,
        ['damage'],
        Rarity.RARE,
        { type: 'instant_devour_neighbors', multiplier: 2 },
        'Value 8, dévore voisins (gagne value ×2)',
        CardType.CREATURE,
        ['Zigouilleur']
    ),
    
    new Card(
        'zigouilleur_adroit',
        'Zigouilleur Adroit',
        5,
        ['block', 'state'],
        Rarity.RARE,
        { type: 'instant_missiles', count: 3, value: 5, targetTypes: ['damage', 'shared'] },
        'Value 5, 3 missiles ×5 sur slots damage/shared',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'canonnier_zigouilleur',
        'Canonnier Zigouilleur',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_missiles', count: 15, value: 1, targetTypes: ['damage', 'block', 'shared', 'state'] },
        'Value 5, 15 missiles ×1 sur tous slots',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_de_masse',
        'Zigouilleur De Masse',
        7,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'count_tribal', tag: 'Zigouilleur', value: 3, includesSelf: true },
        'Value 7, +3 par Zigouilleur',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_kamikaze',
        'Zigouilleur Kamikaze',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'instant_missiles', count: 5, value: 2, targetTypes: ['damage', 'shared'] },
            { type: 'gain_munitions', value: 3 }
        ],
        'Value 5, 5 missiles ×2, munitions +3',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_des_mines',
        'Zigouilleur des Mines',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'gain_munitions', value: 3 },
            { type: 'on_discard_draw', value: 1 }
        ],
        'Value 4, Maxxer +1, munitions +3, draw 1 à la défausse',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_intello',
        'Zigouilleur Intello',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'on_discard_draw', value: 2 }
        ],
        'Value 6, Maxxer +1, draw 2 à la défausse',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
            'grand_stratege_zigouilleur',
            'Grand Stratège Zigouilleur',
            3,
            ['damage', 'block', 'shared', 'state'],
            Rarity.MYTHIQUE,
            [
                { type: 'instant_missiles', count: 7, value: 2, targetTypes: ['damage', 'shared'] },
                { type: 'maxxer_all', value: 1 },
                { type: 'instant_draw', value: 1 },
                { type: 'gain_munitions', value: 2 }
            ],
            'Value 3, 7 missiles ×2, Maxxers +1, draw 1, +2 munitions',
            CardType.CREATURE,
            ['Zigouilleur']
        ),

    new Card(
        'zigouilleur_fanatique',
        'Zigouilleur Fanatique',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Zigouilleur' }, count: 3 },
            { type: 'instant_missiles', count: 3, value: 1, targetTypes: ['damage', 'shared'] }
        ],
        'Value 4, discover Zigouilleur, 3 missiles ×1',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_transformiste',
        'Zigouilleur Transformiste',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'instant_transform_neighbor', pool: 'creatures', filter: { tag: 'Zigouilleur' } },
            { type: 'instant_missiles', count: 4, value: 2, targetTypes: ['damage', 'shared'] }
        ],
        'Value 5, transforme voisin en Zigouilleur, 4 missiles ×2',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_joueur',
        'Zigouilleur Joueur',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'gain_munitions', value: 4 },
        'Value 6, +4 munitions',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    new Card(
        'zigouilleur_croupier',
        'Zigouilleur Croupier',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        {
            type: 'gain_munitions_conditional',
            base: 4,
            executeEffect: (gm) => {
                gm.munitions += 4;
                gm.log(`💣 +2 munitions`);
                if (gm.munitions >= 10) {
                    gm.munitions += 4;
                    gm.log(`💣 +4 munitions BONUS (10+ munitions)`);
                }
            }
        },
        'Value 8, +4 munitions (+4 bonus si 10+ munitions)',
        CardType.CREATURE,
        ['Zigouilleur']
    ),

    // TRAFIQUANTS
    new Card(
        'trafiquant_legumes',
        'Trafiquant de Légumes',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_econome',
        'Trafiquant Econome',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'gain_goods', value: 2 },
        'Value 5, gagne 2 marchandises',
        CardType.CREATURE,
        ['Trafiquant']
    ),
    
    new Card(
        'trafiquant_de_la_bourse',
        'Trafiquant de la Bourse',
        15,
        ['state'],
        Rarity.RARE,
        { type: 'gain_goods', value: 3 },
        'Value 15, gagne 3 marchandises, State slots only',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_biens',
        'Trafiquant de Biens',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            {type: 'gain_goods', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1, gagne 1 marchandise',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_genereux',
        'Trafiquant Généreux',
        2,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
        {type: 'gain_goods', value: 1 },
        { type: 'instant_distribute', value: 13, targetTypes: ['damage', 'block', 'shared', 'state'], onlyOccupied: true },
        ],
        'Value 2, distribue 13 sur slots occupés, gagne 1 marchandise',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_reves',
        'Trafiquant de Rêves',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Trafiquant' }, count: 3 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 4, discover Trafiquant, draw 1',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_influent',
        'Trafiquant Influent',
        7,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'gain_goods', value: 1 },
            { type: 'instant_transform_random_to_mythic' }
        ],
        'Value 7, transforme créature aléatoire en Mythique, gagne 1 marchandise',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_negociateur',
        'Trafiquant Négociateur',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'instant_draw', value: 1 },
            { type: 'instant_distribute', value: 8, targetTypes: ['damage', 'block', 'shared', 'state'], onlyOccupied: true }
        ],
        'Value 5, draw 1, distribue 8 sur slots occupÃ©s',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_lourd',
        'Trafiquant Lourd',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'instant_distribute', value: 15, targetTypes: ['damage', 'block', 'shared', 'state'], onlyOccupied: false },
        'Value 5, distribue 15 sur tous slots',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_du_four',
        'Trafiquant du Four',
        7,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_discover', pool: 'charms', count: 3 }
        ],
        'Value 7, Maxxer +1, discover Charme',
        CardType.CREATURE,
        ['Trafiquant']
    ),

    new Card(
        'trafiquant_de_cartes',
        'Trafiquant de Cartes',
        9,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'on_discard_create_creature_same_slot', pool: 'creatures', filter: { rarity: 'Uncommon' } },
        'Value 9, crée créature Uncommon aléatoire sur même slot',
        CardType.CREATURE,
        ['Trafiquant']
    ),   
    
    new Card(
        'trafiquant_de_livres',
        'Trafiquant de Livres',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'instant_draw', value: 1 },
            { type: 'on_discard_draw', value: 2 }
        ],
        'Value 5, draw 1 immédiat, draw 2 à la défausse',
        CardType.CREATURE,
        ['Trafiquant']
    ),
    
    // OMBRES
    new Card(
        'ombre_studieuse',
        'Ombre Studieuse',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 2 },
        'Value 3, draw 2',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'maitre_ombres',
        'Maître des Ombres',
        10,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        { type: 'aura_tribal', tag: 'Ombre', value: 4, includesSelf: true },
        'Value 10, toutes Ombres +4',
        CardType.CREATURE,
        ['Ombre']
    ),
    
    new Card(
        'ombre_amplificatrice',
        'Ombre Amplificatrice',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'maxxer_any', value: 1 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 5, Maxxer +1, draw 1',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'generateur_ombres',
        'Générateur d\'Ombres',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_create_token', tokenId: 'token_ombre' },
        'Value 6, crée jeton Ombre en main',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_persistante',
        'Ombre Persistante',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'on_discard_create_token', tokenId: 'token_ombre' },
        'Value 8, crée jeton Ombre quand défaussée',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'collecteur_ombres',
        'Collecteur d\'Ombres',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'bonus_per_discard', tag: 'Ombre', value: 3 },
        'Value 5, +3 par Ombre défaussée au tour précédent',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_replicante',
        'Ombre Réplicante',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_create_token_on_neighbors', tokenId: 'token_ombre' },
        'Value 6, crée jetons Ombre sur slots voisins vides',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_fugace',
        'Ombre Fugace',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'on_discard_create_token', tokenId: 'token_ombre' },
            { type: 'on_discard_create_token', tokenId: 'token_ombre' }
        ],
        'Value 3, crée 2 jetons Ombre à la défausse',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_absorbante',
        'Ombre Absorbante',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'instant_devour_neighbors', multiplier: 1 },
            { type: 'instant_create_token', tokenId: 'token_ombre' },
            { type: 'on_discard_create_token', tokenId: 'token_ombre' }
        ],
        'Value 6, dévore voisins (×1), crée jeton Ombre immédiat+défausse)',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_chercheuse',
        'Ombre Chercheuse',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Ombre' }, count: 3 },
            { type: 'maxxer_any', value: 1 },
        ],
        'Value 6, discover Ombre, maxxer 1',
        CardType.CREATURE,
        ['Ombre']
    ),

    new Card(
        'ombre_de_vie',
        'Ombre de Vie',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        [
            { type: 'maxxer_any', value: 2 },
            { type: 'on_discard_create_creature_same_slot', pool: 'creatures', filter: { tag: 'Ombre' } }
        ],
        'Value 8, maxxer +2, crée Ombre aléatoire sur même slot',
        CardType.CREATURE,
        ['Ombre']
    ),
        
    // ILLUSIONS
    new Card(
        'illusion_simple',
        'Illusion Simple',
        12,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        null,
        'Value pure tribale',
        CardType.CREATURE,
        ['Illusion']
    ),
    
    new Card(
        'illusion_fouineuse',
        'Illusion Fouineuse',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.COMMUNE,
        { type: 'instant_draw', value: 2 },
        'Value 3, draw 2',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_feu',
        'Illusion de Feu',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'maxxer_all', value: 1 },
            { type: 'instant_distribute', value: 10, targetTypes: ['damage', 'block', 'shared', 'state'], onlyOccupied: false }
        ],
        'Value 0, All maxxers +1, distribue 10',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_genante',
        'Illusion Gênante',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'on_discard_create_token_same_slot', tokenId: 'token_illusion' },
        'Value 8, crée jeton Illusion sur même slot',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_changeante_v1',
        'Illusion Changeante',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_transform_neighbor', pool: 'creatures', filter: { tag: 'Illusion' } },
        'Value 8, transforme voisin en Illusion',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_miroir',
        'Illusion Miroir',
        5,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        { type: 'instant_transform_neighbor', pool: 'creatures', filter: { rarity: 'Rare' } },
        'Value 5, transforme voisin en Rare',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_polymorphe',
        'Illusion Polymorphe',
        6,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        [
            { type: 'instant_discover', pool: 'creatures', filter: { tag: 'Illusion' }, count: 3 },
            { type: 'instant_draw', value: 1 }
        ],
        'Value 6, discover Illusion, draw 1',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_gazeuse',
        'Illusion Gazeuse',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'maxxer_all', value: 1 },
            { type: 'on_discard_create_token', tokenId: 'token_illusion' }
        ],
        'Value 8, maxxer all +1, crée jeton Illusion à la défausse',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_perfide',
        'Illusion Perfide',
        16,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'penalty_neighbors', value: 3 },
        'Value 16, voisins -3',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_demultiplicatrice',
        'Illusion Démultiplicatrice',
        4,
        ['damage', 'block', 'shared', 'state'],
        Rarity.MYTHIQUE,
        [
            { type: 'instant_create_token', tokenId: 'token_illusion' },
            { type: 'instant_create_token', tokenId: 'token_illusion' },
            { type: 'instant_distribute', value: 12, targetTypes: ['damage', 'block', 'shared', 'state'], onlyOccupied: true }
        ],
        'Value 4, crée 2 jetons Illusion, distribue 12',
        CardType.CREATURE,
        ['Illusion']
    ),

    new Card(
        'illusion_joyeuse',
        'Illusion Joyeuse',
        11,
        ['damage', 'block', 'shared', 'state'],
        Rarity.RARE,
        [
            { type: 'bonus_neighbors', value: 5 },
            { type: 'on_discard_create_token_same_slot', tokenId: 'token_illusion' }
        ],
        'Value 11, voisins +5, laisse jeton Illusion',
        CardType.CREATURE,
        ['Illusion']
    ),
    
    // NEUTRES (pour équilibrer le deck)

    new Card(
        'assassin_gentil',
        'Assassin Gentil',
        3,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_destroy_enemy' },
        'Value 3, détruit un enemy',
        CardType.CREATURE,
        []
    ),

    new Card(
        'moine_reveur',
        'Moine Rêveur',
        8,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_protect_ally' },
        'Value 8, protège un allié de la défausse ce tour ci',
        CardType.CREATURE,
        []
    ),

    new Card(
        'tacticien',
        'Tacticien',
        0,
        ['damage', 'block', 'shared', 'state'],
        Rarity.UNCOMMON,
        { type: 'instant_all_slots_bonus', value: 3 },
        'Value 0, tous slots +3',
        CardType.CREATURE,
        []  // Pas de tag
    )
];
import { Card, CardType, Rarity } from './constants.js';

// ========================================
// SPECIAL CARDS (Outside pool)
// ========================================

export const UNICORN_TREASURE_CARD = new Card(
    "unicorn_treasure",
    "Unicorn Treasure",
    CardType.TRANSCENDANT,
    Rarity.MYTHIQUE,
    "40 dmg. Pioche 3. Freeze ennemi 2 tours.",
    [
        { type: "damage", value: 40, modifiers: { typeBonus: true } },
        { type: "draw", value: 3 },
        { type: "freeze_enemy", duration: 2 }
    ]
);

// ========================================
// ALL CARDS (Main pool)
// ========================================

export const ALL_CARDS = [
    // === UNICORN MINIATURES (3 cartes) ===
    new Card(
        "unicorn_red",
        "Unicorn Miniature Rouge",
        CardType.REVE,
        Rarity.RARE,
        "Pioche 1. Garde en main.",
        [
            { type: "draw", value: 1 },
            { type: "keep_next_turn" },
            { type: "unicorn_fusion_check" }
        ]
    ),
    
    new Card(
        "unicorn_blue",
        "Unicorn Miniature Bleu",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "Pioche 1. Garde en main.",
        [
            { type: "draw", value: 1 },
            { type: "keep_next_turn" },
            { type: "unicorn_fusion_check" }
        ]
    ),
    
    new Card(
        "unicorn_yellow",
        "Unicorn Miniature Jaune",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Pioche 1. Garde en main.",
        [
            { type: "draw", value: 1 },
            { type: "keep_next_turn" },
            { type: "unicorn_fusion_check" }
        ]
    ),

    // === CARTES DE BASE (5 cartes) ===
    new Card(
        "c01",
        "Coup de Poing",
        CardType.REVE,
        Rarity.COMMUNE,
        "Inflige 12 dégâts.",
        [
            { type: "damage", value: 12, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c02",
        "Lumière Apaisante",
        CardType.TRANSCENDANT,
        Rarity.COMMUNE,
        "Soigne 8 PV.",
        [
            { type: "heal", value: 8 }
        ]
    ),

    new Card(
        "c03",
        "Bouclier d'Ombre",
        CardType.CAUCHEMAR,
        Rarity.COMMUNE,
        "Bloque 10 dégâts.",
        [
            { type: "block", value: 10 }
        ]
    ),

    new Card(
        "c04",
        "Appel du Rêve",
        CardType.REVE,
        Rarity.UNCOMMON,
        "6 dmg + invoque carte Commune.",
        [
            { type: "damage", value: 6, modifiers: { typeBonus: true } },
            { type: "invoke", filter: { rarity: Rarity.COMMUNE } }
        ]
    ),

    new Card(
        "c05",
        "Pacte de Sang",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "Cartes Cauchemar +3 dmg (permanent).",
        [
            {
                type: "permanent",
                permanentType: "damage_boost",
                value: 3,
                cardType: CardType.CAUCHEMAR
            }
        ]
    ),

    // === CONTRAINTES DE POSITION (4 cartes) ===
    new Card(
        "c06",
        "Frappe Finale",
        CardType.REVE,
        Rarity.UNCOMMON,
        "5 dmg. x5 si dernière position.",
        [
            {
                type: "damage",
                value: 5,
                condition: { type: "finisher", multiplier: 5 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c07",
        "Assaut Éclair",
        CardType.CAUCHEMAR,
        Rarity.UNCOMMON,
        "20 dmg si 1ère position, sinon 0.",
        [
            {
                type: "damage",
                value: 20,
                condition: { type: "first_strike" },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c08",
        "Résonance",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "8 dmg. +10 si précédente même type.",
        [
            {
                type: "damage",
                value: 8,
                condition: { type: "sandwich", bonus: 10 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c09",
        "Désespoir",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "8 dmg. x5 si dernière position + <30% HP.",
        [
            {
                type: "damage",
                value: 8,
                condition: { type: "last_hope", multiplier: 5 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    // === EFFETS RETARDÉS (3 cartes) ===
    new Card(
        "c10",
        "Vision du Futur",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Dans 2 tours: 25 dmg.",
        [
            {
                type: "delayed",
                turnsUntilTrigger: 2,
                delayedEffect: { type: "damage", value: 25, modifiers: { typeBonus: true } }
            }
        ]
    ),

    new Card(
        "c15",
        "Frappe Fantôme",
        CardType.REVE,
        Rarity.UNCOMMON,
        "15 dmg. Écho: prochain tour 8 dmg.",
        [
            { type: "damage", value: 15, modifiers: { typeBonus: true } },
            {
                type: "echo",
                turnsUntilTrigger: 1,
                echoEffect: { type: "damage", value: 8, modifiers: { typeBonus: true } }
            }
        ]
    ),

    new Card(
        "c16",
        "Cauchemar Récurrent",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "12 dmg. Écho: 2 tours, 6 dmg chacun.",
        [
            { type: "damage", value: 12, modifiers: { typeBonus: true } },
            {
                type: "echo",
                turnsUntilTrigger: 1,
                echoEffect: { type: "damage", value: 6, modifiers: { typeBonus: true } }
            },
            {
                type: "echo",
                turnsUntilTrigger: 2,
                echoEffect: { type: "damage", value: 6, modifiers: { typeBonus: true } }
            }
        ]
    ),

    // === COMBOS (4 cartes) ===
    new Card(
        "c11",
        "Enchaînement Onirique",
        CardType.REVE,
        Rarity.UNCOMMON,
        "8 dmg. +7 si précédente Rêve.",
        [
            {
                type: "damage",
                value: 8,
                condition: { type: "combo_previous_type", requiredType: CardType.REVE, bonus: 7 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c12",
        "Marée de Cauchemars",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "5 dmg. +4 par Cauchemar ce tour.",
        [
            {
                type: "damage",
                value: 5,
                condition: { type: "combo_count_type", requiredType: CardType.CAUCHEMAR, threshold: 1, bonusPerCount: 4 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c13",
        "Harmonie Transcendante",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "10 dmg. +8 si 2+ types différents.",
        [
            {
                type: "damage",
                value: 10,
                condition: { type: "combo_diversity", threshold: 2, bonus: 8 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c14",
        "Rituel du Rêve",
        CardType.REVE,
        Rarity.MYTHIQUE,
        "6 dmg. +18 si 3 Rêves ce tour.",
        [
            {
                type: "damage",
                value: 6,
                condition: { type: "combo_count_type", requiredType: CardType.REVE, threshold: 3, bonus: 18 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    // === CARTES À RISQUE (3 cartes) ===
    new Card(
        "c17",
        "Pacte Sanglant",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "30 dmg. Sacrifice: -15 PV.",
        [
            { type: "damage", value: 30, modifiers: { typeBonus: true } },
            { type: "sacrifice_hp", value: 15 }
        ]
    ),


    new Card(
        "c19",
        "Éveil Onirique",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "8 dmg. Prochain draft: 5 cartes.",
        [
            { type: "damage", value: 8, modifiers: { typeBonus: true } },
            { type: "modify_next_draft", cardsPerDraft: 5 }
        ]
    ),

    // === NOUVELLES MÉCANIQUES AVANCÉES (11 cartes) ===
    new Card(
        "c36",
        "À plus tard",
        CardType.TRANSCENDANT,
        Rarity.COMMUNE,
        "Bloque 5. Pioche 1.",
        [
            { type: "block", value: 5 },
            { type: "draw", value: 1 }
        ]
    ),

    new Card(
        "c37",
        "Justice",
        CardType.REVE,
        Rarity.RARE,
        "Soigne 5. Bloque 5. 5 dmg. Pioche 1.",
        [
            { type: "heal", value: 5 },
            { type: "block", value: 5 },
            { type: "damage", value: 5, modifiers: { typeBonus: true } },
            { type: "draw", value: 1 }
        ]
    ),

    new Card(
        "c38",
        "Mmm encore...",
        CardType.REVE,
        Rarity.UNCOMMON,
        "Soigne 10. HoT: 5 PV pendant 2 tours.",
        [
            { type: "heal", value: 10 },
            { type: "heal_over_time", healPerTurn: 5, duration: 2 }
        ]
    ),

    new Card(
        "c39",
        "Hyper potion",
        CardType.REVE,
        Rarity.RARE,
        "Soigne X. X = nb cartes deck si impair.",
        [
            { type: "deck_count_heal", parity: "odd" }
        ]
    ),

    new Card(
        "c40",
        "Gros caillou",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "X dmg. X = nb cartes deck si pair.",
        [
            { type: "deck_count_damage", parity: "even" }
        ]
    ),

    new Card(
        "c41",
        "Savoir attendre",
        CardType.CAUCHEMAR,
        Rarity.UNCOMMON,
        "Si carte précédente 0 dmg → prochaine x2 dmg.",
        [
            { type: "next_card_damage_multiplier", multiplier: 2 }
        ]
    ),

    new Card(
        "c42",
        "Réconfort",
        CardType.REVE,
        Rarity.UNCOMMON,
        "Si carte précédente fit dmg → prochain soin x2.",
        [
            { type: "next_card_heal_multiplier", multiplier: 2 }
        ]
    ),

    new Card(
        "c43",
        "Mon précieux",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Pioche 1 + pioche par Rare en main.",
        [
            { type: "draw", value: 1 },
            { type: "draw_per_rarity" }
        ]
    ),

    new Card(
        "c44",
        "Oups Eureka",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Bloque 5. 50% chance mythique on top.",
        [
            { type: "block", value: 5 },
            { type: "random_mythic_to_top" }
        ]
    ),

    new Card(
        "c45",
        "Coup de chance",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Draft Rare aléatoire, jouée immédiatement.",
        [
            { type: "active_draft", rarity: Rarity.RARE, cardsToShow: 3 }
        ]
    ),

    new Card(
        "c46",
        "Partie de chasse",
        CardType.TRANSCENDANT,
        Rarity.MYTHIQUE,
        "Draft Mythique aléatoire. -25 PV.",
        [
            { type: "sacrifice_hp", value: 25 },
            { type: "active_draft", rarity: Rarity.MYTHIQUE, cardsToShow: 3 }
        ]
    ),


    // === CARTES SUPPLÉMENTAIRES PUISSANTES (16 cartes) ===
    new Card(
        "c20",
        "Lame Puissante",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "Inflige 18 dégâts.",
        [
            { type: "damage", value: 18, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c21",
        "Souffle Vital",
        CardType.TRANSCENDANT,
        Rarity.COMMUNE,
        "Soigne 12 PV.",
        [
            { type: "heal", value: 12 }
        ]
    ),

    new Card(
        "c22",
        "Égide d'Acier",
        CardType.CAUCHEMAR,
        Rarity.COMMUNE,
        "Bloque 15 dégâts.",
        [
            { type: "block", value: 15 }
        ]
    ),

    new Card(
        "c23",
        "Poing de Lumière",
        CardType.REVE,
        Rarity.COMMUNE,
        "Inflige 14 dégâts.",
        [
            { type: "damage", value: 14, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c24",
        "Invocation Dorée",
        CardType.REVE,
        Rarity.RARE,
        "8 dmg + invoque carte Rare.",
        [
            { type: "damage", value: 8, modifiers: { typeBonus: true } },
            { type: "invoke", filter: { rarity: Rarity.RARE } }
        ]
    ),

    new Card(
        "c25",
        "Rage Noire",
        CardType.CAUCHEMAR,
        Rarity.UNCOMMON,
        "Inflige 16 dégâts.",
        [
            { type: "damage", value: 16, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c26",
        "Aura Protectrice",
        CardType.TRANSCENDANT,
        Rarity.UNCOMMON,
        "Bloque 12 dégâts.",
        [
            { type: "block", value: 12 }
        ]
    ),

    new Card(
        "c27",
        "Torrent Onirique",
        CardType.REVE,
        Rarity.RARE,
        "Inflige 22 dégâts.",
        [
            { type: "damage", value: 22, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c28",
        "Ombre Meurtrière",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "Inflige 20 dégâts.",
        [
            { type: "damage", value: 20, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c29",
        "Gardien Transcendant",
        CardType.TRANSCENDANT,
        Rarity.UNCOMMON,
        "10 dmg + bloque 8.",
        [
            { type: "damage", value: 10, modifiers: { typeBonus: true } },
            { type: "block", value: 8 }
        ]
    ),

    new Card(
        "c30",
        "Espoir Éternel",
        CardType.REVE,
        Rarity.UNCOMMON,
        "6 dmg + soigne 6 PV.",
        [
            { type: "damage", value: 6, modifiers: { typeBonus: true } },
            { type: "heal", value: 6 }
        ]
    ),

    new Card(
        "c31",
        "Malédiction",
        CardType.CAUCHEMAR,
        Rarity.MYTHIQUE,
        "Dans 3 tours: 40 dmg.",
        [
            {
                type: "delayed",
                turnsUntilTrigger: 3,
                delayedEffect: { type: "damage", value: 40, modifiers: { typeBonus: true } }
            }
        ]
    ),

    new Card(
        "c32",
        "Bouclier Vivant",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Bloque 20 dégâts.",
        [
            { type: "block", value: 20 }
        ]
    ),

    new Card(
        "c33",
        "Lame de Rêve",
        CardType.REVE,
        Rarity.MYTHIQUE,
        "Inflige 28 dégâts.",
        [
            { type: "damage", value: 28, modifiers: { typeBonus: true } }
        ]
    ),

    new Card(
        "c34",
        "Apocalypse",
        CardType.CAUCHEMAR,
        Rarity.MYTHIQUE,
        "10 dmg. x5 si dernière position.",
        [
            {
                type: "damage",
                value: 10,
                condition: { type: "finisher", multiplier: 5 },
                modifiers: { typeBonus: true }
            }
        ]
    ),

    new Card(
        "c35",
        "Harmonie Parfaite",
        CardType.TRANSCENDANT,
        Rarity.MYTHIQUE,
        "15 dmg + soigne 10 + bloque 10.",
        [
            { type: "damage", value: 15, modifiers: { typeBonus: true } },
            { type: "heal", value: 10 },
            { type: "block", value: 10 }
        ]
    ),

    // === NOUVELLES CARTES - BATCH 1 (Simples) ===
    
    new Card(
        "c48",
        "Brume Prodigieuse",
        CardType.TRANSCENDANT,
        Rarity.UNCOMMON,
        "Freeze ennemi 1 tour. Pioche 1.",
        [
            { type: "freeze_enemy", duration: 1 },
            { type: "draw", value: 1 }
        ]
    ),

    new Card(
        "c49",
        "Chaud Froid",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Freeze ennemi 1 tour. Heal 10.",
        [
            { type: "freeze_enemy", duration: 1 },
            { type: "heal", value: 10 }
        ]
    ),

    new Card(
        "c50",
        "Ralentissement",
        CardType.CAUCHEMAR,
        Rarity.RARE,
        "12 dmg. Si dernière position → Freeze ennemi 1 tour.",
        [
            {
                type: "damage",
                value: 12,
                modifiers: { typeBonus: true }
            },
            {
                type: "conditional_freeze",
                condition: { type: "finisher" },
                duration: 1
            }
        ]
    ),

    new Card(
        "c51",
        "Double Potion",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Bloque 12. Heal 12.",
        [
            { type: "block", value: 12 },
            { type: "heal", value: 12 }
        ]
    ),

    new Card(
        "c52",
        "Abracadrabra",
        CardType.TRANSCENDANT,
        Rarity.RARE,
        "Invoque 3 cartes aléatoires (Commune).",
        [
            { type: "invoke", filter: { rarity: Rarity.COMMUNE } },
            { type: "invoke", filter: { rarity: Rarity.COMMUNE } },
            { type: "invoke", filter: { rarity: Rarity.COMMUNE } }
        ]
    ),
    // === BATCH 1 - NOUVELLES CARTES (8 cartes)

new Card(
    "sanctuaire",
    "Sanctuaire",
    CardType.REVE,
    Rarity.RARE,
    "Bloque 12. Les 2 prochaines cartes de soin jouées soignent +5.",
    [
        { type: "block", value: 12 },
        { type: "modify_next_heal", cardsAffected: 2, healBonus: 5 }
    ]
),

new Card(
    "premonition",
    "Prémonition",
    CardType.REVE,
    Rarity.UNCOMMON,
    "Bloque 5. Pioche 2 cartes Rêve de notre deck.",
    [
        { type: "block", value: 5 },
        { type: "search_type_to_hand", cardType: CardType.REVE, count: 2 }
    ]
),

new Card(
    "seconde_chance",
    "Seconde Chance",
    CardType.TRANSCENDANT,
    Rarity.RARE,
    "Bloque 5. Récupère 2 cartes de la défausse en main.",
    [
        { type: "block", value: 5 },
        { type: "recover_from_discard", count: 2 }
    ]
),

new Card(
    "acouphenes",
    "Acouphènes",
    CardType.REVE,
    Rarity.RARE,
    "10 dmg. Écho: 3 tours (15 dmg chacun).",
    [
        { type: "damage", value: 10, modifiers: { typeBonus: true } },
        { type: "echo", turnsUntilTrigger: 1, echoEffect: { type: "damage", value: 15, modifiers: { typeBonus: true } } },
        { type: "echo", turnsUntilTrigger: 2, echoEffect: { type: "damage", value: 15, modifiers: { typeBonus: true } } },
        { type: "echo", turnsUntilTrigger: 3, echoEffect: { type: "damage", value: 15, modifiers: { typeBonus: true } } }
    ]
),

new Card(
    "vide_existentiel",
    "Vide Existentiel",
    CardType.CAUCHEMAR,
    Rarity.RARE,
    "15 dmg. Si ta défausse > 20 cartes, ennemi perd 10 HP supplémentaires.",
    [
        { type: "damage", value: 15, modifiers: { typeBonus: true } },
        { type: "conditional_damage", condition: { type: "discard_count", threshold: 20 }, value: 10 }
    ]
),

new Card(
    "deja_vu",
    "Déjà-Vu",
    CardType.REVE,
    Rarity.UNCOMMON,
    "Refais l'action de ta dernière carte jouée (dégâts, soin, blocage uniquement).",
    [
        { type: "repeat_previous_action" }
    ]
),

new Card(
    "gambit",
    "Gambit",
    CardType.CAUCHEMAR,
    Rarity.RARE,
    "50% chance: 30 dmg. 50% chance: -5 PV.",
    [
        { type: "gambit_roll" }
    ]
),

new Card(
    "boomerang",
    "Boomerang",
    CardType.TRANSCENDANT,
    Rarity.UNCOMMON,
    "Bloque 6. Renvoie la moitié des dégâts reçus ce tour.",
    [
        { type: "block", value: 6 },
        { type: "reflect_damage", damageMultiplier: 0.5 }
    ]
),

new Card(
    "reborn",
    "Reborn",
    CardType.REVE,
    Rarity.MYTHIQUE,
    "Si <20% HP → Full heal + Pioche 2.",
    [
        { type: "conditional_heal_and_draw", condition: { type: "low_hp", threshold: 0.2 } }
    ]
),

new Card(
    "sacrifice_rituel",
    "Sacrifice Rituel",
    CardType.CAUCHEMAR,
    Rarity.MYTHIQUE,
    "-30 PV. Ajoute 3 cartes Mythiques en main.",
    [
        { type: "sacrifice_hp", value: 30 },
        { type: "invoke_mythics", count: 3 }
    ]
)

];
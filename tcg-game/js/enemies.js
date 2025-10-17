import { Enemy, CardType } from './constants.js';

// ========================================
// ENEMY FACTORY
// ========================================

export class EnemyFactory {
    static createEnemy(id) {
        switch(id) {
            case 0: return this.createBasicEnemy();
            case 1: return this.createArchimageEnemy();
            case 2: return this.createBeteEnemy();
            case 3: return this.createChronophageEnemy();
            case 4: return this.createFossoyeurEnemy();
            case 5: return this.createReflecteurEnemy();
            case 6: return this.createVoleurDePoule();
            case 7: return this.createBalourd();
            case 8: return this.createIllusionnisteFou();
            case 9: return this.createCyclone();
            default: return this.createBasicEnemy();
        }
    }

static createBasicEnemy() {
        const enemy = new Enemy("Petit con", 150, CardType.CAUCHEMAR, [
            { name: "Griffe", damage: 10 },
            { name: "Morsure", damage: 15 }
        ]);
        enemy.abilityName = "Aucune";
        enemy.abilityDescription = "Ennemi basique sans capacité";
        return enemy;
    }

    static createArchimageEnemy() {
        const enemy = new Enemy("Ouvrier fou", 150, CardType.TRANSCENDANT, [
            { name: "Boulons", damage: 8 },
            { name: "Boule de Boulons", damage: 21 }
        ], (gm) => {
            // ⚠️ CAS SPÉCIAL : Override function (gardé tel quel)
            const original = gm.performDraft.bind(gm);
            gm.performDraft = function() {
                this.gameRules.cardsPerDraft = (this.draftCount % 2 === 0) ? 2 : 3;
                original();
            };
        });
        enemy.abilityName = "Distorsion Temporelle";
        enemy.abilityDescription = "1 draft/2 propose 2 cartes au lieu de 3";
        return enemy;
    }

    static createBeteEnemy() {
        const enemy = new Enemy("Bête Enragée", 150, CardType.CAUCHEMAR, [
            { name: "Morsure", damage: 10 },
            { name: "Charge", damage: 14 }
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "damage_per_turn",
                value: 10,
                trigger: "end_of_turn"
            });
        });
        enemy.abilityName = "Frénésie";
        enemy.abilityDescription = "Bête pas contente. Vous perdez 10 PV par tour";
        return enemy;
    }

    static createChronophageEnemy() {
        const enemy = new Enemy("Chronophage", 110, CardType.TRANSCENDANT, [
            { name: "Distorsion", damage: 12 },
            { name: "Accélération", damage: 16 }
        ], (gm) => {
            gm.gameRules.draftCount = 3;
        });
        enemy.abilityName = "Dévoreur de Temps";
        enemy.abilityDescription = "3 drafts par tour au lieu de 4";
        return enemy;
    }

    static createFossoyeurEnemy() {
        const enemy = new Enemy("Fossoyeur", 140, CardType.CAUCHEMAR, [
            { name: "Faux", damage: 12 },
            { name: "Fauchage", damage: 18 }
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "banish_from_discard",
                count: 3,
                trigger: "start_of_turn"
            });
        });
        enemy.abilityName = "Entropie";
        enemy.abilityDescription = "Bannit 3 cartes de défausse chaque tour";
        return enemy;
    }

    static createReflecteurEnemy() {
        const enemy = new Enemy("Miroir Brisé", 150, CardType.TRANSCENDANT, [
            { name: "Reflet", damage: 10 },
            { name: "Inversion", damage: 13 }
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "reverse_heal_damage"
            });
        });
        enemy.abilityName = "Réalité Inversée";
        enemy.abilityDescription = "Soins blessent, dégâts soignent (50%)";
        return enemy;
    }

    static createVoleurDePoule() {
        const enemy = new Enemy("Voleur de poule", 160, CardType.TRANSCENDANT, [
            { name: "Plumer", damage: 8 },
            { name: "Désosser", damage: 12 }
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "banish_drafted",
                trigger: "start_of_turn"
            });
        });
        enemy.abilityName = "Pickpoulet";
        enemy.abilityDescription = "Bannit 1 carte draftée aléatoire chaque tour";
        return enemy;
    }

    static createBalourd() {
        const enemy = new Enemy("Balourd", 175, CardType.CAUCHEMAR, [
            { name: "Baffe", damage: 10 },
            { name: "Grosse baffe", damage: 15 },
            { name: "Pansement", damage: -10 } // heal
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "block_every_n_cards",
                trigger: "play",
                n: 2,
                blockAmount: 10
            });
        });
        enemy.abilityName = "Armure Lourde";
        enemy.abilityDescription = "Bloque 10 toutes les deux cartes jouées";
        return enemy;
    }

    static createIllusionnisteFou() {
        const enemy = new Enemy("Illusionniste Fou", 160, CardType.REVE, [
            { name: "Confusion", damage: 11 },
            { name: "Frappe Mentale", damage: 15 },
            { name: "Pshhh", damage: -15 } // heal
        ], (gm) => {
            gm.enemyAbilities.push({
                type: "lure_card_drafted",
                trigger: "draft"
            });
        });
        enemy.abilityName = "Miroir Brisé";
        enemy.abilityDescription = "1 carte sur 3 au draft est un leurre (0 effet)";
        return enemy;
    }

    static createCyclone() {
        const enemy = new Enemy("Cyclone", 150, CardType.TRANSCENDANT, [
            { name: "Il arrive", damage: 0 },
            { name: "Le vent se lève", damage: 5 },
            { name: "Un peu plus", damage: 10 },
            { name: "Vents violents", damage: 15 },
            { name: "Vents dévastateurs", damage: 25 },
            { name: "Accalmie", damage: 0 },
            { name: "Oeil du cyclone", damage: 50 },
            { name: "Démembrement", damage: 100 }
        ]);
        enemy.abilityName = "Inéluctable";
        enemy.abilityDescription = "Attaques progressives: 0 → 5 → 10 → 15 → 25 → 0 → 50 → 100";
        return enemy;
    }

    static getAllEnemies() {
        return [
            { id: 0, ...this.createBasicEnemy() },
            { id: 1, ...this.createArchimageEnemy() },
            { id: 2, ...this.createBeteEnemy() },
            { id: 3, ...this.createChronophageEnemy() },
            { id: 4, ...this.createFossoyeurEnemy() },
            { id: 5, ...this.createReflecteurEnemy() },
            { id: 6, ...this.createVoleurDePoule() },
            { id: 7, ...this.createBalourd() },
            { id: 8, ...this.createIllusionnisteFou() },
            { id: 9, ...this.createCyclone() }
        ];
    }

    
}
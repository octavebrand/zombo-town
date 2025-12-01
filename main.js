// ========================================
// MAIN.JS - Point d'entrée (Jour 1 - Test rendu uniquement)
// ========================================

import { Card, Maxxer, Rarity, EnemyCard, CardType } from './constants.js';
import { BoardState } from './board.js';
import { UIManager } from './ui.js';
import { EffectResolver } from './effects.js';  
import { TurnResolver } from './turnResolver.js';
import { ALL_CARDS } from './cards.js';
import { ENEMY_CARDS_POOL } from './enemyCards.js';
import { STATE_REWARDS_POOL, getTierFromValue, getRandomRewards } from './stateRewards.js';
import { TOKENS, createToken } from './tokens.js';
import { ALL_CHARMS } from './charms.js';
import { ALL_ATOUTS } from './atouts.js';
import { getDeckById } from './prebuiltDecks.js';
import { DeckSelectionUI } from './deckSelection.js';
import { SHOP_REWARDS } from './shopRewards.js';
import { FortressSystem } from './fortressSystem.js';
import { FusionSystem } from './fusionsystem.js';

// ========================================
// CONSTANTES DE JEU
// ========================================

const GAME_CONFIG = {
    STARTING_HAND: 5,
    DRAW_PER_TURN: 0,
    MAX_HAND_SIZE: 10
};

/**
 * PRE-CONSTRUIT 
 */
function buildDeckFromConfig(deckConfig) {
    // Si flag "all", retourner toutes les cartes
    if (deckConfig.cards === 'all') {
        return [
            ...ALL_CARDS.map(card => ({...card})),
            ...ALL_CHARMS.map(card => ({...card}))
        ];
    }
    
    // Sinon, construire deck depuis la liste
    const deck = [];
    
    // Pool complet de cartes disponibles
    const allAvailableCards = [
        ...ALL_CARDS,
        ...ALL_CHARMS
    ];
    
    // Pour chaque entrée dans le deck config
    deckConfig.cards.forEach(entry => {
        const card = allAvailableCards.find(c => c.id === entry.cardId);
        
        if (!card) {
            console.warn(`⚠️ Carte introuvable: ${entry.cardId}`);
            return;
        }
        
        // Ajouter N copies
        for (let i = 0; i < entry.count; i++) {
            deck.push({...card});  // Copie profonde
        }
    });
    
    console.log(`✅ Deck construit: ${deck.length} cartes`);
    return deck;
}


// ========================================
// GAME MANAGER MINIMAL 
// ========================================

class GameManagerStub {
    constructor(deckConfig = null) {
        // Board
        this.board = new BoardState(this);
        
        // Maxxers
        this.maxxers = {
            damage: new Maxxer('damage'),
            block: new Maxxer('block')
        };
        
        // Player
        this.player = {
            currentHp: 150,
            maxHp: 150
        };
        
        // Enemy
        this.enemy = {
            currentHp: 200,
            maxHp: 200,
            attackDamage: 25
        };

        // Logs
        this.logs = [
            'Bienvenue dans le prototype v2.0',
            'Board initialisé avec 2 slots permanents aléatoires',
            'Prêt pour les tests !'
        ];

        // selection mode for fortress system rewards
        this.selectionMode = null; // 'protect_card', 'destroy_enemy', ou null
        
        // Deck/Défausse - Construction depuis config ou all cards
        if (deckConfig) {
            this.deck = buildDeckFromConfig(deckConfig);
            this.log(`🎴 Deck chargé: "${deckConfig.name}" (${this.deck.length} cartes)`);
        } else {
            // Fallback: toutes les cartes
            this.deck = [
                ...ALL_CARDS.map(card => ({...card})),
                ...ALL_CHARMS.map(card => ({...card}))
            ];
            this.log('🎴 Deck par défaut: Collection Complète');
        }

        this.discard = [];
        this.shuffleDeck();
        this.hand = this.drawInitialHand(6);
        // State
        this.playerResolved = false;

        this.turnNumber = 1;

        this.marchandises = 0;

        //FORTRESS SYSYTEM BLOCK ENTITY
        this.fortressSystem = new FortressSystem(this);

        this.fusionSystem = new FusionSystem(this);

        // NOUVEAU: Système d'atouts
        this.unlockedPlayerSlots = 0; // 0, 1, 2, ou 3
        this.availableAtouts = []; // Pool d'atouts disponibles
        this.placedAtouts = []; // Atouts déjà placés

        // Charger atouts depuis deck config
        if (deckConfig && deckConfig.atouts) {
            deckConfig.atouts.forEach(atoutId => {
                const atout = ALL_ATOUTS.find(a => a.id === atoutId);
                if (atout) {
                    this.availableAtouts.push({...atout});
                }
            });
            this.log(`🏛️ Atouts disponibles: ${this.availableAtouts.length}`);
        } else {
            // Fallback: 3 atouts aléatoires
            const shuffled = [...ALL_ATOUTS].sort(() => Math.random() - 0.5);
            this.availableAtouts = shuffled.slice(0, 3).map(a => ({...a}));
            this.log('🏛️ Atouts aléatoires sélectionnés');
        }

        // Ciblage
        this.currentTarget = 'enemy';
        
        // Tracking défausses ce tour
        this.discardsThisTurn = [];

        this.effectResolver = new EffectResolver(this);
        this.ui = null;

        this.turnResolver = new TurnResolver(this);

        // STATE rewards
        this.stateValue = 0;
        this.stateTier = 0;
        this.pendingStateRewards = [];  // Rewards à appliquer en fin de tour
        this.pendingSlotBonuses = [];   // bonus a appliquer au tour suivant

        this.gameOver = false;
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        this.log('🔀 Deck mélangé');
    }

    drawInitialHand(count) {
        const hand = [];
        for (let i = 0; i < count; i++) {
            if (this.deck.length > 0) {
                hand.push(this.deck.pop());
            }
        }
        this.log(`🎴 Main initiale: ${count} cartes`);
        return hand;
    }

    placeCardOnSlot(cardIndex, slotId) {
        const card = this.hand[cardIndex];
        const slot = this.board.getSlot(slotId);
        
        if (!card) {
            return { success: false, reason: "Carte introuvable" };
        }
        
        if (!slot) {
            return { success: false, reason: "Slot introuvable" };
        }

        // SI CARTE = CHARME
        if (card.cardType === CardType.CHARM) {
            // Vérifier qu'il y a une créature
            if (!slot.card) {
                return { success: false, reason: "Pas de créature sur ce slot" };
            }

            // Vérifier effets interdits sur shared
            if (slot.type === 'shared' && card.effect) {
                const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
                const hasNeighborEffect = effects.some(e => 
                    e.type === 'charm_boost_neighbors' || e.type === 'charm_penalty_neighbors'
                );
                
                if (hasNeighborEffect) {
                    return { success: false, reason: "Charmes voisins interdits sur SHARED" };
                }
            }
                    
            // Ajouter charme à la créature
            slot.equipments.push(card);
            this.hand.splice(cardIndex, 1);
            
            this.log(`✨ ${card.name} équipé sur ${slot.card.name}`);
            
            // Appliquer effets du charme
            this.applyCharmEffects(card, slot);
            // Trigger atouts "heal_on_charm_played"
            this.checkAtoutHealOnCharmPlayed();
            this.effectResolver.resolveCardEffects(card, slot.id);
            
            return { success: true };
        }
        
        // Vérifier compatibilité
        if (!slot.canAccept(card)) {
            return { success: false, reason: "Slot incompatible avec cette carte" };
        }
        
        // Placer la carte
        const result = this.board.placeCard(slotId, card);
        
        if (result.success) {
            // Retirer de la main
            this.hand.splice(cardIndex, 1);
            
        // Si carte a un timer, enregistrer le tour de pose
        if (card.timer) {
            card.turnPlaced = this.turnNumber;
        }

        // Si une ancienne carte était là, la remettre en main (ou défausser si main pleine)
        if (result.oldCard) {
            if (this.hand.length < GAME_CONFIG.MAX_HAND_SIZE) {
                this.hand.push(result.oldCard);
                this.log(`↩️ ${result.oldCard.name} retournée en main (remplacée)`);
            } else {
                this.discard.push(result.oldCard);
                this.log(`🗑️ ${result.oldCard.name} défaussée (main pleine)`);
            }
        }
            
            this.log(`✅ ${card.name} posée sur ${slotId}`);
            
            // Résoudre les effets de la carte
            this.effectResolver.resolveCardEffects(card, slotId);

            this.recalculateMaxxers();

            this.ui.render();
            
            return { success: true };
        }
        
        return { success: false, reason: "Placement impossible" };
    }

    placeAtoutOnSlot(atoutIndex, slotId) {
        const atout = this.availableAtouts[atoutIndex];
        const slot = this.board.getSlot(slotId);
        
        if (!atout || !slot || slot.type !== 'player') {
            return { success: false };
        }
        
        // Vérifier si slot déjà occupé
        if (slot.card) {
            return { success: false, reason: "Slot déjà occupé" };
        }
        
        // Placer atout
        slot.card = atout;
        this.placedAtouts.push(atout);
        
        // Retirer du pool
        this.availableAtouts.splice(atoutIndex, 1);
        
        this.log(`✅ ${atout.name} placé sur ${slotId}`);
        
        // Recalculer maxxers si stabilisateur
        this.recalculateMaxxers();
        
        return { success: true };
    }

    applyCharmEffects(charm, slot) {
        if (!charm.effect) return;
        
        const effects = Array.isArray(charm.effect) ? charm.effect : [charm.effect];
        
        effects.forEach(eff => {
            switch(eff.type) {
                case 'charm_maxxer_slot':
                    // Maxxer du slot
                    if (slot.type === 'damage') {
                        this.maxxers.damage.level += eff.value;
                    } else if (slot.type === 'block') {
                        this.maxxers.block.level += eff.value;
                    } else if (slot.id === 'shared_1') {
                        this.maxxers.damage.level += eff.value;
                        this.maxxers.block.level += eff.value;
                    } else if (slot.id === 'shared_2') {
                        this.maxxers.damage.level += eff.value;
                    }
                    this.log(`🔧 Maxxer +${eff.value}`);
                    break;
                    
                case 'charm_boost_neighbors':
                    // Voisins gagnent bonus
                    const neighbors = this.board.getNeighbors(slot.id);
                    neighbors.forEach(n => {
                        n.neighborBonus += eff.value;
                    });
                    this.log(`🔗 Voisins +${eff.value}`);
                    break;
                    
                case 'charm_penalty_neighbors':
                    // Voisins perdent value
                    const neighbors2 = this.board.getNeighbors(slot.id);
                    neighbors2.forEach(n => {
                        n.neighborBonus += eff.value;  // Négatif
                    });
                    this.log(`🔗 Voisins ${eff.value}`);
                    break;
                    
                case 'charm_random_boost':
                    // Boost aléatoire (stocké pour calcul final)
                    const randomBoost = Math.floor(Math.random() * (eff.max - eff.min + 1)) + eff.min;
                    charm._appliedBoost = randomBoost;  // Stocker sur le charme
                    this.log(`🎲 Boost aléatoire: +${randomBoost}`);
                    break;
                    
                case 'charm_boost_creature':
                    // Stocké pour calcul final
                    break;
                    
                case 'charm_heal_on_discard':
                    // Sera géré dans turnResolver
                    break;
            }
        });
    }

    recalculateMaxxers() {
        // Check si Stabilisateur actif
        const playerSlots = this.board.getSlotsByType('player');
        const stabilisateur = playerSlots.find(s => 
            s.card && s.card.id === 'stabilisateur'
        );
        
        // Reset avec base modifiée si Stabilisateur
        const baseLevel = stabilisateur ? 1 : 0;
        const maxLevel = stabilisateur ? 1 : Infinity;
        
        this.maxxers.damage.level = baseLevel;
        this.maxxers.block.level = baseLevel;
        // Scanner tous les slots
        const allSlots = this.board.getAllSlots();
        
        allSlots.forEach(slot => {
            if (!slot.card || !slot.card.effect) return;
            
            const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
            
            effects.forEach(eff => {
                if (eff.type === 'maxxer_dmg') {
                    this.maxxers.damage.level += eff.value;
                }
                if (eff.type === 'maxxer_block') {
                    this.maxxers.block.level += eff.value;
                }
                if (eff.type === 'maxxer_all') {
                    this.maxxers.damage.level += eff.value;
                    this.maxxers.block.level += eff.value;
                }
                if (eff.type === 'maxxer_any') {
                    // Boost selon type de slot
                    if (slot.type === 'damage') {
                        this.maxxers.damage.level += eff.value;
                    } else if (slot.type === 'block') {
                        this.maxxers.block.level += eff.value;
                    } else if (slot.id === 'shared_1') {
                        this.maxxers.damage.level += eff.value;
                        this.maxxers.block.level += eff.value;
                    } else if (slot.id === 'shared_2') {
                        this.maxxers.damage.level += eff.value;
                    }
                }
            });

        if (slot.equipments && slot.equipments.length > 0) {
                slot.equipments.forEach(charm => {
                    if (!charm.effect) return;
                    
                    const charmEffects = Array.isArray(charm.effect) ? charm.effect : [charm.effect];
                    
                    charmEffects.forEach(eff => {
                        if (eff.type === 'charm_maxxer_slot') {
                            // Appliquer maxxer selon type de slot
                            if (slot.type === 'damage') {
                                this.maxxers.damage.level += eff.value;
                            } else if (slot.type === 'block') {
                                this.maxxers.block.level += eff.value;
                            } else if (slot.id === 'shared_1') {
                                this.maxxers.damage.level += eff.value;
                                this.maxxers.block.level += eff.value;
                            } else if (slot.id === 'shared_2') {
                                this.maxxers.damage.level += eff.value;
                            }
                        }
                        
                        // Bonus: gérer aussi maxxer_dmg et maxxer_block des charmes
                        if (eff.type === 'maxxer_dmg') {
                            this.maxxers.damage.level += eff.value;
                        }
                        if (eff.type === 'maxxer_block') {
                            this.maxxers.block.level += eff.value;
                        }
                        if (eff.type === 'maxxer_all') {
                            this.maxxers.damage.level += eff.value;
                            this.maxxers.block.level += eff.value;
                        }
                    });
                });
            }

        });

        // Appliquer limite max si Stabilisateur
        if (stabilisateur) {
            this.maxxers.damage.level = Math.min(this.maxxers.damage.level, maxLevel);
            this.maxxers.block.level = Math.min(this.maxxers.block.level, maxLevel);
        }

    }

    getCardDisplayValue(card) {
        let value = card.value;
        
        // Bonus fusionLevel pour tokens Ombre
        if (card.id === 'token_ombre') {
            value += this.fusionSystem.getTokenValueBonus();
        }
        
        return value;
    }

    checkAtoutHealOnCharmPlayed() {
        const playerSlots = this.board.getSlotsByType('player');
        
        playerSlots.forEach(slot => {
            if (!slot.card || slot.card.cardType !== CardType.ATOUT) return;
            
            const atout = slot.card;
            if (!atout.effect || atout.effect.type !== 'atout_heal_on_charm_played') return;
            
            // Heal le joueur
            const oldHp = this.player.currentHp;
            this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + atout.effect.value);
            const actualHeal = this.player.currentHp - oldHp;
            
            if (actualHeal > 0) {
                this.log(`💚 ${atout.name}: Heal ${actualHeal} PV`);
            }
        });
    }

    reshuffle() {
        this.log('🔄 Reshuffle du deck');
        this.deck = [...this.discard];
        this.discard = [];
        
        // Mélanger
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    calculateStateValue() {
        let total = 0;
        
        this.board.slots.state.forEach(slot => {
            if (slot.card) {
                total += this.board.getFinalCardValue(slot.id);  // Utilise value finale
            }
        });
        
        const shared2 = this.board.getSlot('shared_2');
        if (shared2 && shared2.card) {
            total += this.board.getFinalCardValue('shared_2');  // Utilise value finale
        }
        
        this.stateValue = total;
        this.stateTier = getTierFromValue(total);
        
        return { value: total, tier: this.stateTier };
    }

    applyPendingSlotBonuses() {
        if (this.pendingSlotBonuses.length === 0) return;
        
        this.pendingSlotBonuses.forEach(bonus => {
            if (bonus.type === 'random') {
                // Récupérer tous les slots jouables (sauf enemy/player)
                const validSlots = this.board.getAllSlots().filter(slot => 
                    slot.type !== 'enemy' && slot.type !== 'player'
                );
                
                if (validSlots.length === 0) {
                    this.log(`⚠️ Random slot bonus: Aucun slot valide`);
                    return;
                }
                
                // Choisir aléatoirement (même vide)
                const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
                randomSlot.rewardBonus += bonus.value;
                
                this.log(`🎲 ${randomSlot.id}: +${bonus.value} bonus (total: ${randomSlot.bonus})`);
            }
            // Cas 'all'
            if (bonus.type === 'all') {
                const allSlots = this.board.getAllSlots().filter(slot => 
                    slot.type !== 'enemy' && slot.type !== 'player'
                );
                
                let count = 0;
                allSlots.forEach(slot => {
                    slot.rewardBonus += bonus.value;
                    count++;
                });
                
                this.log(`⭐ All slots: +${bonus.value} bonus (${count} slot(s))`);
            }

        });
        
        // Clear pending bonuses
        this.pendingSlotBonuses = [];
    }

    

    showStateRewardsPopup(tier, callback) {
        const rewards = getRandomRewards(tier, 2);
        
        if (rewards.length === 0) {
            callback(null);
            return;
        }
        
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';
        
        popup.innerHTML = `
            <h2 style="text-align: center; color: #FFD700; margin-bottom: 20px;">
                🌟 STATE TIER ${tier} REWARD
            </h2>
            <p style="text-align: center; margin-bottom: 20px;">Choisis un bonus :</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                ${rewards.map((reward, index) => `
                    <button id="reward_${index}" style="
                        padding: 20px;
                        background: rgba(255, 215, 0, 0.2);
                        border: 2px solid #FFD700;
                        border-radius: 10px;
                        color: #FFD700;
                        cursor: pointer;
                        font-size: 16px;
                        min-width: 150px;
                    ">
                        <div style="font-weight: bold; margin-bottom: 10px;">${reward.name}</div>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Handlers
        rewards.forEach((reward, index) => {
            document.getElementById(`reward_${index}`).onclick = () => {
                popup.style.display = 'none';
                callback(reward);
            };
        });
    }

    checkGameOver() {
        if (this.enemy.currentHp <= 0) {
            this.gameOver = true;
            return 'victory';
        } else if (this.player.currentHp <= 0) {
            this.gameOver = true;
            return 'defeat';
        }
        return null;
    }

    showGameOverScreen(result) {
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';
        
        const isVictory = result === 'victory';
        
        popup.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1 style="font-size: 60px; margin-bottom: 30px;">
                    ${isVictory ? '🎉 VICTOIRE !' : '💀 DÉFAITE !'}
                </h1>
                <p style="font-size: 24px; margin-bottom: 40px; color: ${isVictory ? '#4CAF50' : '#F44336'};">
                    ${isVictory ? 'Vous avez vaincu l\'ennemi !' : 'Vous avez été vaincu...'}
                </p>
                <button id="restartBtn" style="
                    padding: 20px 60px;
                    font-size: 24px;
                    background: ${isVictory ? '#4CAF50' : '#8B0000'};
                    border: 3px solid ${isVictory ? '#2E7D32' : '#FF0000'};
                    border-radius: 15px;
                    color: white;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    Rejouer
                </button>
            </div>
        `;
        
        document.getElementById('restartBtn').onclick = () => {
            location.reload(); // Recharger la page
        };
    }

    startNewTurn() {
        this.turnNumber++;
        this.playerResolved = false;
        
        this.log('═══════════════════════════════════');
        this.log(` TOUR ${this.turnNumber}`);
        this.log('═══════════════════════════════════');
        
        this.applyPendingSlotBonuses();

        // 1/3 chances pour que l'Ennemi pose 1 carte aléatoire
        if (Math.random() < 1/3) {
            this.enemyPlaceCard();
        }
        // Pioche automatique
        //this.drawCards(GAME_CONFIG.DRAW_PER_TURN);
    }

    enemyPlaceCard() {
        // Trouver un slot enemy vide
        const emptySlots = this.board.slots.enemy.filter(s => !s.card);
        
        if (emptySlots.length === 0) {
            this.log('⚠️ Ennemi: Tous les slots pleins');
            return;
        }
        
        // Choisir slot aléatoire
        const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        
        // Choisir carte aléatoire depuis pool (copie profonde COMPLÈTE)
        const randomCard = ENEMY_CARDS_POOL[Math.floor(Math.random() * ENEMY_CARDS_POOL.length)];
        const cardCopy = new EnemyCard(
            randomCard.id, 
            randomCard.name, 
            randomCard.maxHp, 
            randomCard.effect,
            randomCard.onDeath,  
            randomCard.timer     
        );
        
        // Enregistrer le tour de pose pour timer
        if (cardCopy.timer) {
            cardCopy.turnPlaced = this.turnNumber;
        }
        
        // Placer carte
        randomSlot.card = cardCopy;
        
        this.log(`👹 Ennemi pose: ${cardCopy.name} (${cardCopy.maxHp} HP) sur ${randomSlot.id}`);
    }

    setTarget(target) {
        this.currentTarget = target;
        const targetName = target === 'enemy' ? 'Ennemi principal' : `Carte ${target}`;
        this.log(`🎯 Cible: ${targetName}`);
    }

    drawCards(count) {
        let drawn = 0;
        
        for (let i = 0; i < count; i++) {
            // Limite main
            if (this.hand.length >= GAME_CONFIG.MAX_HAND_SIZE) {
                this.log(`⚠️ Main pleine (${GAME_CONFIG.MAX_HAND_SIZE} max)`);
                break;
            }
            
            // Reshuffle si deck vide
            if (this.deck.length === 0 && this.discard.length > 0) {
                this.reshuffle();
            }
            
            // Piocher
            if (this.deck.length > 0) {
                const card = this.deck.pop();
                this.hand.push(card);
                drawn++;
            }
        }
        
        if (drawn > 0) {
            this.log(`📥 Pioche: ${drawn} carte(s)`);
        } else {
            this.log(`⚠️ Impossible de piocher (deck vide)`);
        }
    }

    //shop reward purchase

    giveRandomShopReward(tier) {
        const rewards = SHOP_REWARDS[tier];
        if (!rewards || rewards.length === 0) {
            this.log(`❌ Aucune récompense disponible pour ${tier}`);
            return;
        }
        
        // Choisir une carte aléatoire
        const randomCard = rewards[Math.floor(Math.random() * rewards.length)];
        
        // Créer une copie et l'ajouter à la main
        const cardCopy = {...randomCard};
        this.hand.push(cardCopy);
        
        this.log(`✨ Acheté: ${cardCopy.name} (${tier})`);
    }

    // Ajouter un jeton en main
    addTokenToHand(tokenId) {
        if (this.hand.length >= GAME_CONFIG.MAX_HAND_SIZE) {
            this.log(`⚠️ Main pleine, jeton ${tokenId} défaussé`);
            const token = createToken(tokenId);
            if (token) this.discard.push(token);
            return false;
        }
        
        const token = createToken(tokenId, this.gm);
        if (!token) {
            this.log(`❌ Impossible de créer jeton ${tokenId}`);
            return false;
        }
        
        this.hand.push(token);
        this.log(`✨ Jeton ${token.name} ajouté en main`);
        return true;
    }

    
    log(message) {
        this.logs.push(message);
        console.log(message);
    }
}

/**
 * Initialise le jeu avec un deck spécifique
 */
function initGameWithDeck(deckId) {
    console.log(`🎴 Chargement du deck: ${deckId}`);
    
    // Récupérer config du deck
    const deckConfig = getDeckById(deckId);
    
    if (!deckConfig) {
        console.error(`❌ Deck introuvable: ${deckId}`);
        return;
    }
    
    // Créer game manager avec le deck
    game = new GameManagerStub(deckConfig);
    
    // Créer UI manager
    ui = new UIManager(game);
    game.ui = ui;
    
    // Render initial
    ui.render();
    
    console.log('✅ Jeu démarré avec succès !');
    
    // Exposer pour debug
    window.game = game;
    window.ui = ui;
    
    // Setup end turn button
    setupEndTurnButton();
}

/**
 * Configure le bouton de fin de tour
 */
function setupEndTurnButton() {
    document.getElementById('endTurnBtn').onclick = () => {

        if (game.gameOver) return;
        game.log('═══════════════════════════════════');
        game.log('🔚 FIN DE TOUR - Résolution...');
        game.log('═══════════════════════════════════');
        
        // Calculer STATE tier
        const stateData = game.calculateStateValue();
        
        // Si tier >= 0, proposer choix reward
        if (stateData.tier >= 0) {
            game.showStateRewardsPopup(stateData.tier, (chosenReward) => {
                if (chosenReward) {
                    game.pendingStateRewards.push(chosenReward);
                    game.log(`✨ Reward choisi: ${chosenReward.name}`);
                }
                // Résolution A→H
                const results = game.turnResolver.resolve();
                showResultsPopup(results, game, ui);
                ui.render();
                
                // Vérifier victoire/défaite
                const gameResult = game.checkGameOver();
                if (gameResult) {
                    setTimeout(() => game.showGameOverScreen(gameResult), 500);
                }
            });
        } else {
            // Pas de reward
            const results = game.turnResolver.resolve();
            showResultsPopup(results, game, ui);
            ui.render();
            
            const gameResult = game.checkGameOver();
            if (gameResult) {
                setTimeout(() => game.showGameOverScreen(gameResult), 500);
            }
        }
    };
}

/**
 * Affiche popup résultats du tour
 */
/**
 * Affiche popup résultats du tour
 */
function showResultsPopup(results, game, ui) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        padding: 0;
        z-index: 1000;
        border-radius: 20px;
    `;
    
    const playerDmg = results.playerDamageTaken;
    const enemyDmg = results.enemyDamageTaken;
    
    popup.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 30px;
            border-radius: 20px;
            border: 3px solid #0f3460;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        ">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 25px;">
                <h2 style="font-size: 28px; color: #FFD700; margin: 0;">⚔️ RÉSULTAT DU TOUR ${game.turnNumber} ⚔️</h2>
            </div>
            
            <!-- Battle Cards -->
            <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; margin-bottom: 25px;">
                
                <!-- JOUEUR -->
                <div style="
                    background: linear-gradient(135deg, #0f4c75 0%, #1b6ca8 100%);
                    padding: 20px;
                    border-radius: 15px;
                    border: 2px solid #3282b8;
                    text-align: center;
                ">
                    <div style="font-size: 18px; color: #FFD700; margin-bottom: 15px; font-weight: bold;">
                        JOUEUR
                    </div>
                    <div style="font-size: 48px; margin-bottom: 10px;">
                        ⚔️
                    </div>
                    <div style="font-size: 20px; color: #FF6347; font-weight: bold; margin-bottom: 5px;">
                        ${results.damageTotal} DMG
                    </div>
                    <div style="font-size: 20px; color: #4CAF50; font-weight: bold;">
                        ${results.blockTotal} BLOCK
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 20px; color: ${playerDmg > 0 ? '#FF6347' : '#4CAF50'};">
                            ❤️ ${playerDmg > 0 ? `-${playerDmg}` : 'Aucun dégât'}
                        </div>
                    </div>
                </div>
                
                <!-- VS -->
                <div style="
                    display: flex;
                    align-items: center;
                    font-size: 32px;
                    color: #FFD700;
                    font-weight: bold;
                ">
                    VS
                </div>
                
                <!-- ENNEMI -->
                <div style="
                    background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
                    padding: 20px;
                    border-radius: 15px;
                    border: 2px solid #FF6347;
                    text-align: center;
                ">
                    <div style="font-size: 18px; color: #FFD700; margin-bottom: 15px; font-weight: bold;">
                        ENNEMI
                    </div>
                    <div style="font-size: 48px; margin-bottom: 10px;">
                        💀
                    </div>
                    <div style="font-size: 20px; color: #FF6347; font-weight: bold; margin-bottom: 5px;">
                        ${results.enemyAttack} ATK
                    </div>
                    <div style="font-size: 20px; color: #4CAF50; font-weight: bold;">
                        ${results.enemyBlock || 0} BLOCK
                    </div>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <div style="font-size: 20px; color: ${enemyDmg > 0 ? '#4CAF50' : '#aaa'};">
                            💀 ${enemyDmg > 0 ? `-${enemyDmg}` : 'Aucun dégât'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Bouton -->
            <button id="nextTurnBtn" style="
                width: 100%;
                padding: 15px;
                font-size: 20px;
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                border: none;
                border-radius: 10px;
                color: #1a1a2e;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
                transition: all 0.2s;
            ">
                CONTINUER ⚡
            </button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Effet hover sur bouton
    const btn = document.getElementById('nextTurnBtn');
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    
    // Handler bouton nouveau tour
    btn.onclick = () => {
        popup.remove();
        game.startNewTurn();
        ui.render();
    };
}


// ========================================
// INITIALISATION
// ========================================

let game;
let ui;
let deckSelectionUI;

window.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initialisation du prototype v2.0...');
    
    // Créer UI de sélection de deck
    deckSelectionUI = new DeckSelectionUI();
    
    // Afficher l'écran de sélection
    deckSelectionUI.show((selectedDeckId) => {
        console.log(`✅ Deck sélectionné: ${selectedDeckId}`);
        
        // Initialiser le jeu avec le deck choisi
        initGameWithDeck(selectedDeckId);
    });
    
    console.log('✅ Écran de sélection affiché');
});
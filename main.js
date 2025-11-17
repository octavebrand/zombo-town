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
import { SHOP_REWARDS, SHOP_PRICES } from './shopRewards.js';

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
            ...ALL_CHARMS.map(card => ({...card})),
            ...ALL_ATOUTS.map(card => ({...card}))
        ];
    }
    
    // Sinon, construire deck depuis la liste
    const deck = [];
    
    // Pool complet de cartes disponibles
    const allAvailableCards = [
        ...ALL_CARDS,
        ...ALL_CHARMS,
        ...ALL_ATOUTS
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
// GAME MANAGER MINIMAL (pour test Jour 1)
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
        
        // Deck/Défausse - Construction depuis config ou all cards
        if (deckConfig) {
            this.deck = buildDeckFromConfig(deckConfig);
            this.log(`🎴 Deck chargé: "${deckConfig.name}" (${this.deck.length} cartes)`);
        } else {
            // Fallback: toutes les cartes
            this.deck = [
                ...ALL_CARDS.map(card => ({...card})),
                ...ALL_CHARMS.map(card => ({...card})),
                ...ALL_ATOUTS.map(card => ({...card}))
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

        // Ciblage
        this.currentTarget = 'enemy';
        
        // Tracking défausses ce tour
        this.discardsThisTurn = [];

        this.effectResolver = new EffectResolver(this);
        this.ui = null;

        this.turnResolver = new TurnResolver(this);
        
        // Test : Mettre une carte sur un slot aléatoire
        this.placeTestCard();

        // STATE rewards
        this.stateValue = 0;
        this.stateTier = 0;
        this.pendingStateRewards = [];  // Rewards à appliquer en fin de tour
        this.pendingSlotBonuses = [];   // bonus a appliquer au tour suivant
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

    placeTestCard() {
        // Plus besoin de carte de test, on a un vrai deck maintenant
        // this.log('Deck complet chargé');
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

            //this.applyNeighborBonusesToCard(slotId);

            this.recalculateMaxxers();

            this.ui.render();
            
            return { success: true };
        }
        
        return { success: false, reason: "Placement impossible" };
    }

    applyCharmEffects(charm, slot) {
        if (!charm.effect) return;
        
        const effects = Array.isArray(charm.effect) ? charm.effect : [charm.effect];
        
        effects.forEach(eff => {
            switch(eff.type) {
                case 'charm_maxxer_slot':
                    // Maxxer du slot
                    if (slot.type === 'damage' || slot.type === 'shared') {
                        this.maxxers.damage.level += eff.value;
                    }
                    if (slot.type === 'block' || slot.type === 'shared') {
                        this.maxxers.block.level += eff.value;
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

    /* applyNeighborBonusesToCard(slotId) {
        const slot = this.board.getSlot(slotId);
        if (!slot || !slot.card) return;
        
        const neighbors = this.board.getNeighbors(slotId);
        let totalBonus = 0;
        
        neighbors.forEach(neighborSlot => {
            if (neighborSlot.card && neighborSlot.card.effect) {
                const effects = Array.isArray(neighborSlot.card.effect) ? neighborSlot.card.effect : [neighborSlot.card.effect];
                
                effects.forEach(eff => {
                    if (eff.type === 'bonus_neighbors') {
                        totalBonus += eff.value;
                    }
                    if (eff.type === 'penalty_neighbors') {
                        totalBonus += eff.value;
                    }
                });
            }
        });
        
        slot.neighborBonus += totalBonus;
        
        if (totalBonus !== 0) {
            const sign = totalBonus > 0 ? '+' : '';
            this.log(`💫 ${slot.id}: bonus ${sign}${totalBonus} des voisins`);
        }
    } */

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
                    } else if (slot.type === 'shared') {
                        // Shared compte pour les 2
                        this.maxxers.damage.level += eff.value;
                        this.maxxers.block.level += eff.value;
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
                            if (slot.type === 'damage' || slot.type === 'shared') {
                                this.maxxers.damage.level += eff.value;
                            }
                            if (slot.type === 'block' || slot.type === 'shared') {
                                this.maxxers.block.level += eff.value;
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

    startNewTurn() {
        this.turnNumber++;
        this.playerResolved = false;
        
        this.log('═══════════════════════════════════');
        this.log(` TOUR ${this.turnNumber}`);
        this.log('═══════════════════════════════════');
        
        this.applyPendingSlotBonuses();

        // Ennemi pose 1 carte aléatoire
        if (this.turnNumber % 3 === 0) {
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
        
        const token = createToken(tokenId);
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
                
                // Popup récap
                showResultsPopup(results, game, ui);
                
                // Re-render
                ui.render();
                
                // Vérifier victoire/défaite
                if (game.enemy.currentHp <= 0) {
                    setTimeout(() => alert('🎉 VICTOIRE !'), 500);
                } else if (game.player.currentHp <= 0) {
                    setTimeout(() => alert('💀 DÉFAITE !'), 500);
                }
            });
        } else {
            // Pas de reward
            const results = game.turnResolver.resolve();
            showResultsPopup(results, game, ui);
            ui.render();
            
            if (game.enemy.currentHp <= 0) {
                setTimeout(() => alert('🎉 VICTOIRE !'), 500);
            } else if (game.player.currentHp <= 0) {
                setTimeout(() => alert('💀 DÉFAITE !'), 500);
            }
        }
    };
}

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
        border: 4px solid #FFD700;
        border-radius: 15px;
        padding: 30px;
        z-index: 1000;
        min-width: 400px;
        color: white;
        font-family: Arial;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
    `;
    
    popup.innerHTML = `
        <h2 style="text-align: center; color: #FFD700; margin-bottom: 20px;">📊 RÉSULTATS DU TOUR ${game.turnNumber}</h2>
        <div style="font-size: 16px; line-height: 1.8;">
                    <div>🎯 <strong>Cible:</strong> ${results.targetName}</div>
                    <div>💥 <strong>Dégâts bruts:</strong> ${results.damageTotal}</div>
                    ${results.enemyBlock > 0 ? `<div>🛡️ <strong>BLOCK ennemi:</strong> ${results.enemyBlock}</div>` : ''}
                    ${results.enemyBlock > 0 ? `<div style="color: #FFD700;">⚔️ <strong>Dégâts nets:</strong> ${results.damageTotal - results.enemyBlock}</div>` : ''}
                    <hr style="border-color: #FFD700; margin: 10px 0;">
                    <div>🛡️ <strong>Votre blocage:</strong> ${results.blockTotal}</div>
                    <div>⚔️ <strong>Attaque ennemie:</strong> ${results.enemyAttack}</div>
                    <hr style="border-color: #FFD700; margin: 15px 0;">
                    <div style="color: #FF6347;">💀 <strong>${results.targetName}:</strong> -${results.enemyDamageTaken} HP</div>
                    <div style="color: ${results.playerDamageTaken > 0 ? '#FF6347' : '#32CD32'};">
                        ❤️ <strong>Vous:</strong> ${results.playerDamageTaken > 0 ? '-' : ''}${results.playerDamageTaken} HP
                    </div>
        </div>
        <button id="nextTurnBtn" style="
            width: 100%;
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            color: #000;
        ">➡️ Tour suivant</button>
    `;
    
    document.body.appendChild(popup);
    
    // Handler bouton nouveau tour
    document.getElementById('nextTurnBtn').onclick = () => {
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
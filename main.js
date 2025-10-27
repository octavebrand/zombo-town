// ========================================
// MAIN.JS - Point d'entrée (Jour 1 - Test rendu uniquement)
// ========================================

import { Card, Maxxer, Rarity, EnemyCard } from './constants.js';
import { BoardState } from './board.js';
import { UIManager } from './ui.js';
import { EffectResolver } from './effects.js';  
import { TurnResolver } from './turnResolver.js';
import { ALL_CARDS } from './cards.js';
import { ENEMY_CARDS_POOL } from './enemyCards.js';
import { STATE_REWARDS_POOL, getTierFromValue, getRandomRewards } from './stateRewards.js';

// ========================================
// CONSTANTES DE JEU
// ========================================

const GAME_CONFIG = {
    STARTING_HAND: 5,
    DRAW_PER_TURN: 1,
    MAX_HAND_SIZE: 10
};

// ========================================
// GAME MANAGER MINIMAL (pour test Jour 1)
// ========================================

class GameManagerStub {
    constructor() {
        // Board
        this.board = new BoardState();
        
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
        
        // Deck/Défausse
        this.deck = [...ALL_CARDS].map(card => ({...card})); // Copie profonde
        this.discard = [];
        this.shuffleDeck();

        // Main (quelques cartes de test)
       this.hand = this.drawInitialHand(6);
        
        
        // State
        this.playerResolved = false;

        this.turnNumber = 1;

        // 🆕 Ciblage
        this.currentTarget = 'enemy';

        this.effectResolver = new EffectResolver(this);

        this.turnResolver = new TurnResolver(this);
        
        // Test : Mettre une carte sur un slot aléatoire
        this.placeTestCard();

        // 🆕 STATE rewards
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
        
        // Vérifier compatibilité
        if (!slot.canAccept(card)) {
            return { success: false, reason: "Slot incompatible avec cette carte" };
        }
        
        // Placer la carte
        const result = this.board.placeCard(slotId, card);
        
        if (result.success) {
            // Retirer de la main
            this.hand.splice(cardIndex, 1);
            
            // 🆕 Si une ancienne carte était là, la remettre en main (ou défausser si main pleine)
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
            
            // 🆕 Résoudre les effets de la carte
            this.effectResolver.resolveCardEffects(card, slotId);

            this.applyNeighborBonusesToCard(slotId);

            this.recalculateMaxxers();
            
            return { success: true };
        }
        
        return { success: false, reason: "Placement impossible" };
    }

    applyNeighborBonusesToCard(slotId) {
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
        
        // 🆕 Stocker sur le SLOT, pas sur la carte
        slot.bonus += totalBonus;
        
        if (totalBonus !== 0) {
            const sign = totalBonus > 0 ? '+' : '';
            this.log(`💫 ${slot.id}: bonus ${sign}${totalBonus} des voisins`);
        }
    }

    recalculateMaxxers() {
        // Reset à 0
        this.maxxers.damage.level = 0;
        this.maxxers.block.level = 0;
        
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
                total += slot.card.value + slot.bonus;
            }
        });
        
        this.board.slots.shared.forEach(slot => {
            if (slot.card) {
                total += slot.card.value + slot.bonus;
            }
        });
        
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
                randomSlot.bonus += bonus.value;
                
                this.log(`🎲 ${randomSlot.id}: +${bonus.value} bonus (total: ${randomSlot.bonus})`);
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
        this.log(`🆕 TOUR ${this.turnNumber}`);
        this.log('═══════════════════════════════════');
        
        this.applyPendingSlotBonuses();

        // 🆕 Ennemi pose 1 carte aléatoire
        if (this.turnNumber % 3 === 0) {
            this.enemyPlaceCard();
        }  
        // Pioche automatique
        this.drawCards(GAME_CONFIG.DRAW_PER_TURN);
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
        
        // Choisir carte aléatoire depuis pool (copie profonde)
        const randomCard = ENEMY_CARDS_POOL[Math.floor(Math.random() * ENEMY_CARDS_POOL.length)];
        const cardCopy = new EnemyCard(randomCard.id, randomCard.name, randomCard.maxHp, randomCard.effect);
        
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

    
    log(message) {
        this.logs.push(message);
        console.log(message);
    }
}

// ========================================
// INITIALISATION
// ========================================

let game;
let ui;

window.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initialisation du prototype v2.0...');
    
    // Créer game manager (stub pour test)
    game = new GameManagerStub();
    
    // Créer UI manager
    ui = new UIManager(game);
    
    // Render initial
    ui.render();
    
    console.log('✅ Board affiché ! Vérifiez :');
    console.log('- 16 slots positionnés (cercles)');
    console.log('- 2 slots avec bordure OR (permanents)');
    console.log('- 2 slots ROUGES (shared)');
    console.log('- 3 entités (BLOCK, DAMAGE, STATE)');
    console.log('- Maxxers affichés (x0.0)');
    console.log('- Info Player/Enemy');
    console.log('- 4 cartes en main');
    console.log('- 1 carte posée sur damage_top (pour test)');
    
    // Exposer pour debug console
    window.game = game;
    window.ui = ui;
    
    document.getElementById('endTurnBtn').onclick = () => {
        game.log('═══════════════════════════════════');
        game.log('🔚 FIN DE TOUR - Résolution...');
        game.log('═══════════════════════════════════');
        
        // 🆕 Calculer STATE tier
        const stateData = game.calculateStateValue();
        
        // 🆕 Si tier >= 0, proposer choix reward
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
            // Pas de reward (ne devrait jamais arriver car tier0 existe)
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
        
        // 🆕 Handler bouton nouveau tour
        document.getElementById('nextTurnBtn').onclick = () => {
            popup.remove();
            game.startNewTurn();
            ui.render();
        };
    }
    
});
import { GameState, GameRules, Player, Rarity } from './constants.js';
import { EnemyFactory } from './enemies.js';
import { ALL_CARDS } from './cards.js';
import { EffectResolver } from './effects.js';
import { DeckBuilder } from './deckBuilder.js';

// ========================================
// INPUT MANAGER
// ========================================

class InputManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.selectedIndex = 0;
        document.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        if (this.gm.state === GameState.VICTORY || this.gm.state === GameState.DEFEAT) return;

        if (e.key === 'ArrowLeft') this.navigate(-1);
        else if (e.key === 'ArrowRight') this.navigate(1);
        else if (e.key === 'Enter') this.select();
    }

    navigate(direction) {
        const options = this.getOptions();
        if (options.length === 0) return;

        this.selectedIndex = (this.selectedIndex + direction + options.length) % options.length;
        this.gm.render();
    }

    select() {
        const options = this.getOptions();
        if (options.length === 0) return;

        if (this.gm.state === GameState.DRAFT) {
            this.gm.handleDraftSelection(this.selectedIndex);
        } else if (this.gm.state === GameState.ACTIVE_DRAFT) {
            this.gm.handleActiveDraftSelection(this.selectedIndex);
        } else if (this.gm.state === GameState.PLAY_SELECT) {
            this.gm.handlePlaySelection(this.selectedIndex);
        }
    }

    getOptions() {
        if (this.gm.state === GameState.DRAFT) return this.gm.currentDraftOptions;
        if (this.gm.state === GameState.ACTIVE_DRAFT) return this.gm.activeDraftOptions;
        if (this.gm.state === GameState.PLAY_SELECT) return this.gm.hand;
        return [];
    }

    resetSelection() {
        this.selectedIndex = 0;
    }
}

// ========================================
// GAME MANAGER
// ========================================

class GameManager {
    constructor(enemyId) {
        this.state = GameState.DRAFT;
        this.gameRules = new GameRules();
        this.player = new Player(100);
        this.enemy = EnemyFactory.createEnemy(enemyId);
        this.deck = [];
        this.hand = [];
        this.discard = [];
        this.banished = [];
        this.keptCards = [];
        this.permanentEffects = [];
        this.delayedEffects = [];
        this.draftCount = 0;
        this.cardsPlayedThisTurn = 0;
        this.cardsPlayedThisTurnList = [];
        this.currentDraftOptions = [];
        this.activeDraftOptions = [];
        this.activeDraftPendingResolve = false;
        this.effectResolver = new EffectResolver(this);
        this.inputManager = new InputManager(this);
        this.logMessages = [];
        this.draftedCardsThisTurn = [];  // 🆕 Historique draft
        this.playedCardsHistory = [];     // 🆕 Historique jeu (différent de cardsPlayedThisTurnList)
        this.nextHealModifier = null;
        this.damageBlockedThisAction = 0;
        this.pendingReflection = null;
        
        // Enemy abilities flags
        this.draftedCardsThisTurn = [];  // 🆕 Historique draft
        this.playedCardsHistory = [];     // 🆕 Historique jeu

        // 🆕 SYSTÈME GÉNÉRIQUE DE CAPACITÉS
        this.enemyAbilities = [];
        
        // Flags legacy (à supprimer progressivement)
        this.skipNextDraftFlag = false;
        this.nextDraftModified = null;
        this.enemyFrozenAttacks = 0; // Nombre d'attaques à skip
        this.nextCardDamageMultiplier = 1;
        this.nextCardHealMultiplier = 1;
        this.customDeck = null;

        this.initializeDeck();
        this.shuffleDeck();
        
        if (this.enemy.ability) {
            this.enemy.ability(this);
            this.log(`⚠️ Capacité: ${this.enemy.abilityName}`);
        }
        
        this.startDraftPhase();
        this.render();
    }

    initializeDeck() {
        this.deck = [];

        if (this.customDeck && this.customDeck.length > 0) {
            console.log("Deck custom chargé:", this.customDeck.length, "cartes");
            this.deck.push(...this.customDeck.map(card => ({...card})));
        } else {
            console.log("Deck standard chargé");
            this.deck.push(...ALL_CARDS.map(card => ({...card})));
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    reshuffle() {
        this.log("🔄 Reshuffle");
        this.deck = [...this.discard];
        this.discard = [];
        this.shuffleDeck();
    }

    drawCards(count) {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) this.reshuffle();
            if (this.deck.length > 0) drawn.push(this.deck.pop());
        }
        return drawn;
    }

    // ========================================
    // DRAFT PHASE
    // ========================================
    startDraftPhase() {
        this.state = GameState.DRAFT;
        this.draftCount = 0;
        this.cardsPlayedThisTurnList = [];
        this.playedCardsHistory = [];
        
        // Reset multiplicateurs
        this.nextCardDamageMultiplier = 1;
        this.nextCardHealMultiplier = 1;
        
        // Remettre les cartes kept en main
        if (this.keptCards.length > 0) {
            this.keptCards.forEach(card => this.hand.push(card));
            this.log(`🔄 ${this.keptCards.length} carte(s) gardée(s) retourne(nt) en main`);
            this.keptCards = [];
        }
        
        // Check fusion unicorns après avoir remis les kept cards
        this.effectResolver.checkUnicornFusion();
        
        if (this.nextDraftModified) {
            this.gameRules.cardsPerDraft = this.nextDraftModified.cardsPerDraft;
            this.log(`📊 Draft modifié: ${this.nextDraftModified.cardsPerDraft} cartes`);
            this.nextDraftModified = null;
        }
        
        this.triggerAbilities("start_of_turn");
        
        if (this.skipNextDraftFlag) {
            this.skipNextDraftFlag = false;
            this.log("⏭️ Draft ignoré !");
            this.state = GameState.PLAY_SELECT;
            this.cardsPlayedThisTurn = 0;
            this.inputManager.resetSelection();
            this.render();
            return;
        }
        
        this.processDelayedEffects();
        this.performDraft();
    }

    processDelayedEffects() {
        if (this.delayedEffects.length === 0) return;

        this.delayedEffects.forEach(d => d.turnsRemaining--);
        const ready = this.delayedEffects.filter(d => d.turnsRemaining === 0);

        ready.forEach(delayed => {
            this.log(`💥 ${delayed.name} se déclenche !`, "invoke");
            this.effectResolver.resolveEffect(delayed.effect, { name: delayed.name, type: "Transcendant" }, 0, []);
        });

        this.delayedEffects = this.delayedEffects.filter(d => d.turnsRemaining > 0);

        if (this.enemy.currentHp <= 0) {
            this.state = GameState.VICTORY;
            this.render();
        }
    }

    performDraft() {
        if (this.draftCount === 0) {
            this.draftedCardsThisTurn = [];
        }
        
        this.currentDraftOptions = this.drawCards(this.gameRules.cardsPerDraft);
        
        // Illusionniste Fou: 1 carte sur 3 est un leurre
        if (this.hasAbility("lure_card_drafted")) {
            this.currentDraftOptions.forEach((card, idx) => {
                if (Math.random() < 0.33) {
                    this.currentDraftOptions[idx] = {
                        id: "lure_" + idx,
                        name: "Leurre",
                        type: CardType.TRANSCENDANT,
                        rarity: Rarity.COMMUNE,
                        description: "C'était un leurre!",
                        effects: []
                    };
                }
            });
        }
        
        this.inputManager.resetSelection();
        this.render();
    }

    handleDraftSelection(index) {
        const selectedCard = this.currentDraftOptions[index];
        this.hand.push(selectedCard);
        this.draftedCardsThisTurn.push(selectedCard);

        for (let i = 0; i < this.currentDraftOptions.length; i++) {
            if (i !== index) this.discard.push(this.currentDraftOptions[i]);
        }

        this.draftCount++;
        
        // Check fusion après ajout en main
        this.effectResolver.checkUnicornFusion();

        if (this.draftCount < this.gameRules.draftCount) {
            this.performDraft();
        } else {
            // Fin du draft complet - Voleur de Poule bannit 1 carte
            if (this.hasAbility("banish_drafted") && this.draftedCardsThisTurn.length > 0) {
                const idx = Math.floor(Math.random() * this.draftedCardsThisTurn.length);
                const bannedCard = this.draftedCardsThisTurn[idx];
                const handIdx = this.hand.indexOf(bannedCard);
                if (handIdx !== -1) {
                    this.hand.splice(handIdx, 1);
                    this.banished.push(bannedCard);
                    this.log(`☠️ ${this.enemy.name} bannit ${bannedCard.name}!`, "error");
                }
            }
            
            this.state = GameState.PLAY_SELECT;
            this.cardsPlayedThisTurn = 0;
            this.gameRules.cardsPerDraft = 3;
            this.inputManager.resetSelection();
            this.render();
        }
    }

    // ========================================
    // ACTIVE DRAFT (Coup de chance / Partie de chasse)
    // ========================================
    startActiveDraft(rarity, cardsToShow = 3) {
        this.log(`🎴 Draft actif: ${rarity}`, "invoke");
        
        // Get pool of cards with specified rarity
        const pool = ALL_CARDS.filter(c => c.rarity === rarity);
        
        if (pool.length === 0) {
            this.log(`Aucune carte ${rarity} disponible`, "error");
            this.continueAfterActiveDraft();
            return;
        }

        // Shuffle pool and pick N cards
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        this.activeDraftOptions = shuffled.slice(0, Math.min(cardsToShow, shuffled.length)).map(c => ({...c}));
        
        // Change state
        this.activeDraftPendingResolve = true;
        this.state = GameState.ACTIVE_DRAFT;
        this.inputManager.resetSelection();
        this.render();
    }

    handleActiveDraftSelection(index) {
        const selectedCard = this.activeDraftOptions[index];
        this.log(`✅ Carte choisie: ${selectedCard.name}`, "invoke");
        
        // Non-selected cards go to discard
        for (let i = 0; i < this.activeDraftOptions.length; i++) {
            if (i !== index) {
                this.discard.push(this.activeDraftOptions[i]);
            }
        }
        
        // Clear active draft
        this.activeDraftOptions = [];
        this.activeDraftPendingResolve = false;
        
        // Resolve the selected card immediately
        this.effectResolver.resolve(selectedCard);
        
        // Card goes to discard after resolution
        this.discard.push(selectedCard);
        
        // Continue the game
        this.continueAfterActiveDraft();
    }

    continueAfterActiveDraft() {
        // Check victory/defeat
        if (this.enemy.currentHp <= 0) {
            this.state = GameState.VICTORY;
            this.render();
            return;
        }
        
        if (this.player.currentHp <= 0) {
            this.state = GameState.DEFEAT;
            this.render();
            return;
        }
        
        // Return to play phase
        if (this.hand.length > 0) {
            this.state = GameState.PLAY_SELECT;
            this.inputManager.resetSelection();
            this.render();
        } else {
            this.endTurnComplete();
        }
    }

    // ========================================
    // PLAY PHASE
    // ========================================
    handlePlaySelection(index) {
        this.state = GameState.PLAY_RESOLVE;
        this.render();

        const selectedCard = this.hand[index];

        // Balourd: tous les 2 cartes, bloque 10
        if (this.hasAbility("block_every_n_cards")) {
            const ability = this.getAbility("block_every_n_cards");
            if ((this.cardsPlayedThisTurn + 1) % ability.n === 0) {
                this.player.addBlock(ability.blockAmount);
                this.log(`🛡️ ${this.enemy.name} se prépare: +${ability.blockAmount} blocage!`);
            }
        }
        
        // Résoudre la carte
        this.effectResolver.resolve(selectedCard);

        // ⚠️ CHECK IMMÉDIAT : Si active draft déclenché, traiter la carte puis STOP
        if (this.state === GameState.ACTIVE_DRAFT) {
            // La carte qui a déclenché l'active draft doit être retirée et défaussée
            this.cardsPlayedThisTurnList.push(selectedCard);
            this.playedCardsHistory.push(selectedCard);
            this.discard.push(selectedCard);
            this.hand.splice(index, 1);
            this.cardsPlayedThisTurn++;
            
            // Le draft actif prend le contrôle, on attend le choix du joueur
            return;
        }
        
        // ✅ Si pas d'active draft, continuer normalement
        this.cardsPlayedThisTurnList.push(selectedCard);
        this.playedCardsHistory.push(selectedCard);
        
        // Check transform si exactement 1 carte restante
        if (selectedCard._transformLastCard && this.hand.length === 1) {
            const lastCard = this.hand[0];
            const mythics = ALL_CARDS.filter(c => c.rarity === Rarity.MYTHIQUE);
            if (mythics.length > 0) {
                const randomMythic = {...mythics[Math.floor(Math.random() * mythics.length)]};
                this.hand[0] = randomMythic;
                this.log(`✨ ${lastCard.name} → ${randomMythic.name} !`, "invoke");
            }
        }
        
        // Check si la carte doit être gardée pour le prochain tour
        if (selectedCard._keepNextTurn) {
            this.keptCards.push(selectedCard);
            this.log(`🔄 ${selectedCard.name} gardée pour prochain tour`);
        } else {
            this.discard.push(selectedCard);
        }
        
        this.hand.splice(index, 1);
        this.cardsPlayedThisTurn++;


        if (this.player.currentHp <= 0) {
            this.state = GameState.DEFEAT;
            this.render();
            return;
        }

        if (this.enemy.currentHp <= 0) {
            this.state = GameState.VICTORY;
            this.render();
            return;
        }

        setTimeout(() => this.enemyAttackAfterCard(), 500);
    }

    enemyAttackAfterCard() {
        // Check freeze
        if (this.enemyFrozenAttacks > 0) {
            this.enemyFrozenAttacks--;
            this.log(`❄️ Attaque gelée ! (${this.enemyFrozenAttacks} restante(s))`, "invoke");
            this.continueOrEndTurn();
            return;
        }
        
        const attack = this.enemy.chooseAttack();
        const damageDealt = this.player.takeDamage(attack.damage);
        this.log(`🗡️ ${this.enemy.name}: ${attack.name} (${attack.damage} dmg)`, "damage");
        if (damageDealt > 0) this.log(`💔 Vous: -${damageDealt} PV`, "damage");
        else this.log(`🛡️ Bloqué !`);

        if (this.pendingReflection && this.pendingReflection.active) {
            const damageBlocked = Math.max(0, attack.damage - damageDealt);
            const reflectedDamage = Math.floor(damageBlocked * this.pendingReflection.multiplier);
            
            if (reflectedDamage > 0) {
                this.enemy.takeDamage(reflectedDamage);
                this.log(`🔙 Boomerang! Renvoie ${reflectedDamage} dmg`, "damage");
            }
            this.pendingReflection.active = false;
        }

        if (this.player.currentHp <= 0) {
            this.state = GameState.DEFEAT;
            this.render();
            return;
        }

        if (this.enemy.currentHp <= 0) {
            this.state = GameState.VICTORY;
            this.render();
            return;
        }

        this.continueOrEndTurn();
    }

    continueOrEndTurn() {
        if (this.hand.length > 0) {
            this.state = GameState.PLAY_SELECT;
            this.inputManager.resetSelection();
            this.render();
        } else {
            this.endTurnComplete();
        }
    }

    endTurnComplete() {
        // Pénalité Bête Enragée
        this.triggerAbilities("end_of_turn");
        
        // Vérifier défaite déjà géré dans resolveEnemyAbility
        if (this.state === GameState.DEFEAT) {
            return;
        }
    
    this.player.resetBlock();
    setTimeout(() => this.startDraftPhase(), 500);
}

    manualEndTurn() {
        this.log(`⏭ Fin manuelle - ${this.hand.length} carte(s) défaussée(s)`);
        
        // Défausser toutes les cartes
        this.hand.forEach(card => this.discard.push(card));
        this.hand = [];
        
        // 🆕 PÉNALITÉ : Ennemi attaque
        if (this.enemyFrozenAttacks > 0) {
            this.enemyFrozenAttacks--;
            this.log(`❄️ Attaque gelée !`);
        } else {
            const attack = this.enemy.chooseAttack();
            const damageDealt = this.player.takeDamage(attack.damage);
            this.log(`🗡️ ${this.enemy.name}: ${attack.name} (${attack.damage} dmg)`, "damage");
            if (damageDealt > 0) this.log(`💔 Vous: -${damageDealt} PV`, "damage");
            else this.log(`🛡️ Bloqué !`);
        }
        
        // Vérifier défaite
        if (this.player.currentHp <= 0) {
            this.state = GameState.DEFEAT;
            this.render();
            return;
        }
        
        // Terminer le tour
        this.endTurnComplete();
    }

    // ========================================
    // SYSTÈME GÉNÉRIQUE DE CAPACITÉS ENNEMIES
    // ========================================
    
    hasAbility(abilityType) {
        return this.enemyAbilities.some(ability => ability.type === abilityType);
    }

    getAbility(abilityType) {
        return this.enemyAbilities.find(ability => ability.type === abilityType);
    }

    triggerAbilities(trigger) {
        this.enemyAbilities.forEach(ability => {
            if (ability.trigger === trigger) {
                this.resolveEnemyAbility(ability);
            }
        });
    }

    resolveEnemyAbility(ability) {
        switch (ability.type) {
            case "banish_from_discard":
                if (this.discard.length > 0) {
                    const toBanish = Math.min(ability.count, this.discard.length);
                    for (let i = 0; i < toBanish; i++) {
                        const randomIndex = Math.floor(Math.random() * this.discard.length);
                        const card = this.discard.splice(randomIndex, 1)[0];
                        this.banished.push(card);
                    }
                    this.log(`☠️ ${this.enemy.name}: ${toBanish} carte(s) bannie(s)`, "error");
                }
                break;

            case "damage_per_turn":
                this.player.currentHp = Math.max(0, this.player.currentHp - ability.value);
                this.log(`💀 ${this.enemy.name}: -${ability.value} PV (fin de tour)`, "damage");
                
                if (this.player.currentHp <= 0) {
                    this.state = GameState.DEFEAT;
                    this.render();
                }
                break;

            case "reverse_heal_damage":
                // Géré dans effects.js
                break;

            case "banish_drafted":
                // Bannit 1 carte draftée aléatoire du tour actuel
                if (this.draftedCardsThisTurn.length > 0) {
                    const idx = Math.floor(Math.random() * this.draftedCardsThisTurn.length);
                    const card = this.draftedCardsThisTurn.splice(idx, 1)[0];
                    this.banished.push(card);
                    this.log(`☠️ ${this.enemy.name}: ${card.name} est bannie!`, "error");
                }
                break;

            case "block_every_n_cards":
                // Appliqué dynamiquement pendant le jeu
                // Géré dans handlePlaySelection()
                break;

            case "lure_card_drafted":
                // Géré dans performDraft()
                break;
        }
    }

    // ========================================
    // LOGGING
    // ========================================
    log(message, type = "normal") {
        this.logMessages.push({ message, type });
        if (this.logMessages.length > 15) this.logMessages.shift();
    }

    // ========================================
    // RENDERING
    // ========================================
    render() {
        this.renderEnemy();
        this.renderPlayer();
        this.renderPhase();
        this.renderHistory();
        this.renderCards();
        this.renderDeckInfo();
        this.renderLog();
        this.renderGameOver();
    }

    renderEnemy() {
        const nextAttack = this.enemy.getNextAttack();
        document.getElementById('enemyInfo').textContent = 
            `${this.enemy.name} [${this.enemy.type}] | ${this.enemy.currentHp}/${this.enemy.maxHp} PV`;
        document.getElementById('enemyAttack').textContent = 
            `Prochaine: ${nextAttack.name} (${nextAttack.damage} dmg) | ${this.enemy.abilityName}`;
    }

    renderPlayer() {
        document.getElementById('playerInfo').textContent = 
            `PV: ${this.player.currentHp}/${this.player.maxHp} | 🛡️ Blocage: ${this.player.block}`;
        
        const effects = this.permanentEffects.length > 0 
            ? this.permanentEffects.map(e => `${e.name}: +${e.value}`).join(", ")
            : "Aucun";
        const delayed = this.delayedEffects.length > 0
            ? this.delayedEffects.map(e => `${e.name} (${e.turnsRemaining}t)`).join(", ")
            : "Aucun";
        document.getElementById('playerEffects').textContent = 
            `Permanents: ${effects} | ⏰ Retardés: ${delayed}`;
    }

    renderPhase() {
        const endTurnBtn = document.getElementById('endTurnBtn');
        let info = "";

        switch (this.state) {
            case GameState.DRAFT:
                info = `DRAFT ${this.draftCount + 1}/${this.gameRules.draftCount} | ← → Enter`;
                endTurnBtn.style.display = 'none';
                break;
            case GameState.ACTIVE_DRAFT:
                info = `🎴 DRAFT SPÉCIAL | Choisissez une carte | ← → Enter`;
                endTurnBtn.style.display = 'none';
                break;
            case GameState.PLAY_SELECT:
            case GameState.PLAY_RESOLVE:
                info = `JOUER (${this.cardsPlayedThisTurn} jouées, ${this.hand.length} en main) | ← → Enter`;
                endTurnBtn.style.display = this.hand.length > 0 ? 'inline-block' : 'none';
                break;
        }

        document.getElementById('phaseInfo').textContent = info;
    }

    renderHistory() {
        const leftCol = document.getElementById('historyLeft');
        const rightCol = document.getElementById('historyRight');
        
        leftCol.innerHTML = "";
        rightCol.innerHTML = "";
        
        if (this.state === GameState.DRAFT || this.state === GameState.ACTIVE_DRAFT) {
            // Phase draft : afficher cartes draftées
            leftCol.innerHTML = '<div style="color: #4a90e2; font-weight: bold; margin-bottom: 5px;">📋 DRAFTÉES</div>';
            
            this.draftedCardsThisTurn.forEach(card => {
                const cardName = document.createElement('div');
                const typeClass = card.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                cardName.className = `history-card-name type-${typeClass}`;
                cardName.textContent = card.name;
                
                // 🆕 Popup au hover
                cardName.onmouseenter = () => this.showCardPopup(card);
                cardName.onmouseleave = () => this.hideCardPopup();
                
                leftCol.appendChild(cardName);
            });
        } else if (this.state === GameState.PLAY_SELECT || this.state === GameState.PLAY_RESOLVE) {
            // Phase jeu : afficher cartes jouées
            rightCol.innerHTML = '<div style="color: #ffa500; font-weight: bold; margin-bottom: 5px;">⚔️ JOUÉES</div>';
            
            this.playedCardsHistory.forEach(card => {
                const cardName = document.createElement('div');
                const typeClass = card.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                cardName.className = `history-card-name type-${typeClass}`;
                cardName.textContent = card.name;
                
                // 🆕 Popup au hover
                cardName.onmouseenter = () => this.showCardPopup(card);
                cardName.onmouseleave = () => this.hideCardPopup();
                
                rightCol.appendChild(cardName);
            });
        }
    }

    showCardPopup(card) {
        // Créer ou récupérer le popup
        let popup = document.getElementById('cardPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'cardPopup';
            popup.className = 'card-popup';
            document.body.appendChild(popup);
        }
        
        // Remplir le popup
        const typeClass = card.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        popup.className = `card-popup card type-${typeClass} visible`;
        popup.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-desc">${card.description}</div>
        `;
    }

    hideCardPopup() {
        const popup = document.getElementById('cardPopup');
        if (popup) {
            popup.classList.remove('visible');
        }
    }

    renderCards() {
        const container = document.getElementById('cardsContainer');
        container.innerHTML = "";

        let cardsToDisplay = [];
        if (this.state === GameState.DRAFT) cardsToDisplay = this.currentDraftOptions;
        else if (this.state === GameState.ACTIVE_DRAFT) cardsToDisplay = this.activeDraftOptions;
        else if (this.state === GameState.PLAY_SELECT || this.state === GameState.PLAY_RESOLVE) cardsToDisplay = this.hand;

        cardsToDisplay.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            const typeClass = card.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            cardDiv.className = `card type-${typeClass}`;
            if (index === this.inputManager.selectedIndex) cardDiv.classList.add('selected');

            // 🆕 ONCLICK - Sélectionner avec la souris
            cardDiv.onclick = () => {
                this.inputManager.selectedIndex = index;
                this.inputManager.select();
            };

            // 🆕 Colorier les nombres de dégâts selon efficacité
            // 🆕 Colorier les nombres de dégâts selon efficacité
            let descriptionHTML = card.description;
            // 🆕 Appliqué pendant TOUTES les phases (draft + jeu)
            const cardType = card.type;
            const enemyType = this.enemy.type;

            let damageClass = '';

            // Efficace : Type différent (sauf Transcendant)
            if ((cardType === "Rêve" && enemyType === "Cauchemar") ||
                (cardType === "Cauchemar" && enemyType === "Rêve")) {
                damageClass = 'dmg-strong'; // Vert
            }
            // Peu efficace : Même type
            else if ((cardType === "Rêve" && enemyType === "Rêve") ||
                    (cardType === "Cauchemar" && enemyType === "Cauchemar")) {
                damageClass = 'dmg-weak'; // Rouge
            }

            // Remplacer les nombres de dégâts par version colorée
            if (damageClass) {
                descriptionHTML = descriptionHTML.replace(/(\d+)\s*(dmg|dégâts?)/gi, 
                    `<span class="${damageClass}">$1</span> $2`);
            }

            cardDiv.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-type">${card.type}</div>
                <div class="card-rarity">${card.rarity}</div>
                <div class="card-desc">${descriptionHTML}</div>
            `;

            container.appendChild(cardDiv);
        });
    }

    renderDeckInfo() {
        document.getElementById('deckCount').textContent = this.deck.length;
        document.getElementById('discardCount').textContent = this.discard.length;
        document.getElementById('banishedCount').textContent = this.banished.length;
    }

    renderLog() {
        const logContainer = document.getElementById('logContainer');
        logContainer.innerHTML = "";

        this.logMessages.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}`;
            logEntry.textContent = log.message;
            logContainer.appendChild(logEntry);
        });

        logContainer.scrollTop = logContainer.scrollHeight;
    }

    renderGameOver() {
        const existing = document.querySelector('.game-over');
        if (existing) existing.remove();

        if (this.state === GameState.VICTORY || this.state === GameState.DEFEAT) {
            const div = document.createElement('div');
            div.className = `game-over ${this.state.toLowerCase()}`;
            const msg = this.state === GameState.VICTORY ? "VICTOIRE" : "DÉFAITE";
            div.innerHTML = `
                <h2>${msg}</h2>
                <button onclick="location.reload()">RECOMMENCER</button>
            `;
            document.body.appendChild(div);
        }
    }
}

// ========================================
// ENEMY SELECTION & INITIALIZATION
// ========================================

let game = null;
let selectedEnemyId = null;

function initEnemySelection() {
    const enemyList = document.getElementById('enemyList');
    const enemies = EnemyFactory.getAllEnemies();

    enemies.forEach(enemy => {
        const card = document.createElement('div');
        card.className = 'enemy-card';
        card.onclick = () => selectEnemy(enemy.id);
        
        card.innerHTML = `
            <div class="enemy-card-name">${enemy.name}</div>
            <div class="enemy-card-info">${enemy.maxHp} PV | ${enemy.type}</div>
            <div class="enemy-card-ability">${enemy.abilityDescription}</div>
        `;
        
        enemyList.appendChild(card);
    });

    async function constructDeck() {
        const { DeckBuilder } = await import('./deckBuilder.js');
        window.deckBuilder = new DeckBuilder(null, selectedEnemyId);
        window.deckBuilder.show();
    }

    window.constructDeck = constructDeck;
}

function selectEnemy(id) {
    selectedEnemyId = id;
    
    document.querySelectorAll('.enemy-card').forEach((card, index) => {
        if (index === id) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    document.getElementById('startBtn').disabled = false;
}

function startGameWithCustomDeck(enemyId) {
    document.getElementById('deckBuilderScreen').style.display = 'none';
    document.getElementById('deckBuilderScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');

    game = new GameManager(enemyId);
    game.customDeck = window.customDeckToLoad;
    game.initializeDeck();
    game.shuffleDeck();
    game.startDraftPhase();
    game.render();
    
    window.customDeckToLoad = null;
}

function loadPreviousDeck() {
    const saved = localStorage.getItem('customDeck');
    if (!saved) {
        alert("Aucun deck sauvegardé!");
        return;
    }
    
    if (selectedEnemyId === null) {
        alert("Sélectionnez un ennemi d'abord!");
        return;
    }
    
    // Cacher l'écran de sélection
    document.getElementById('enemySelection').style.display = 'none';

    window.customDeckToLoad = JSON.parse(saved).map(id => {
        const card = ALL_CARDS.find(c => c.id === id);
        return card ? {...card} : null;
    }).filter(c => c !== null);
    
    startGameWithCustomDeck(selectedEnemyId);
}

function newGame() {
    localStorage.removeItem('customDeck');
    alert("Deck supprimé. Créez un nouveau deck!");
}

window.loadPreviousDeck = loadPreviousDeck;
window.newGame = newGame;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initEnemySelection();
    document.getElementById('startBtn').disabled = true;
});

window.startGameWithCustomDeck = startGameWithCustomDeck;

function startGame() {
    if (selectedEnemyId === null) {
        alert("Sélectionnez un ennemi !");
        return;
    }

    document.getElementById('enemySelection').style.display = 'none';
    document.getElementById('gameScreen').classList.add('active');

    game = new GameManager(selectedEnemyId);
    window.game = game; // Expose game to window for onclick access
}

// Make functions accessible from HTML
window.selectEnemy = selectEnemy;
window.startGame = startGame;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initEnemySelection();
    document.getElementById('startBtn').disabled = true;
});
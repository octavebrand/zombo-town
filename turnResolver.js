// ========================================
// TURNRESOLVER.JS - Résolution fin de tour (A→H)
// ========================================
import { ALL_CARDS } from './cards.js';
import { Rarity } from './constants.js';
import { createToken } from './tokens.js';  
import { CardType } from './constants.js';  

export class TurnResolver {
    constructor(gameManager) {
        this.gm = gameManager;
    }
    
    // ========================================
    // RÉSOLUTION COMPLÈTE A→H
    // ========================================
    
    resolve() {
        const results = {
            damageBase: 0,
            damageMultiplier: 0,
            damageTotal: 0,
            blockBase: 0,
            blockMultiplier: 0,
            blockTotal: 0,
            enemyAttack: 0,
            playerDamageTaken: 0,
            enemyDamageTaken: 0
        };

        // Reset tracking défausses
        this.gm.discardsThisTurn = [];
        
        // A) Calculer DAMAGE
        this.calculateDamage(results);
        
        // B) Calculer BLOCK
        this.calculateBlock(results);
        
        // C) Calculer attaque ENEMY
        this.calculateEnemyAttack(results);
        
        // D) Appliquer damage → enemy
        this.applyDamageToEnemy(results);
        
        // E) Appliquer (enemy attack - block) → player
        this.applyDamageToPlayer(results);
        
        // E2) Appliquer effets STATE (draw/heal)
        this.applyStateEffects(results);

        // E3) Vérifier timers cartes ennemies
        this.checkTimers(results);

        // F) Reset compteurs
        this.resetCounters();

        // I) Appliquer effets atouts
        this.applyAtoutEffects();
        
        // G) Défausser cartes temporaires
        this.discardTemporaryCards();
        
        
        return results;
    }
    
    // ========================================
    // A) CALCULER DAMAGE
    // ========================================
    
    calculateDamage(results) {
        // Somme values DAMAGE
        this.gm.board.slots.damage.forEach(slot => {
            if (slot.card) {
                results.damageBase += this.gm.board.getFinalCardValue(slot.id);
            } else if (slot.rewardBonus > 0) {
                results.damageBase += slot.rewardBonus;
            }
        });
        
        // Somme values SHARED
        this.gm.board.slots.shared.forEach(slot => {
            if (slot.card) {
                results.damageBase += this.gm.board.getFinalCardValue(slot.id);
            } else if (slot.rewardBonus > 0) {
                results.damageBase += slot.rewardBonus;
            }
        });

            // Appliquer effets cartes ennemies (boost_damage)
        let enemyDamageBoost = 0;
        this.gm.board.slots.enemy.forEach(slot => {
            if (slot.card && slot.card.effect) {
                const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
                effects.forEach(eff => {
                    if (eff.type === 'boost_damage') {
                        enemyDamageBoost += eff.value;
                    }
                });
            }
        });
        
        if (enemyDamageBoost > 0) {
            this.gm.log(`[A+] 👹 Cartes ennemies: +${enemyDamageBoost} DMG ennemi`);
        }
        
        // Application maxxer
        results.damageMultiplier = this.gm.maxxers.damage.getMultiplier();
        results.damageTotal = Math.floor(results.damageBase * results.damageMultiplier);
        
        this.gm.log(`[A] 💥 Dégâts: ${results.damageBase} × ${results.damageMultiplier.toFixed(1)} = ${results.damageTotal}`);
    }
    
    // ========================================
    // B) CALCULER BLOCK
    // ========================================
    
    calculateBlock(results) {
        // Somme values BLOCK
        this.gm.board.slots.block.forEach(slot => {
            if (slot.card) {
                results.blockBase += this.gm.board.getFinalCardValue(slot.id);
            } else if (slot.rewardBonus > 0) {
                results.blockBase += slot.rewardBonus;
            }
        });
        
        // Somme values SHARED
        this.gm.board.slots.shared.forEach(slot => {
            if (slot.card) {
                results.blockBase += this.gm.board.getFinalCardValue(slot.id);
            } else if (slot.rewardBonus > 0) {
                results.blockBase += slot.rewardBonus;
            }
        });
        
        // Application maxxer
        results.blockMultiplier = this.gm.maxxers.block.getMultiplier();
        results.blockTotal = Math.floor(results.blockBase * results.blockMultiplier);
        
        this.gm.log(`[B] 🛡️ Blocage: ${results.blockBase} × ${results.blockMultiplier.toFixed(1)} = ${results.blockTotal}`);
    }
    
    // ========================================
    // C) CALCULER ATTAQUE ENEMY
    // ========================================
    
    calculateEnemyAttack(results) {
        let baseDamage = this.gm.enemy.attackDamage;
        
        // Appliquer boost des cartes ennemies
        let damageBoost = 0;
        this.gm.board.slots.enemy.forEach(slot => {
            if (slot.card && slot.card.effect) {
                const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
                effects.forEach(eff => {
                    if (eff.type === 'boost_damage') {
                        damageBoost += eff.value;
                    }
                });
            }
        });
        
        results.enemyAttack = baseDamage + damageBoost;
        
        if (damageBoost > 0) {
            this.gm.log(`[C] ⚔️ Attaque ennemie: ${baseDamage} + ${damageBoost} (cartes) = ${results.enemyAttack}`);
        } else {
            this.gm.log(`[C] ⚔️ Attaque ennemie: ${results.enemyAttack}`);
        }
    }
    
    // ========================================
    // D) APPLIQUER DAMAGE → ENEMY
    // ========================================
    
    applyDamageToEnemy(results) {
        const target = this.gm.currentTarget;
        
        // Calculer block de l'ennemi (depuis cartes ennemies)
        let enemyBlock = 0;
        this.gm.board.slots.enemy.forEach(slot => {
            if (slot.card && slot.card.effect) {
                const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
                effects.forEach(eff => {
                    if (eff.type === 'boost_block') {
                        enemyBlock += eff.value;
                    }
                });
            }
        });
        
        // Dégâts nets après block ennemi
        const netDamage = Math.max(0, results.damageTotal - enemyBlock);
        results.enemyBlock = enemyBlock;
        
        if (enemyBlock > 0) {
            this.gm.log(`[D] 🛡️ BLOCK ennemi: ${enemyBlock} (${results.damageTotal} → ${netDamage} dégâts nets)`);
        }
        
        // Si cible = ennemi principal
        if (target === 'enemy') {
            const oldHp = this.gm.enemy.currentHp;
            this.gm.enemy.currentHp = Math.max(0, oldHp - netDamage);
            results.enemyDamageTaken = oldHp - this.gm.enemy.currentHp;
            
            this.gm.log(`[D] 💀 Ennemi principal: ${oldHp} → ${this.gm.enemy.currentHp} (-${results.enemyDamageTaken})`);
            
            results.targetType = 'enemy';
            results.targetName = 'Ennemi principal';
        } 
        // Si cible = carte ennemie
        else {
            const slot = this.gm.board.getSlot(target);
            
            if (!slot || !slot.card) {
                this.gm.log(`[D] ⚠️ Cible ${target} introuvable ou détruite`);
                results.enemyDamageTaken = 0;
                results.targetType = 'none';
                results.targetName = 'Aucune cible';
                return;
            }
            
            const card = slot.card;
            const oldHp = card.currentHp;
            const isDead = card.takeDamage(netDamage);
            results.enemyDamageTaken = oldHp - card.currentHp;
            
            this.gm.log(`[D] 🎯 ${card.name}: ${oldHp} → ${card.currentHp} HP (-${results.enemyDamageTaken})`);
            
            results.targetType = 'enemy_card';
            results.targetName = card.name;
            
            // Si carte morte, la retirer
            if (isDead) {
                const deadCard = card;
                
                // Trigger onDeath
                if (deadCard.onDeath) {
                    this.resolveOnDeath(deadCard.onDeath);
                }
                
                slot.removeCard();
                this.gm.log(`💀 ${deadCard.name} détruite !`);
                
                // Reset cible vers ennemi principal
                this.gm.currentTarget = 'enemy';
            }
        }
    }
    
    // ========================================
    // E) APPLIQUER DÉGÂTS PLAYER
    // ========================================
    
    applyDamageToPlayer(results) {
        const netDamage = Math.max(0, results.enemyAttack - results.blockTotal);
        
        const oldHp = this.gm.player.currentHp;
        this.gm.player.currentHp = Math.max(0, oldHp - netDamage);
        results.playerDamageTaken = oldHp - this.gm.player.currentHp;
        
        if (results.blockTotal >= results.enemyAttack) {
            this.gm.log(`[E] 🛡️ Attaque bloquée ! (${results.enemyAttack} - ${results.blockTotal} = 0)`);
        } else {
            this.gm.log(`[E] ❤️ Joueur: ${oldHp} → ${this.gm.player.currentHp} (-${results.playerDamageTaken})`);
        }
    }
    
    // ========================================
    // F) RESET COMPTEURS
    // ========================================
    
    resetCounters() {
        // Reset player resolve
        this.gm.playerResolved = false;

        this.gm.maxxers.damage.reset();
        this.gm.maxxers.block.reset();
        
        this.gm.log(`[F] 🔄 Reset compteurs`);
    }

    // Appliquer effets des atouts en fin de tour
    applyAtoutEffects() {
        const playerSlots = this.gm.board.getSlotsByType('player');
        
        playerSlots.forEach(slot => {
            if (!slot.card || slot.card.cardType !== CardType.ATOUT) return;
            
            const atout = slot.card;
            if (!atout.effect) return;
            
            switch(atout.effect.type) {
                case 'atout_draw_eot':
                    // Draw en fin de tour avec limite main
                    const maxHand = atout.effect.max_hand || 10;
                    if (this.gm.hand.length < maxHand) {
                        this.gm.drawCards(atout.effect.value);
                        this.gm.log(`📚 ${atout.name}: Pioche ${atout.effect.value}`);
                    } else {
                        this.gm.log(`⚠️ ${atout.name}: Main pleine (max ${maxHand})`);
                    }
                    break;
                    
                // Autres effets atouts gérés ailleurs (usines, stabilisateur)
            }
        });
    }
    
    // ========================================
    // G) DÉFAUSSER CARTES TEMPORAIRES
    // ========================================
    
    discardTemporaryCards() {
        let discardedCount = 0;
        
        const allSlots = this.gm.board.getAllSlots();
        
        allSlots.forEach(slot => {
            // Reset TOUS les bonus (slots vides ou pleins)
            if (slot.type !== 'enemy' && slot.type !== 'player') {
                slot.rewardBonus = 0;  
                slot.neighborBonus = 0;  
            }
            
            // Défausser cartes
            if (slot.card && slot.type !== 'player' && slot.type !== 'enemy') {
                const discardedCard = slot.card;  // Stocker AVANT de défausser
                this.gm.discard.push(discardedCard);

                // Tracker pour Collecteur d'Ombres
                this.gm.discardsThisTurn.push(discardedCard);
                // Trigger atouts "token_on_discard"
                this.checkAtoutTokenOnDiscard(discardedCard);
                // Trigger effets on_discard (créatures)
                this.gm.effectResolver.resolveOnDiscard(discardedCard);

                // Effet spécial : créer jeton sur même slot
                let tokenCreatedOnSlot = false;
                if (discardedCard.effect) {
                    const effects = Array.isArray(discardedCard.effect) ? discardedCard.effect : [discardedCard.effect];
                    effects.forEach(eff => {
                        if (eff.type === 'on_discard_create_token_same_slot') {
                            const token = createToken(eff.tokenId);
                            if (token) {
                                slot.card = token;  // Remettre jeton sur le slot
                                tokenCreatedOnSlot = true;
                                this.gm.log(`👻 ${discardedCard.name}: Jeton ${token.name} créé sur ${slot.id}`);
                            }
                        }
                    });
                }
                
                // Si aucun jeton créé, vider le slot
                if (slot.card === discardedCard) {
                    slot.removeCard();
                }
                
                // Défausser charmes + trigger effets on_discard
                slot.equipments.forEach(charm => {
                    this.gm.effectResolver.resolveOnDiscard(charm); 
                    this.gm.discard.push(charm);
                    discardedCount++;
                });
                    slot.equipments = [];  // Clear
                    
                    if (!tokenCreatedOnSlot) {
                        slot.removeCard();
                    }

                    discardedCount++;
            }

            // Pour slots PLAYER : ne défausser QUE les créatures, pas les atouts
            if (slot.type === 'player' && slot.card) {
                if (slot.card.cardType !== CardType.ATOUT) {
                    const discardedCard = slot.card;  // Stocker avant de retirer
                    this.gm.discard.push(discardedCard);
                    
                    // Trigger atouts "token_on_discard"
                    this.checkAtoutTokenOnDiscard(discardedCard);
                    
                    slot.removeCard();
                    discardedCount++;
                }
                // Sinon (ATOUT) → on ne fait rien, il reste
            }
        });
        
        this.gm.log(`[G] 🗑️ ${discardedCount} carte(s) défaussée(s) + Reset bonus`);
    }

    // Vérifier si un atout doit créer un jeton
    checkAtoutTokenOnDiscard(discardedCard) {
        if (!discardedCard.tags || discardedCard.tags.length === 0) return;
        
        const playerSlots = this.gm.board.getSlotsByType('player');
        
        playerSlots.forEach(slot => {
            if (!slot.card || slot.card.cardType !== CardType.ATOUT) return;
            
            const atout = slot.card;
            if (!atout.effect || atout.effect.type !== 'atout_token_on_discard') return;
            
            // Vérifier si le tag correspond
            if (discardedCard.tags.includes(atout.effect.tag)) {
                // Créer jeton
                const token = createToken(atout.effect.tokenId);
                if (token && this.gm.hand.length < 10) {
                    this.gm.hand.push(token);
                    this.gm.log(`🏭 ${atout.name}: Crée jeton ${token.name}`);
                }
            }
        });
    }
    
    // ========================================
    // H) EFFETS STATE (vide pour l'instant)
    // ========================================
    
    applyStateEffects(results) {
        // Calculer STATE value
        const stateData = this.gm.calculateStateValue();
        results.stateValue = stateData.value;
        results.stateTier = stateData.tier;
        
        this.gm.log(`[H] 🌍 STATE: ${stateData.value} value (Tier ${stateData.tier})`);
        
        // Appliquer les rewards choisis
        if (this.gm.pendingStateRewards.length > 0) {
            this.gm.log(`[H] ✨ Application de ${this.gm.pendingStateRewards.length} reward(s)`);
            
            this.gm.pendingStateRewards.forEach(reward => {
                this.applyStateReward(reward, results);
            });
            
            // Clear pending rewards
            this.gm.pendingStateRewards = [];
        }
    }

    applyStateReward(reward, results) {
        reward.effects.forEach(effect => {
            switch(effect.type) {
                case 'draw':
                    this.gm.drawCards(effect.value);
                    this.gm.log(`[H] 📥 Pioche ${effect.value} carte(s)`);
                    break;
                    
                case 'heal':
                    const oldHp = this.gm.player.currentHp;
                    this.gm.player.currentHp = Math.min(this.gm.player.maxHp, this.gm.player.currentHp + effect.value);
                    this.gm.log(`[H] 💚 Heal ${effect.value} (${oldHp} → ${this.gm.player.currentHp})`);
                    break;
                    
                case 'random_slot_bonus':
                    this.applyRandomSlotBonus(effect.value);
                    break;
                    
                case 'all_slots_bonus':
                    this.applyAllSlotsBonus(effect.value);
                    break;
            }
        });
    }

    applyRandomSlotBonus(value) {
        // Stocker pour application au tour suivant
        this.gm.pendingSlotBonuses.push({ type: 'random', value: value });
        this.gm.log(`[H] 🎲 Random slot +${value} (sera appliqué au prochain tour)`);
    }

    applyAllSlotsBonus(value) {
        // Stocker pour application au tour suivant
        if (!this.gm.pendingSlotBonuses) {
            this.gm.pendingSlotBonuses = [];
        }
        
        this.gm.pendingSlotBonuses.push({ type: 'all', value: value });
        this.gm.log(`[H] ⭐ All slots +${value} (sera appliqué au prochain tour)`);
    }

    checkTimers(results) {
        this.gm.board.slots.enemy.forEach(slot => {
            if (!slot.card || !slot.card.timer || slot.card.turnPlaced === null) return;
            
            const turnsElapsed = this.gm.turnNumber - slot.card.turnPlaced;
            const turnsRemaining = slot.card.timer.turns - turnsElapsed;
            
            // Timer expiré
            if (turnsRemaining <= 1) {
                this.gm.log(`⏰ ${slot.card.name}: Timer expiré !`);
                this.resolveTimerEffect(slot.card.timer.effect);
                
                // Reset timer
                slot.card.timer = null;
            }
        });
    }

    resolveTimerEffect(effect) {
        switch(effect.type) {
            case 'damage_player':
                this.gm.player.currentHp = Math.max(0, this.gm.player.currentHp - effect.value);
                this.gm.log(`💥 Timer: ${effect.value} dégâts au joueur !`);
                break;
                
            case 'heal_enemy':
                const oldHp = this.gm.enemy.currentHp;
                this.gm.enemy.currentHp = Math.min(this.gm.enemy.maxHp, this.gm.enemy.currentHp + effect.value);
                this.gm.log(`💚 Timer: Boss heal ${effect.value} (${oldHp} → ${this.gm.enemy.currentHp})`);
                break;
        }
    }

    resolveOnDeath(onDeath) {
        switch(onDeath.type) {
            case 'draw':
                this.gm.drawCards(onDeath.value);
                this.gm.log(`📥 OnDeath: Pioche ${onDeath.value}`);
                break;
                
            case 'add_rare_card':
                // Filtrer cartes Rares du pool
                const rareCards = ALL_CARDS.filter(c => c.rarity === Rarity.RARE);
                if (rareCards.length > 0) {
                    const randomRare = rareCards[Math.floor(Math.random() * rareCards.length)];
                    // Créer copie
                    this.gm.hand.push({...randomRare});
                    this.gm.log(`✨ OnDeath: ${randomRare.name} ajoutée en main !`);
                }
                break;
                
            case 'heal':
                const oldHp = this.gm.player.currentHp;
                this.gm.player.currentHp = Math.min(this.gm.player.maxHp, this.gm.player.currentHp + onDeath.value);
                this.gm.log(`💚 OnDeath: Heal ${onDeath.value} (${oldHp} → ${this.gm.player.currentHp})`);
                break;
        }
    }
}
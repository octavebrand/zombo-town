import { CardType, Rarity } from './constants.js';
import { ALL_CARDS, UNICORN_TREASURE_CARD } from './cards.js';

// ========================================
// EFFECT RESOLVER
// ========================================

export class EffectResolver {
    constructor(gameManager) {
        this.gm = gameManager;
    }

    resolve(card, positionInHand = 0) {
        this.gm.log(`Résolution: ${card.name}`);
        
        const positionInTurn = this.gm.cardsPlayedThisTurn;
        const previousCards = this.gm.cardsPlayedThisTurnList;
        
        for (let effect of card.effects) {
            this.resolveEffect(effect, card, positionInTurn, previousCards);
        }
    }

    resolveEffect(effect, sourceCard, positionInTurn, previousCards) {
        switch (effect.type) {
            case "damage":
                this.resolveDamage(effect, sourceCard, positionInTurn, previousCards);
                break;
            case "heal":
                this.resolveHeal(effect);
                break;
            case "block":
                this.resolveBlock(effect);
                break;
            case "invoke":
                this.resolveInvoke(effect, sourceCard);
                break;
            case "permanent":
                this.resolvePermanent(effect, sourceCard);
                break;
            case "delayed":
            case "echo":
                this.resolveDelayed(effect, sourceCard);
                break;
            case "sacrifice_hp":
                this.resolveSacrificeHp(effect);
                break;
            case "modify_next_draft":
                this.resolveModifyNextDraft(effect);
                break;
            case "draw":
                this.resolveDraw(effect);
                break;
            case "keep_next_turn":
                this.resolveKeepNextTurn(sourceCard);
                break;
            case "unicorn_fusion_check":
                this.checkUnicornFusion();
                break;
            case "freeze_enemy":
                this.resolveFreezeEnemy(effect);
                break;
            case "conditional_freeze":
                this.resolveConditionalFreeze(effect, sourceCard, positionInTurn, previousCards);
                break;
            case "heal_over_time":
                this.resolveHealOverTime(effect, sourceCard);
                break;
            case "deck_count_damage":
                this.resolveDeckCountDamage(effect, sourceCard);
                break;
            case "deck_count_heal":
                this.resolveDeckCountHeal(effect, sourceCard);
                break;
            case "next_card_damage_multiplier":
                this.resolveNextCardDamageMultiplier(effect, previousCards);
                break;
            case "next_card_heal_multiplier":
                this.resolveNextCardHealMultiplier(effect, previousCards);
                break;
            case "draw_per_rarity":
                this.resolveDrawPerRarity();
                break;
            case "random_mythic_to_top":
                this.resolveRandomMythicToTop();
                break;
            case "draft_and_play":
                this.resolveDraftAndPlay(effect);
                break;
            case "active_draft":
                this.resolveActiveDraft(effect);
                break;
            case "modify_next_heal":
                this.resolveModifyNextHeal(effect);
                break;
            case "search_type_to_hand":
                this.resolveSearchTypeToHand(effect);
                break;
            case "recover_from_discard":
                this.resolveRecoverFromDiscard(effect);
                break;
            case "conditional_damage":
                this.resolveConditionalDamage(effect, sourceCard);
                break;
            case "repeat_previous_action":
                this.resolveRepeatPreviousAction(sourceCard, positionInTurn, previousCards);
                break;
            case "reflect_damage":
                this.resolveReflectDamage(effect);
                break;
            case "gambit_roll":
                this.resolveGambitRoll(sourceCard);
                break;
            case "conditional_heal_and_draw":
                this.resolveConditionalHealAndDraw(effect);
                break;
            case "invoke_mythics":
                this.resolveInvokeMythics(effect);
                break;
            default:
                this.gm.log(`Type d'effet inconnu: ${effect.type}`, "error");
        }
    }

    resolveDamage(effect, sourceCard, positionInTurn, previousCards) {
        let damage = effect.value;

        if (effect.condition) {
            const conditionMet = this.checkCondition(effect.condition, sourceCard, positionInTurn, previousCards);
            
            if (effect.condition.type === "first_strike" && !conditionMet) {
                this.gm.log(`${sourceCard.name} n'est pas jouée en 1ère position - Aucun effet !`, "error");
                return;
            }
            
            if (conditionMet && effect.condition.multiplier) {
                damage *= effect.condition.multiplier;
                this.gm.log(`Condition remplie ! Dégâts x${effect.condition.multiplier}`);
            }
            
            if (conditionMet && effect.condition.bonus) {
                damage += effect.condition.bonus;
                this.gm.log(`Condition remplie ! +${effect.condition.bonus} dégâts`);
            }

            if (conditionMet && effect.condition.bonusPerCount) {
                const count = previousCards.filter(c => c.type === effect.condition.requiredType).length + 1;
                damage += effect.condition.bonusPerCount * count;
                this.gm.log(`Combo x${count} ! +${effect.condition.bonusPerCount * count}`);
            }
        }

        if (this.gm.nextCardDamageMultiplier !== 1) {
            damage *= this.gm.nextCardDamageMultiplier;
            this.gm.log(`💫 Multiplicateur dégâts: x${this.gm.nextCardDamageMultiplier}`);
            this.gm.nextCardDamageMultiplier = 1;
        }

        if (effect.modifiers?.typeBonus) {
            damage = this.applyTypeBonus(damage, sourceCard.type, this.gm.enemy.type);
        }

        damage = this.applyPermanentModifiers(damage, sourceCard.type);

        if (this.gm.hasAbility("reverse_heal_damage")) {
            this.gm.enemy.currentHp = Math.min(this.gm.enemy.maxHp, this.gm.enemy.currentHp + Math.floor(damage * 0.5));
            this.gm.log(`🪞 Réflecteur: +${Math.floor(damage * 0.5)} PV ennemi`, "heal");
            return;
        }

        this.gm.enemy.takeDamage(Math.floor(damage));
        this.gm.log(`${sourceCard.name} inflige ${Math.floor(damage)} dégâts`, "damage");

        sourceCard._dealtDamage = (Math.floor(damage) > 0);
    }

    checkCondition(condition, sourceCard, positionInTurn, previousCards) {
        switch (condition.type) {
            case "finisher":
                return this.gm.hand.length === 1;
            case "first_strike":
                return positionInTurn === 0;
            case "sandwich":
                if (positionInTurn < 1 || positionInTurn > 2) return false;
                if (previousCards.length < 1) return false;
                const prevCard = previousCards[previousCards.length - 1];
                return prevCard.type === sourceCard.type;
            case "last_hope":
                const isLastCard = this.gm.hand.length === 1;
                const isLowHp = this.gm.player.currentHp < (this.gm.player.maxHp * 0.3);
                return isLastCard && isLowHp;
            case "combo_previous_type":
                if (previousCards.length === 0) return false;
                return previousCards[previousCards.length - 1].type === condition.requiredType;
            case "combo_count_type":
                const count = previousCards.filter(c => c.type === condition.requiredType).length + 1;
                return count >= condition.threshold;
            case "combo_diversity":
                const types = new Set(previousCards.map(c => c.type));
                types.add(sourceCard.type);
                return types.size >= condition.threshold;
            default:
                return false;
        }
    }

    resolveHeal(effect) {
        let healAmount = effect.value;

        if (this.gm.nextCardHealMultiplier !== 1) {
            healAmount *= this.gm.nextCardHealMultiplier;
            this.gm.log(`💫 Multiplicateur soin: x${this.gm.nextCardHealMultiplier}`);
            this.gm.nextCardHealMultiplier = 1;
        }

        // Appliquer le modificateur de soin (Sanctuaire)
        if (this.gm.nextHealModifier && this.gm.nextHealModifier.active) {
            healAmount += this.gm.nextHealModifier.bonus;
            this.gm.nextHealModifier.cardsRemaining--;
            if (this.gm.nextHealModifier.cardsRemaining <= 0) {
                this.gm.nextHealModifier.active = false;
            }
            this.gm.log(`💚 +${this.gm.nextHealModifier.bonus} soin bonus (Sanctuaire)`);
        }

        if (this.gm.hasAbility("reverse_heal_damage")) {
            this.gm.player.currentHp = Math.max(0, this.gm.player.currentHp - healAmount);
            this.gm.log(`🪞 Réflecteur: -${healAmount} PV`, "damage");
        } else {
            this.gm.player.heal(healAmount);
            this.gm.log(`Soin de ${healAmount} PV`, "heal");
        }
    }

    resolveBlock(effect) {
        this.gm.player.addBlock(effect.value);
        this.gm.log(`+${effect.value} blocage`);
        this.gm.damageBlockedThisAction = effect.value;
    }

    resolveInvoke(effect, sourceCard) {
        const invokedCard = this.getRandomCardFromPool(effect.filter);
        
        if (!invokedCard) {
            this.gm.log(`Aucune carte trouvée pour l'invocation`, "error");
            return;
        }

        this.gm.log(`[INVOKE] ${sourceCard.name} invoque ${invokedCard.name}`, "invoke");
        this.resolve(invokedCard);
        this.gm.discard.push(invokedCard);
    }

    resolvePermanent(effect, sourceCard) {
        this.gm.permanentEffects.push({
            name: sourceCard.name,
            type: effect.permanentType,
            value: effect.value,
            cardType: effect.cardType
        });
        this.gm.log(`Effet permanent ajouté: ${effect.permanentType}`);
    }

    resolveDelayed(effect, sourceCard) {
        this.gm.delayedEffects.push({
            name: sourceCard.name,
            turnsRemaining: effect.turnsUntilTrigger,
            effect: effect.delayedEffect || effect.echoEffect
        });
        this.gm.log(`⏰ ${effect.type === "delayed" ? "Prophétie" : "Écho"}: ${effect.turnsUntilTrigger} tours`, "invoke");
    }

    resolveSacrificeHp(effect) {
        this.gm.player.currentHp = Math.max(0, this.gm.player.currentHp - effect.value);
        this.gm.log(`💀 Sacrifice: -${effect.value} PV`, "damage");
    }

    resolveModifyNextDraft(effect) {
        this.gm.nextDraftModified = { cardsPerDraft: effect.cardsPerDraft || 3 };
        this.gm.log(`📊 Prochain draft: ${effect.cardsPerDraft} cartes`);
    }

    resolveDraw(effect) {
        const drawn = this.gm.drawCards(effect.value);
        drawn.forEach(card => this.gm.hand.push(card));
        this.gm.log(`📥 Pioche ${effect.value} carte(s)`);
    }

    resolveKeepNextTurn(sourceCard) {
        sourceCard._keepNextTurn = true;
        this.gm.log(`🔄 ${sourceCard.name} reviendra en main`);
    }

    checkUnicornFusion() {
        const unicornIds = ["unicorn_red", "unicorn_blue", "unicorn_yellow"];
        const unicornsInHand = this.gm.hand.filter(c => unicornIds.includes(c.id));
        
        if (unicornsInHand.length === 3) {
            this.gm.log(`🦄✨ FUSION DES UNICORNES !`, "invoke");
            
            unicornsInHand.forEach(unicorn => {
                const index = this.gm.hand.indexOf(unicorn);
                if (index !== -1) {
                    this.gm.hand.splice(index, 1);
                }
                this.gm.banished.push(unicorn);
            });
            
            const treasure = {...UNICORN_TREASURE_CARD};
            this.gm.hand.push(treasure);
            this.gm.log(`🏆 Unicorn Treasure ajouté en main !`, "invoke");
        }
    }

    resolveFreezeEnemy(effect) {
        this.gm.enemyFrozenAttacks += effect.duration;
        this.gm.log(`❄️ ${effect.duration} attaque(s) gelée(s)`, "invoke");
    }

    resolveConditionalFreeze(effect, sourceCard, positionInTurn, previousCards) {
        const conditionMet = this.checkCondition(effect.condition, sourceCard, positionInTurn, previousCards);
        
        if (conditionMet) {
            this.gm.enemyFrozenAttacks += effect.duration;
            this.gm.log(`❄️ ${effect.duration} attaque(s) gelée(s) !`, "invoke");
        } else {
            this.gm.log(`${sourceCard.name} - Condition non remplie`, "error");
        }
    }

    resolveHealOverTime(effect, sourceCard) {
        for (let i = 1; i <= effect.duration; i++) {
            this.gm.delayedEffects.push({
                name: `${sourceCard.name} (HoT)`,
                turnsRemaining: i,
                effect: { type: "heal", value: effect.healPerTurn }
            });
        }
        this.gm.log(`💚 HoT: ${effect.healPerTurn} PV pendant ${effect.duration} tours`, "heal");
    }

    resolveDeckCountDamage(effect, sourceCard) {
        const deckCount = this.gm.deck.length;
        if (effect.parity === "even" && deckCount % 2 === 0) {
            this.gm.enemy.takeDamage(deckCount);
            this.gm.log(`${sourceCard.name} → ${deckCount} dégâts (deck pair)`, "damage");
        } else if (effect.parity === "odd" && deckCount % 2 === 1) {
            this.gm.enemy.takeDamage(deckCount);
            this.gm.log(`${sourceCard.name} → ${deckCount} dégâts (deck impair)`, "damage");
        } else {
            this.gm.log(`${sourceCard.name} - Condition non remplie (deck: ${deckCount})`, "error");
        }
    }

    resolveDeckCountHeal(effect, sourceCard) {
        const deckCount = this.gm.deck.length;
        if (effect.parity === "odd" && deckCount % 2 === 1) {
            this.gm.player.heal(deckCount);
            this.gm.log(`Soin de ${deckCount} PV (deck impair)`, "heal");
        } else if (effect.parity === "even" && deckCount % 2 === 0) {
            this.gm.player.heal(deckCount);
            this.gm.log(`Soin de ${deckCount} PV (deck pair)`, "heal");
        } else {
            this.gm.log(`${sourceCard.name} - Condition non remplie (deck: ${deckCount})`, "error");
        }
    }

    resolveModifyNextHeal(effect) {
        this.gm.nextHealModifier = { active: true, cardsRemaining: effect.cardsAffected, bonus: effect.healBonus };
        this.gm.log(`💚 Les ${effect.cardsAffected} prochains soins +${effect.healBonus}`);
    }

    resolveSearchTypeToHand(effect) {
        // Chercher X cartes d'un type dans le deck et les ajouter à la main
        const matching = this.gm.deck.filter(c => c.type === effect.cardType);
        const toAdd = [];
        
        for (let i = 0; i < effect.count && matching.length > 0; i++) {
            const idx = Math.floor(Math.random() * matching.length);
            const card = matching.splice(idx, 1)[0];
            // Retirer du deck et ajouter en main
            const deckIdx = this.gm.deck.indexOf(card);
            if (deckIdx !== -1) this.gm.deck.splice(deckIdx, 1);
            toAdd.push(card);
        }
        
        toAdd.forEach(card => this.gm.hand.push(card));
        this.gm.log(`🔍 Pioche ${toAdd.length} ${effect.cardType}(s): ${toAdd.map(c => c.name).join(", ")}`);
    }

    resolveRecoverFromDiscard(effect) {
        if (this.gm.discard.length === 0) {
            this.gm.log(`Défausse vide, aucune carte récupérée`, "error");
            return;
        }
        
        const toRecover = [];
        for (let i = 0; i < effect.count && this.gm.discard.length > 0; i++) {
            const idx = Math.floor(Math.random() * this.gm.discard.length);
            const card = this.gm.discard.splice(idx, 1)[0];
            toRecover.push(card);
        }
        
        toRecover.forEach(card => this.gm.hand.push(card));
        this.gm.log(`♻️ Récupère ${toRecover.length} carte(s): ${toRecover.map(c => c.name).join(", ")}`);
    }

    resolveConditionalDamage(effect, sourceCard) {
        let bonus = 0;
        
        if (effect.condition.type === "discard_count") {
            if (this.gm.discard.length > effect.condition.threshold) {
                bonus = effect.value;
                this.gm.log(`Condition discard remplie! +${effect.value} dmg bonus`);
            }
        }
        
        if (bonus > 0) {
            this.gm.enemy.takeDamage(bonus);
            this.gm.log(`${sourceCard.name} inflige ${bonus} dmg supplémentaires`, "damage");
        }
    }

    resolveRepeatPreviousAction(sourceCard, positionInTurn, previousCards) {
        if (previousCards.length === 0) {
            this.gm.log(`Aucune carte précédente à répéter`, "error");
            return;
        }
        
        const prevCard = previousCards[previousCards.length - 1];
        this.gm.log(`🔄 Déjà-Vu répète ${prevCard.name}`, "invoke");
        
        // Répéter TOUS les effets (sans filtre)
        prevCard.effects.forEach(effect => {
            this.resolveEffect(effect, prevCard, positionInTurn, previousCards);
        });
    }

    resolveReflectDamage(effect) {
        // Tracker les dégâts bloqués cette action (quand l'ennemi attaque)
        if (!this.gm.damageBlockedThisAction) {
            this.gm.damageBlockedThisAction = 0;
        }
        
        // Ajouter un flag pour la prochaine attaque ennemie
        this.gm.pendingReflection = { active: true, multiplier: effect.damageMultiplier };
        this.gm.log(`🔙 Boomerang armé: réfléchit 50% des dégâts`);
    }

    resolveGambitRoll(sourceCard) {
        const roll = Math.random();
        
        if (roll < 0.5) {
            // Succès: 30 dmg
            this.gm.enemy.takeDamage(30);
            this.gm.log(`🎲 Gambit réussi! 30 dmg`, "damage");
            sourceCard._dealtDamage = true;
        } else {
            // Échec: -5 PV
            this.gm.player.currentHp = Math.max(0, this.gm.player.currentHp - 5);
            this.gm.log(`🎲 Gambit échoué! -5 PV`, "damage");
        }
    }

    resolveConditionalHealAndDraw(effect) {
        if (this.gm.player.currentHp < this.gm.player.maxHp * effect.condition.threshold) {
            const oldHp = this.gm.player.currentHp;
            this.gm.player.currentHp = this.gm.player.maxHp;
            this.gm.log(`💚 Reborn! Full heal (+${this.gm.player.maxHp - oldHp} PV)`, "heal");
            
            const drawn = this.gm.drawCards(2);
            drawn.forEach(card => this.gm.hand.push(card));
            this.gm.log(`📥 Pioche 2 cartes`);
        } else {
            this.gm.log(`Reborn - Condition non remplie (HP: ${this.gm.player.currentHp}/${this.gm.player.maxHp})`);
        }
    }

    resolveInvokeMythics(effect) {
        for (let i = 0; i < effect.count; i++) {
            const mythics = ALL_CARDS.filter(c => c.rarity === Rarity.MYTHIQUE);
            if (mythics.length > 0) {
                const card = {...mythics[Math.floor(Math.random() * mythics.length)]};
                this.gm.hand.push(card);
                this.gm.log(`✨ ${card.name} invoquée`, "invoke");
            }
        }
    }

    resolveNextCardDamageMultiplier(effect, previousCards) {
        const prevCard = previousCards.length > 0 ? previousCards[previousCards.length - 1] : null;
        if (prevCard && !prevCard._dealtDamage) {
            this.gm.nextCardDamageMultiplier = effect.multiplier;
            this.gm.log(`⚡ Prochain dégât x${effect.multiplier}`);
        }
    }

    resolveNextCardHealMultiplier(effect, previousCards) {
        const prevCard = previousCards.length > 0 ? previousCards[previousCards.length - 1] : null;
        if (prevCard && prevCard._dealtDamage) {
            this.gm.nextCardHealMultiplier = effect.multiplier;
            this.gm.log(`💚 Prochain soin x${effect.multiplier}`);
        }
    }

    resolveDrawPerRarity() {
        const raresInHand = this.gm.hand.filter(c => c.rarity === Rarity.RARE).length;
        if (raresInHand > 0) {
            const drawn = this.gm.drawCards(raresInHand);
            drawn.forEach(card => this.gm.hand.push(card));
            this.gm.log(`📥 Pioche ${raresInHand} carte(s) (${raresInHand} Rares en main)`);
        }
    }

    resolveRandomMythicToTop() {
        if (Math.random() < 0.5) {
            const mythics = ALL_CARDS.filter(c => c.rarity === Rarity.MYTHIQUE);
            if (mythics.length > 0) {
                const randomMythic = {...mythics[Math.floor(Math.random() * mythics.length)]};
                this.gm.deck.push(randomMythic);
                this.gm.log(`🎲 Mythique sur le deck !`, "invoke");
            }
        } else {
            this.gm.log(`🎲 Pas de chance...`);
        }
    }

    resolveDraftAndPlay(effect) {
        const pool = ALL_CARDS.filter(c => c.rarity === effect.rarity);
        if (pool.length > 0) {
            const draftedCard = {...pool[Math.floor(Math.random() * pool.length)]};
            this.gm.log(`🎴 Draft: ${draftedCard.name}`, "invoke");
            this.resolve(draftedCard);
            this.gm.discard.push(draftedCard);
        }
    }

    resolveActiveDraft(effect) {
        // Trigger active draft state in GameManager
        this.gm.startActiveDraft(effect.rarity, effect.cardsToShow || 3);
    }

    applyTypeBonus(damage, attackerType, defenderType) {
        if (attackerType === CardType.REVE && defenderType === CardType.CAUCHEMAR) {
            return damage * 1.25;
        }
        if (attackerType === CardType.CAUCHEMAR && defenderType === CardType.REVE) {
            return damage * 1.25;
        }
        if (attackerType === CardType.REVE && defenderType === CardType.REVE) {
            return damage * 0.75;
        }
        if (attackerType === CardType.CAUCHEMAR && defenderType === CardType.CAUCHEMAR) {
            return damage * 0.75;
        }
        return damage;
    }

    applyPermanentModifiers(damage, cardType) {
        for (let effect of this.gm.permanentEffects) {
            if (effect.type === "damage_boost" && effect.cardType === cardType) {
                damage += effect.value;
            }
        }
        return damage;
    }

    getRandomCardFromPool(filter) {
        let pool = [...ALL_CARDS];

        if (filter?.rarity) {
            pool = pool.filter(c => c.rarity === filter.rarity);
        }
        if (filter?.type) {
            pool = pool.filter(c => c.type === filter.type);
        }

        if (pool.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }
}
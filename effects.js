// ========================================
// EFFECTS.JS - Résolution des effets de cartes
// ========================================

import { createToken } from './tokens.js';
import { ALL_CARDS } from './cards.js';     
import { ALL_CHARMS } from './charms.js';   
import { CardType } from './constants.js';  

export class EffectResolver {
    constructor(gameManager) {
        this.gm = gameManager;
    }
    
    // ========================================
    // RÉSOLUTION PRINCIPALE
    // ========================================
    
    resolveCardEffects(card, slotId) {
        if (!card.effect) return;
        
        const slot = this.gm.board.getSlot(slotId);
        if (!slot) return;
        
        // Si effet unique
        if (!Array.isArray(card.effect)) {
            this.resolveEffect(card.effect, card, slot);
        } else {
            // Si liste d'effets
            card.effect.forEach(eff => this.resolveEffect(eff, card, slot));
        }
    }
    
    resolveEffect(effect, card, slot) {
        
        switch (effect.type) {
            case 'maxxer_dmg':
            case 'maxxer_block':
            case 'maxxer_all':
            case 'maxxer_any':
                break;
            case 'bonus_neighbors':
                this.resolveBonusNeighbors(slot, effect.value);
                break;
            case 'penalty_neighbors':
                this.resolveBonusNeighbors(slot, -effect.value);
                break;
            case 'heal':
                // Sera résolu par bouton Player Resolve
                break;
            case 'draw':
                // Sera résolu par bouton Player Resolve
                break;
            case 'instant_draw':  
                this.resolveInstantDraw(effect.value);
                break;

            // Création de jeton immédiate
            case 'instant_create_token':
                this.resolveInstantCreateToken(effect);
                break;

            // Discover (popup choix)
            case 'instant_discover':
                this.resolveInstantDiscover(effect);
                break;

            // Transform voisin
            case 'instant_transform_neighbor':
                this.resolveInstantTransformNeighbor(effect, slot);
                break;

            // Dévorer voisins
            case 'instant_devour_neighbors':
                this.resolveInstantDevour(effect, card, slot);
                break;

            case 'instant_all_slots_bonus':
                let count = 0;
                this.gm.board.getAllSlots().forEach(s => {
                    if (s.type !== 'enemy' && s.type !== 'player' && s.id !== slot.id) {
                        s.rewardBonus += effect.value;  
                        count++;
                    }
                });
                this.gm.log(`⭐ All slots: +${effect.value} (${count} slot(s) boosté(s))`);
                break;

            // Missiles (distribution répétée sur slots spécifiques)
            case 'instant_missiles':
                this.resolveMissiles(effect, slot);
                break;

            // Distribution aléatoire
            case 'instant_distribute':
                this.resolveDistribute(effect, slot);
                break;

            // Effets atouts (gérés en fin de tour, pas à la pose)
            case 'atout_draw_eot':
            case 'atout_token_on_discard':
            case 'atout_maxxer_start':
                // Ne rien faire à la pose, effet géré ailleurs
                break;

            // Effets passifs (calculés dynamiquement, pas à la pose)
            case 'aura_tribal':
            case 'count_tribal':
            case 'bonus_per_discard':
                // Ne rien faire à la pose, effet géré dans getFinalCardValue()
                break;
            
            // Effets on_discard (gérés à la défausse, pas à la pose)
            case 'on_discard_create_token':
            case 'on_discard_create_token_same_slot':  
            case 'on_discard_heal':
            case 'on_discard_draw':
                // Ne rien faire à la pose, effet géré dans resolveOnDiscard() ou turnResolver
                break;

            default:
                console.warn(`Effet inconnu: ${effect.type}`);
        }
    }

    resolveInstantDraw(count) {
        this.gm.drawCards(count);
        this.gm.log(`📥 Instant Draw: ${count} carte(s) piochée(s)`);
    }

    // Créer jeton en main immédiatement
    resolveInstantCreateToken(effect) {
        if (this.gm.hand.length >= 10) {
            this.gm.log(`⚠️ Main pleine, jeton non créé`);
            return;
        }
        
        const token = createToken(effect.tokenId);
        if (!token) {
            this.gm.log(`❌ Impossible de créer jeton ${effect.tokenId}`);
            return;
        }
        
        this.gm.hand.push(token);
        this.gm.log(`✨ Jeton ${token.name} créé en main`);
    }

    // Discover : révéler 3 cartes, choisir 1
    resolveInstantDiscover(effect) {
        // Construire le pool selon le type
        let pool = [];
        
        if (effect.pool === 'charms') {
            pool = ALL_CHARMS;
        } else if (effect.pool === 'creatures') {
            pool = ALL_CARDS.filter(c => c.cardType === CardType.CREATURE);
            
            // Appliquer filtre si présent
            if (effect.filter && effect.filter.tag) {
                pool = pool.filter(c => c.tags && c.tags.includes(effect.filter.tag));
            }
        }
        
        if (pool.length === 0) {
            this.gm.log(`⚠️ Pool vide pour discover`);
            return;
        }
        
        // Tirer 3 cartes aléatoires (ou moins si pool petit)
        const count = Math.min(effect.count, pool.length);
        const options = [];
        const poolCopy = [...pool];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * poolCopy.length);
            options.push(poolCopy[randomIndex]);
            poolCopy.splice(randomIndex, 1);
        }
        
        // Afficher popup de choix
        this.showDiscoverPopup(options);
    }

    // Popup discover
    showDiscoverPopup(options) {
        const popup = document.getElementById('popup');
        popup.style.display = 'flex';
        
        popup.innerHTML = `
            <h2 style="text-align: center; color: #FFD700; margin-bottom: 20px;">
                🔍 DISCOVER - Choisis une carte
            </h2>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                ${options.map((card, index) => `
                    <button id="discover_${index}" style="
                        padding: 15px;
                        background: rgba(255, 215, 0, 0.2);
                        border: 2px solid #FFD700;
                        border-radius: 10px;
                        color: #FFD700;
                        cursor: pointer;
                        font-size: 14px;
                        min-width: 150px;
                        max-width: 200px;
                    ">
                        <div style="font-weight: bold; margin-bottom: 8px;">${card.name}</div>
                        <div style="font-size: 12px; color: #AED581; margin: 5px 0;">
                            ${card.description || 'Value ' + card.value}
                        </div>
                        <div style="font-size: 11px; color: #888; margin-top: 5px;">
                            ${card.rarity}
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Handlers
        options.forEach((card, index) => {
            document.getElementById(`discover_${index}`).onclick = () => {
                popup.style.display = 'none';
                
                // Ajouter carte en main
                if (this.gm.hand.length < 10) {
                    const cardCopy = {...card};
                    this.gm.hand.push(cardCopy);
                    this.gm.log(`🔍 Discover: ${card.name} ajoutée en main`);
                    this.gm.ui.render();
                } else {
                    this.gm.log(`⚠️ Main pleine, carte non ajoutée`);
                }
            };
        });
    }

    // Transform voisin aléatoire
    resolveInstantTransformNeighbor(effect, sourceSlot) {
        const neighbors = this.gm.board.getNeighbors(sourceSlot.id);
        const neighborsWithCards = neighbors.filter(n => n.card !== null);
        
        if (neighborsWithCards.length === 0) {
            this.gm.log(`⚠️ Aucun voisin à transformer`);
            return;
        }
        
        // Choisir voisin aléatoire
        const targetSlot = neighborsWithCards[Math.floor(Math.random() * neighborsWithCards.length)];
        const oldCard = targetSlot.card;
        
        // Construire pool de transformation
        let pool = ALL_CARDS.filter(c => c.cardType === CardType.CREATURE);
        
        if (effect.filter && effect.filter.tag) {
            pool = pool.filter(c => c.tags && c.tags.includes(effect.filter.tag));
        }
        
        if (pool.length === 0) {
            this.gm.log(`⚠️ Pool vide pour transformation`);
            return;
        }
        
        // Choisir carte aléatoire
        const newCard = {...pool[Math.floor(Math.random() * pool.length)]};
        
        // Remplacer
        targetSlot.card = newCard;
        this.gm.discard.push(oldCard);
        
        this.gm.log(`🔄 ${oldCard.name} transformée en ${newCard.name}`);
    }

    // Dévorer voisins (gain value ×mult)
    resolveInstantDevour(effect, sourceCard, sourceSlot) {
        const neighbors = this.gm.board.getNeighbors(sourceSlot.id);
        const neighborsWithCards = neighbors.filter(n => n.card !== null);
        
        if (neighborsWithCards.length === 0) {
            this.gm.log(`⚠️ Aucun voisin à dévorer`);
            return;
        }
        
        let totalGained = 0;
        const devoured = [];
        
        neighborsWithCards.forEach(neighborSlot => {
            const card = neighborSlot.card;
            const cardValue = this.gm.board.getFinalCardValue(neighborSlot.id);
            const gainedValue = cardValue * effect.multiplier;
            
            totalGained += gainedValue;
            devoured.push(`${card.name} (${cardValue})`);
            
            // Défausser voisin
            this.gm.discard.push(card);
            neighborSlot.removeCard();
            neighborSlot.neighborBonus = 0;
            neighborSlot.rewardBonus = 0;
        });
        
        // Ajouter bonus à la source
        sourceSlot.rewardBonus += totalGained;
        
        this.gm.log(`🍽️ Dévore: ${devoured.join(', ')} → +${totalGained} value`);
    }
    
    // ========================================
    // MAXXER BOOST
    // ========================================
    
    resolveMaxxerBoost(type, amount) {
        const maxxer = this.gm.maxxers[type];
        if (!maxxer) return;
        
        const oldLevel = maxxer.level;
        maxxer.boost(amount);
        const newLevel = maxxer.level;
        
        const icon = type === 'damage' ? '🔥' : '🛡️';
        this.gm.log(`${icon} Maxxer ${type.toUpperCase()} : +${amount} (${oldLevel} → ${newLevel})`);
    }
    
    // DISTIBUTIONS ALEATOIRES

    // Résoudre missiles
    resolveMissiles(effect, sourceSlot) {
        const validSlots = this.gm.board.getAllSlots().filter(s => 
            effect.targetTypes.includes(s.type)
        );
        
        if (validSlots.length === 0) {
            this.gm.log(`⚠️ Aucun slot valide pour missiles`);
            return;
        }
        
        let distribution = {};
        
        for (let i = 0; i < effect.count; i++) {
            const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
            randomSlot.rewardBonus += effect.value;
            
            // Tracking pour log
            if (!distribution[randomSlot.id]) distribution[randomSlot.id] = 0;
            distribution[randomSlot.id]++;
        }
        
        // Log résumé
        const summary = Object.entries(distribution)
            .map(([slotId, count]) => `${slotId} ×${count}`)
            .join(', ');
        
        this.gm.log(`🚀 ${effect.count} missiles (×${effect.value}): ${summary}`);
    }

    // Résoudre distribution aléatoire
    resolveDistribute(effect, sourceSlot) {
        let validSlots = this.gm.board.getAllSlots().filter(s => 
            effect.targetTypes.includes(s.type)
        );
        
        // Si onlyOccupied, filtrer slots avec cartes
        if (effect.onlyOccupied) {
            validSlots = validSlots.filter(s => s.card !== null);
        }
        
        if (validSlots.length === 0) {
            this.gm.log(`⚠️ Aucun slot valide pour distribution`);
            return;
        }
        
        let remaining = effect.value;
        let distribution = {};
        
        // Distribuer point par point aléatoirement
        while (remaining > 0) {
            const randomSlot = validSlots[Math.floor(Math.random() * validSlots.length)];
            randomSlot.rewardBonus += 1;
            remaining--;
            
            // Tracking
            if (!distribution[randomSlot.id]) distribution[randomSlot.id] = 0;
            distribution[randomSlot.id]++;
        }
        
        // Log résumé
        const summary = Object.entries(distribution)
            .map(([slotId, bonus]) => `${slotId} +${bonus}`)
            .join(', ');
        
        this.gm.log(`💰 Distribution ${effect.value}: ${summary}`);
    }

    // ========================================
    // BONUS VOISINS
    // ========================================
    
    resolveBonusNeighbors(slot, bonus) {
        const neighbors = this.gm.board.getNeighbors(slot.id);
        
        if (neighbors.length === 0) {
            this.gm.log(`Aucun voisin pour ${slot.id}`);
            return;
        }
        
        neighbors.forEach(neighborSlot => {
            // Appliquer bonus sur le SLOT, pas sur la carte
            neighborSlot.neighborBonus += bonus;
            
            const sign = bonus > 0 ? '+' : '';
            this.gm.log(`🔗 ${neighborSlot.id}: bonus ${sign}${bonus} (total: ${neighborSlot.bonus})`);
        });
    }

    // Résoudre effets on_discard (créatures + charmes)
    resolveOnDiscard(card) {
        if (!card.effect) return;
        
        const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
        
        effects.forEach(eff => {
            switch(eff.type) {
                case 'charm_heal_on_discard':
                case 'on_discard_heal':  // Nom générique pour créatures futures
                    const oldHp = this.gm.player.currentHp;
                    this.gm.player.currentHp = Math.min(this.gm.player.maxHp, oldHp + eff.value);
                    const actualHeal = this.gm.player.currentHp - oldHp;
                    if (actualHeal > 0) {
                        this.gm.log(`💚 ${card.name}: Heal ${actualHeal} HP (défausse)`);
                    }
                    break;
                
                case 'on_discard_create_token':
                case 'charm_create_token_on_discard':
                    if (this.gm.hand.length < 10) {
                        const token = createToken(eff.tokenId);
                        if (token) {
                            this.gm.hand.push(token);
                            this.gm.log(`✨ ${card.name}: Jeton ${token.name} créé (défausse)`);
                        }
                    }
                    break;
                
                case 'on_discard_draw':
                    this.gm.drawCards(eff.value);
                    this.gm.log(`🔥 ${card.name}: Pioche ${eff.value} (défausse)`);
                    break;
            }
        });
    }
    
    // ========================================
    // RÉSOLUTION PLAYER (Heal/Draw)
    // ========================================
    
    resolvePlayerSlots() {
        const playerSlots = this.gm.board.getSlotsByType('player');
        let totalHeal = 0;
        let totalDraw = 0;
        
        playerSlots.forEach(slot => {
            if (!slot.card) return;
            
            const card = slot.card;
            if (!card.effect) return;
            
            // Gérer liste ou effet unique
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            
            effects.forEach(effect => {
                if (effect.type === 'heal') {
                    totalHeal += effect.value;
                } else if (effect.type === 'draw') {
                    totalDraw += effect.value;
                }
            });
        });
        
        // Appliquer heal
        if (totalHeal > 0) {
            const oldHp = this.gm.player.currentHp;
            this.gm.player.currentHp = Math.min(this.gm.player.maxHp, oldHp + totalHeal);
            const actualHeal = this.gm.player.currentHp - oldHp;
            this.gm.log(`💚 Soin: +${actualHeal} HP (${oldHp} → ${this.gm.player.currentHp})`);
        }
        
        // Appliquer draw
        if (totalDraw > 0) {
            for (let i = 0; i < totalDraw; i++) {
                if (this.gm.deck.length === 0 && this.gm.discard.length > 0) {
                    this.gm.reshuffle();
                }
                
                if (this.gm.deck.length > 0 && this.gm.hand.length < 12) {
                    const drawn = this.gm.deck.pop();
                    this.gm.hand.push(drawn);
                }
            }
            this.gm.log(`📥 Pioche: ${totalDraw} carte(s)`);
        }
        
        return { heal: totalHeal, draw: totalDraw };
    }
}
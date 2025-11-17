// ========================================
// UI.JS - Gestion du rendu visuel
// ========================================

import { BoardLinesRenderer } from './boardLines.js';
import { CardType } from './constants.js';

export class UIManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.boardElement = document.getElementById('board');
        this.handElement = document.getElementById('handContainer');
        this.logElement = document.getElementById('logContainer');

        this.selectedCardIndex = null;
        this.highlightedSlots = [];

        // Désélectionner au click ailleurs
        this.setupDeselectListener();

        this.linesRenderer = new BoardLinesRenderer(gameManager);
    }

    //déselection si clique ailleurs que sur une carte
    setupDeselectListener() {
        document.getElementById('gameContainer').addEventListener('click', (e) => {
            // Ne rien faire si click sur carte, slot, OU enemyInfo
            if (e.target.closest('.card') || 
                e.target.closest('.slot') || 
                e.target.closest('#enemyInfo') ||
                e.target.closest('#playerInfo')) {
                return;
            }
            
            // Désélectionner
            if (this.selectedCardIndex !== null) {
                this.selectedCardIndex = null;
                this.clearHighlights();
                this.renderHand();
            }
        });
    }
    
    // ========================================
    // RENDER COMPLET
    // ========================================
    
    render() {
        this.renderBoard();
        this.renderEntities();
        this.renderPlayerInfo();
        this.renderEnemyInfo();
        this.renderHand();
        this.renderControls();
        this.renderLog();
        this.setupTargeting();
        this.highlightTarget();
        this.linesRenderer.render();
    }


    
    // ========================================
    // BOARD (tous les slots)
    // ========================================
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        const allSlots = this.gm.board.getAllSlots();
        
        allSlots.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'slot';
            slotDiv.id = slot.id;
            slotDiv.dataset.type = slot.type;
            
            // Position en %
            slotDiv.style.left = `${slot.position.x}%`;
            slotDiv.style.top = `${slot.position.y}%`;
            
            // Carte posée
            if (slot.card) {
                slotDiv.classList.add('occupied');
                
                
        // Si slot enemy, afficher HP + effets
        if (slot.type === 'enemy' && slot.card.currentHp !== undefined) {
            // Récupérer effets passifs
            let effectText = '';
            if (slot.card.effect) {
                const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
                
                effectText = effects.map(eff => {
                    if (eff.type === 'boost_damage') return `+${eff.value} 🔥`;
                    if (eff.type === 'boost_block') return `+${eff.value} 🛡️`;
                    return '';
                }).filter(t => t).join(' ');
            }
            
            // Afficher onDeath (MANQUANT DANS TON CODE)
            let onDeathText = '';
            if (slot.card.onDeath) {
                switch(slot.card.onDeath.type) {
                    case 'draw':
                        onDeathText = `💀 Draw ${slot.card.onDeath.value}`;
                        break;
                    case 'add_rare_card':
                        onDeathText = `💀 Rare`;
                        break;
                    case 'heal':
                        onDeathText = `💀 Heal ${slot.card.onDeath.value}`;
                        break;
                }
            }
            
            // Countdown timer
            let timerText = '';
            if (slot.card.timer && slot.card.turnPlaced !== null) {
                const turnsElapsed = this.gm.turnNumber - slot.card.turnPlaced;
                const turnsRemaining = slot.card.timer.turns - turnsElapsed;
                
                if (turnsRemaining > 0) {
                    const effect = slot.card.timer.effect;
                    let effectDesc = '';
                    if (effect.type === 'damage_player') effectDesc = `${effect.value} DMG`;
                    if (effect.type === 'heal_enemy') effectDesc = `Heal ${effect.value}`;
                    
                    timerText = `⏰${turnsRemaining}: ${effectDesc}`;
                }
            }

            

            slotDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 2px; align-items: center;">
                    <div style="font-size: 13px; font-weight: bold;">
                        ${slot.card.name}
                    </div>
                    <div style="font-size: 15px; color: #FF6347;">
                        ${slot.card.currentHp}/${slot.card.maxHp}
                    </div>
                    ${effectText ? `
                        <div style="font-size: 12px; color: #FFD700;">
                            ${effectText}
                        </div>
                    ` : ''}
                    ${onDeathText ? `
                        <div style="font-size: 11px; color: #9370DB;">
                            ${onDeathText}
                        </div>
                    ` : ''}
                    ${timerText ? `
                        <div style="font-size: 11px; color: #FF4500; font-weight: bold;">
                            ${timerText}
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            const finalValue = this.gm.board.getFinalCardValue(slot.id);
            const baseValue = slot.card.value || 0;
            const numCharms = slot.equipments.length;
            
            // Construction bonus text
            let parts = [baseValue];
            if (slot.bonus !== 0) parts.push(`${slot.bonus > 0 ? '+' : ''}${slot.bonus}`);
            if (numCharms > 0) parts.push(`+${numCharms}⚙️`);
            
            const bonusText = parts.length > 1 ? ` (${parts.join(' ')})` : '';
            
            slotDiv.innerHTML = `
                <span style="font-size: 20px; font-weight: bold;">${finalValue}</span>
                ${bonusText ? `<div style="font-size: 10px; color: #AED581;">${bonusText}</div>` : ''}
            `;
        }
                
                // Click pour retirer (sauf enemy/player)
                if (slot.type !== 'enemy' && slot.type !== 'player') {
                    slotDiv.style.cursor = 'pointer';
                    slotDiv.onclick = (e) => {
                        // Si carte sélectionnée en main → géré par setupTargeting
                        if (this.selectedCardIndex !== null) {
                            return;
                        }
                        
                        // Sinon → retirer carte
                        e.stopPropagation();
                        this.removeCardFromSlot(slot.id);
                    };
                }
            }

            // Slot vide avec bonus en attente
            else if (slot.bonus !== 0 && slot.type !== 'enemy' && slot.type !== 'player') {
                slotDiv.innerHTML = `
                    <div style="font-size: 18px; color: #FFD700; font-weight: bold;">
                        +${slot.bonus}
                    </div>
                    <div style="font-size: 10px; color: #FFD700; opacity: 0.7;">
                        bonus
                    </div>
                `;
            }

            // Hover tooltip
            if (slot.card) {
                slotDiv.onmouseenter = (e) => {
                    this.showCardTooltip(slot.card, e.clientX, e.clientY, slot.id);  // Passer slotId
                };
                
                slotDiv.onmouseleave = () => {
                    this.hideCardTooltip();
                };
                
                slotDiv.onmousemove = (e) => {
                    // Update position si souris bouge
                    const tooltip = document.getElementById('cardTooltip');
                    if (tooltip && tooltip.style.display === 'block') {
                        tooltip.style.left = `${e.clientX + 15}px`;
                        tooltip.style.top = `${e.clientY + 15}px`;
                    }
                };
            }
            
            this.boardElement.appendChild(slotDiv);
        });
    }
    
    setupTargeting() {
        // Utiliser délégation pour ennemi principal
        const enemyInfo = document.getElementById('enemyInfo');
        if (enemyInfo) {
            enemyInfo.style.cursor = 'pointer';
            enemyInfo.style.border = '3px solid #8B0000';  // Indique cliquable
            
            // Supprimer ancien handler pour éviter doublons
            enemyInfo.onclick = null;
            
            enemyInfo.onclick = (e) => {
                e.stopPropagation();  // Empêcher propagation
                this.gm.setTarget('enemy');
                this.highlightTarget();
                this.renderLog();
            };
        } 
        
        // Click sur slots enemy
        this.gm.board.slots.enemy.forEach(slot => {
            const slotElement = document.getElementById(slot.id);
            if (slotElement && slot.card) {
                slotElement.style.cursor = 'pointer';
                
                // Supprimer ancien handler
                slotElement.onclick = null;
                
                slotElement.onclick = (e) => {
                    e.stopPropagation();
                    this.gm.setTarget(slot.id);
                    this.highlightTarget();
                    this.renderLog();
                };
            }
        });

        // Click sur autres slots (retrait si pas de carte sélectionnée)
        ['block', 'damage', 'state', 'shared'].forEach(type => {
            this.gm.board.slots[type].forEach(slot => {
                const slotElement = document.getElementById(slot.id);
                if (slotElement && slot.card) {
                    slotElement.style.cursor = 'pointer';
                    
                    const existingOnClick = slotElement.onclick;
                    slotElement.onclick = (e) => {
                        // Si carte sélectionnée en main → placer carte (existant)
                        if (this.selectedCardIndex !== null && this.highlightedSlots.includes(slot.id)) {
                            if (existingOnClick) existingOnClick(e);
                            return;
                        }
                        
                        // Sinon → retirer carte
                        e.stopPropagation();
                        this.removeCardFromSlot(slot.id);
                    };
                }
            });
        });
    }

    highlightTarget() {
        // Retirer ancien highlight
        document.querySelectorAll('.target-highlight').forEach(el => {
            el.classList.remove('target-highlight');
            el.style.boxShadow = '';
        });
        
        // Ajouter nouveau highlight
        if (this.gm.currentTarget === 'enemy') {
            const enemyInfo = document.getElementById('enemyInfo');
            if (enemyInfo) {
                enemyInfo.classList.add('target-highlight');
                enemyInfo.style.boxShadow = '0 0 20px #FF0000';
            }
        } else {
            const slotElement = document.getElementById(this.gm.currentTarget);
            if (slotElement) {
                slotElement.classList.add('target-highlight');
                slotElement.style.boxShadow = '0 0 20px #FF0000';
            }
        }
    }

    // ========================================
    // ENTITÉS (BLOCK, DAMAGE, STATE)
    // ========================================
    
    renderEntities() {
        // Positions des entités (rectangles)
        const entities = [
            { type: 'block', name: 'BLOCK', x: 26, y: 40, maxxer: this.gm.maxxers.block },
            { type: 'damage', name: 'DAMAGE', x: 50, y: 40, maxxer: this.gm.maxxers.damage },
            { type: 'state', name: 'STATE', x: 74, y: 40, maxxer: null }
        ];
        
        entities.forEach(entity => {
            const entityDiv = document.createElement('div');
            entityDiv.className = 'entity';
            entityDiv.dataset.type = entity.type;
            entityDiv.style.left = `${entity.x}%`;
            entityDiv.style.top = `${entity.y}%`;
            
            let html = `<div class="entity-name">${entity.name}</div>`;
            
            // Maxxer pour BLOCK et DAMAGE
            if (entity.maxxer) {
                const icon = entity.type === 'damage' ? '🔥' : '🛡️';
                const mult = entity.maxxer.getMultiplier();
                html += `<div class="entity-maxxer">${icon} x${mult.toFixed(1)}</div>`;
            }
            
            // Tier et progression pour STATE
            if (entity.type === 'state') {
                const stateData = this.gm.calculateStateValue();
                const nextThreshold = stateData.tier < 4 ? (stateData.tier + 1) * 10 : null;
                
                html += `
                    <div style="font-size: 20px; font-weight: bold; margin: 5px 0; color: #FFD700;">
                        🌟 Tier ${stateData.tier}
                    </div>
                    <div style="font-size: 16px; color: #AED581;">
                        ${stateData.value}${nextThreshold ? ` / ${nextThreshold}` : ''}
                    </div>
                `;
                
               /*  if (nextThreshold) {
                    html += `
                        <div style="font-size: 10px; opacity: 0.6; margin-top: 3px;">
                            Prochain: ${nextThreshold - stateData.value}
                        </div>
                    `;
                } else {
                    html += `
                        <div style="font-size: 10px; opacity: 0.6; margin-top: 3px;">
                            Max tier
                        </div>
                    `;
                } */
            }
            
            entityDiv.innerHTML = html;
            
            this.boardElement.appendChild(entityDiv);
        });
    }
    
    // ========================================
    // PLAYER INFO
    // ========================================
    
    renderPlayerInfo() {
        const playerDiv = document.getElementById('playerInfo');
        if (!playerDiv) return;
        
        const hp = this.gm.player;
        playerDiv.innerHTML = `
            <div class="hp-bar">❤️ ${hp.currentHp}/${hp.maxHp}</div>
            <div style="font-size: 14px;">PLAYER</div>
            <div style="font-size: 12px; color: #aaa; margin-top: 5px;">
                Tour ${this.gm.turnNumber} | 📚 Deck: ${this.gm.deck.length} | 🗑️ Défausse: ${this.gm.discard.length}
            </div>
            <div style="font-size: 13px; color: #FFD700; margin-top: 8px; font-weight: bold;">
                🛒 Marchandises: ${this.gm.marchandises}
            </div>
            ${this.gm.marchandises > 0 ? `
                <button id="shop-button" style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #FFD700, #FFA500);
                    border: 2px solid #FFD700;
                    border-radius: 8px;
                    color: #000;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 13px;
                ">
                    🛒 Ouvrir la Boutique
                </button>
            ` : ''}
        `;
        
        // Attacher l'event listener au bouton
        const shopButton = document.getElementById('shop-button');
        if (shopButton) {
            shopButton.onclick = () => this.showShopPopup();
        }
    }

    //boutique

    showShopPopup() {
        const popup = document.getElementById('popup');
        if (!popup) return;
        
        popup.style.display = 'flex';
        
        popup.innerHTML = `
            <div style="background: rgba(0,0,0,0.95); padding: 30px; border-radius: 15px; max-width: 800px; border: 3px solid #FFD700;">
                <h2 style="text-align: center; color: #FFD700; margin-bottom: 25px;">
                    🛒 BOUTIQUE DU TRAFIQUANT
                </h2>
                <div style="text-align: center; margin-bottom: 20px; font-size: 16px; color: #FFD700;">
                    Marchandises disponibles: <strong>${this.gm.marchandises}</strong>
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    ${this.renderShopTier('tier1', 5)}
                    ${this.renderShopTier('tier2', 10)}
                    ${this.renderShopTier('tier3', 15)}
                </div>
                
                <button id="close-shop" style="
                    margin-top: 25px;
                    padding: 10px 20px;
                    background: #666;
                    border: 2px solid #888;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                ">
                    Fermer
                </button>
            </div>
        `;
        
        // Event listener pour fermer
        document.getElementById('close-shop').onclick = () => {
            popup.style.display = 'none';
        };
        // Event listeners pour les boutons d'achat
        ['tier1', 'tier2', 'tier3'].forEach(tier => {
            const buyButton = document.getElementById(`buy-${tier}`);
            if (buyButton && !buyButton.disabled) {
                buyButton.onclick = () => this.buyShopReward(tier);
            }
        });
    }

    renderShopTier(tier, price) {
        const canAfford = this.gm.marchandises >= price;
        
        return `
            <div style="
                padding: 20px;
                background: ${canAfford ? 'rgba(255, 215, 0, 0.15)' : 'rgba(128, 128, 128, 0.15)'};
                border: 2px solid ${canAfford ? '#FFD700' : '#666'};
                border-radius: 10px;
                min-width: 200px;
                text-align: center;
            ">
                <h3 style="color: ${canAfford ? '#FFD700' : '#888'}; margin-bottom: 10px;">
                    ${tier === 'tier1' ? '⭐ Tier 1' : tier === 'tier2' ? '⭐⭐ Tier 2' : '⭐⭐⭐ Tier 3'}
                </h3>
                <div style="color: #FFD700; font-size: 18px; margin-bottom: 15px;">
                    💰 ${price} marchandises
                </div>
                <button id="buy-${tier}" ${!canAfford ? 'disabled' : ''} style="
                    padding: 10px 20px;
                    background: ${canAfford ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#444'};
                    border: 2px solid ${canAfford ? '#FFD700' : '#666'};
                    border-radius: 8px;
                    color: ${canAfford ? '#000' : '#666'};
                    font-weight: bold;
                    cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                ">
                    Acheter
                </button>
            </div>
        `;
    }

    buyShopReward(tier) {
        const prices = { tier1: 5, tier2: 10, tier3: 15 };
        const price = prices[tier];
        
        // Vérifier si le joueur a assez de marchandises
        if (this.gm.marchandises < price) {
            this.gm.log(`⚠️ Pas assez de marchandises (besoin de ${price})`);
            return;
        }
        
        // Vérifier si la main n'est pas pleine
        if (this.gm.hand.length >= 10) {
            this.gm.log(`⚠️ Main pleine ! Impossible d'acheter.`);
            return;
        }
        
        // Déduire le coût
        this.gm.marchandises -= price;
        
        // Donner une carte aléatoire du tier
        this.gm.giveRandomShopReward(tier);
        
        // Fermer et rafraîchir
        document.getElementById('popup').style.display = 'none';
        this.render();
    }
    
    // ========================================
    // ENEMY INFO
    // ========================================
    
    renderEnemyInfo() {
        const enemyDiv = document.getElementById('enemyInfo');
        if (!enemyDiv) return;
        
        const enemy = this.gm.enemy;
        enemyDiv.innerHTML = `
            <div style="font-size: 20px; color: #FF6347;">Gros Monstre Méchant</div>
            <div class="hp-bar">💀 ${enemy.currentHp}/${enemy.maxHp}</div>
            <div style="font-size: 16px; color: #aaa;">Prochaine attaque : ${enemy.attackDamage} dmg</div>
        `;
    }
    
    // ========================================
    // MAIN (cartes en main)
    // ========================================
    
renderHand() {
    this.handElement.innerHTML = '';
    
    if (this.gm.hand.length === 0) {
        this.handElement.innerHTML = '<div style="color: #aaa; padding: 20px;">Main vide</div>';
        return;
    }
    
    this.gm.hand.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.rarity = card.rarity;
        cardDiv.dataset.index = index;

        // Style spécial pour charmes
        if (card.cardType === CardType.CHARM) {
            cardDiv.style.borderColor = '#9370DB';  // Violet
            cardDiv.style.background = 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%)';
        }

        // Style spécial pour atouts
        if (card.cardType === CardType.ATOUT) {
            cardDiv.style.borderColor = '#32CD32';  // Vert lime
            cardDiv.style.background = 'linear-gradient(135deg, #006400 0%, #228B22 100%)';
        }
        
        if (card.isArtifact) {
            cardDiv.classList.add('artifact');
        }
        
        // Highlight si sélectionnée
        if (index === this.selectedCardIndex) {
            cardDiv.style.border = '4px solid #00FF00';
            cardDiv.style.transform = 'translateY(-10px)';
            cardDiv.style.boxShadow = '0 10px 30px rgba(0, 255, 0, 0.8)';
        }
        
        // Afficher "X only" si spécialisée
        let slotText = '';
        if (card.slotTypes.length === 1) {
            const slotNames = {
                damage: 'DMG',
                block: 'BLOCK',
                shared: 'SHARED',
                player: 'PLAYER',
                enemy: 'ENEMY',
                state: 'STATE'
            };
            slotText = `${slotNames[card.slotTypes[0]] || card.slotTypes[0]} only`;
        }
        
        // Texte effet
        let effectText = '';
        if (card.effect) {
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            
            effectText = effects.map(eff => {
                switch(eff.type) {
                    case 'maxxer_dmg': return `Maxxer DMG +${eff.value}`;
                    case 'maxxer_block': return `Maxxer BLOCK +${eff.value}`;
                    case 'maxxer_all': return `Tous maxxers +${eff.value}`;
                    case 'maxxer_any': return `Maxxer slot +${eff.value}`;
                    case 'bonus_neighbors': return `Voisins +${eff.value}`;
                    case 'penalty_neighbors': return `Voisins -${eff.value}`;
                    case 'heal': return `Heal ${eff.value}`;
                    case 'draw': return `Pioche ${eff.value}`;
                    case 'instant_draw': return `📥 Pioche ${eff.value} (immédiat)`;
                    case 'instant_all_slots_bonus': return `All slots +${eff.value}`;  
                    
                    // Effets auras tribales
                    case 'aura_tribal':
                        if (eff.includesSelf) {
                            return `Toutes ${eff.tag}s +${eff.value}`;
                        } else {
                            return `Autres ${eff.tag}s +${eff.value}`;
                        }

                    // Distribution aléatoire
                    case 'instant_missiles':
                        return `${eff.count} missiles ×${eff.value} sur ${eff.targetTypes.join('/')}`;
                    case 'instant_distribute':
                        const occupiedText = eff.onlyOccupied ? ' (slots occupés)' : '';
                        return `Distribue ${eff.value} sur ${eff.targetTypes.join('/')}${occupiedText}`;    

                    // Count tribal (self-scaling)
                    case 'count_tribal':
                        if (eff.includesSelf) {
                            return `+${eff.value} par ${eff.tag} (inclus soi-même)`;
                        } else {
                            return `+${eff.value} par autre ${eff.tag}`;
                        }

                    case 'instant_devour_neighbors':
                        return `Dévore voisins (×${eff.multiplier} value)`;

                    // Création jetons
                    case 'instant_create_token':
                        return `Crée jeton en main`;
                    case 'instant_create_token_on_neighbors':
                        return `Crée jetons sur voisins vides`;
                    case 'on_discard_create_token':
                        return `Crée jeton à la défausse`;
                    case 'on_discard_draw':
                        return `Draw ${eff.value} à la défausse`;
                    case 'on_discard_create_token_same_slot':
                        return `Crée jeton sur même slot (défausse)`;
                    case 'on_discard_create_creature_same_slot':
                        if (eff.filter && eff.filter.tag) {
                            return `Crée ${eff.filter.tag} aléatoire sur même slot (défausse)`;
                        } else if (eff.filter && eff.filter.rarity) {
                            return `Crée créature ${eff.filter.rarity} aléatoire sur même slot (défausse)`;
                        }
                        return `Crée créature aléatoire sur même slot (défausse)`;
                    case 'bonus_per_discard':
                        return `+${eff.value} par ${eff.tag} défaussé au tour précédent`;

                    // Effets charmes
                    case 'charm_boost_creature': return `Créature +${eff.value}`;
                    case 'charm_boost_neighbors': return `Voisins +${eff.value}`;
                    case 'charm_penalty_neighbors': return `Voisins ${eff.value}`;
                    case 'charm_maxxer_slot': return `Maxxer +${eff.value}`;
                    case 'charm_random_boost': return `Créature +${eff.min} à +${eff.max}`;
                    case 'charm_heal_on_discard': return `Heal ${eff.value} à la défausse`;
                    case 'atout_damage_eot': return `Dégâts +${eff.value} fin de tour`;
                    case 'atout_block_eot': return `Blocage +${eff.value} fin de tour`;
                    case 'atout_heal_on_charm_played' : return `Heal ${eff.value} quand un charme est joué`;
                    // 🆕 Discover / Transform
                    case 'instant_discover':
                        if (eff.filter && eff.filter.tag) {
                            return `Discover ${eff.filter.tag}`;
                        }
                        return `Discover ${eff.pool}`;

                    case 'instant_transform_neighbor':
                        if (eff.filter && eff.filter.tag) {
                            return `Transform voisin en ${eff.filter.tag}`;
                        }
                        return `Transform voisin`;
                    case 'instant_transform_random_to_mythic':
                        return `Transform créature aléatoire en Mythique`;

                    // Effets atouts
                    case 'atout_draw_eot': 
                        return `Pioche ${eff.value} fin de tour (max ${eff.max_hand} main)`;
                    case 'atout_token_on_discard': 
                        return `Crée jeton ${eff.tag} quand ${eff.tag} défaussé`;
                    case 'atout_maxxer_start': 
                        return `Maxxers débutent à ${eff.start}, ne peuvent pas augmenter`;

                    default: return eff.type;
                }
            }).join(' • ');
        }
        
        cardDiv.innerHTML = `
            <div class="card-value">${card.value !== undefined ? card.value : '?'}</div>
            <div class="card-name">${card.name}</div>
            ${slotText ? `
                <div style="font-size: 11px; color: #FF6347; margin: 5px 0; font-weight: bold; text-align: center;">
                    ${slotText}
                </div>
            ` : ''}
            ${effectText ? `
                <div style="font-size: 11px; color: #AED581; margin: 5px 0; line-height: 1.3; text-align: center;">
                    ${effectText}
                </div>
            ` : ''}
            ${card.tags && card.tags.length > 0 ? `
                <div style="font-size: 10px; color: #FFD700; margin: 5px 0; text-align: center; font-style: italic;">
                    ${card.tags.join(', ')}
                </div>
            ` : ''}
            <div class="card-rarity" style="margin-top: auto;">${card.rarity}</div>
        `;
        
        cardDiv.onclick = () => this.onCardClick(index);
        
        this.handElement.appendChild(cardDiv);
    });
}
    
    // ========================================
    // CONTROLS (boutons)
    // ========================================
    
    renderControls() {
        const endTurnBtn = document.getElementById('endTurnBtn');
    }
    
    // ========================================
    // LOG (historique)
    // ========================================
    
    renderLog() {
        this.logElement.innerHTML = '';
        
        // Afficher les 10 derniers messages
        const recentLogs = this.gm.logs.slice(-10);
        
        recentLogs.forEach(log => {
            const logDiv = document.createElement('div');
            logDiv.className = 'log-entry';
            logDiv.textContent = log;
            this.logElement.appendChild(logDiv);
        });
        
        // Auto-scroll en bas
        this.logElement.scrollTop = this.logElement.scrollHeight;
    }
    
    // ========================================
    // HANDLERS (stubs pour Jour 2)
    // ========================================
    
    onCardClick(index) {
        const card = this.gm.hand[index];
        
        // Si même carte cliquée → désélectionner
        if (this.selectedCardIndex === index) {
            this.selectedCardIndex = null;
            this.clearHighlights();
            this.renderHand();
            return;
        }
        
        // Sélectionner nouvelle carte
        this.selectedCardIndex = index;
        this.highlightCompatibleSlots(card);
        this.renderHand();
        
        this.gm.log(`🎴 ${card.name} sélectionnée - Cliquez sur un slot compatible`);
        this.renderLog();
    }

    highlightCompatibleSlots(card) {
        // Nettoyer anciens highlights
        this.clearHighlights();
        
        // Trouver slots compatibles
        const allSlots = this.gm.board.getAllSlots();
        
        allSlots.forEach(slot => {
            if (slot.canAccept(card)) {
                const slotElement = document.getElementById(slot.id);
                if (slotElement) {
                    slotElement.classList.add('highlighted');
                    slotElement.style.border = '4px solid #00FF00';
                    slotElement.style.boxShadow = '0 0 20px #00FF00';
                    
                    // Ajouter handler click
                    slotElement.onclick = () => this.onSlotClick(slot.id);
                    
                    this.highlightedSlots.push(slot.id);
                }
            }
        });
    }

    clearHighlights() {
        this.highlightedSlots.forEach(slotId => {
            const slotElement = document.getElementById(slotId);
            if (slotElement) {
                slotElement.classList.remove('highlighted');
                slotElement.style.border = '';
                slotElement.style.boxShadow = '';
                slotElement.onclick = null;
            }
        });
        
        this.highlightedSlots = [];
    }

    onSlotClick(slotId) {
        if (this.selectedCardIndex === null) return;
        
        const card = this.gm.hand[this.selectedCardIndex];
        const slot = this.gm.board.getSlot(slotId);
        
        // Tenter placement
        const result = this.gm.placeCardOnSlot(this.selectedCardIndex, slotId);
        
        if (result.success) {
            // Flash vert
            const slotElement = document.getElementById(slotId);
            slotElement.style.background = 'rgba(0, 255, 0, 0.5)';
            setTimeout(() => {
                slotElement.style.background = '';
                // Re-render APRÈS le flash pour voir les bonus voisins
                this.render();
            }, 300);
            
            // Nettoyer sélection
            this.selectedCardIndex = null;
            this.clearHighlights();
            
            // Re-render immédiat aussi
            this.render();
        }
    }

    removeCardFromSlot(slotId) {
        const slot = this.gm.board.getSlot(slotId);
        if (!slot || !slot.card) return;
        
        // 🔒 BLOQUER tout retrait (design TCG)
        this.gm.log(`🔒 Impossible de retirer une carte une fois jouée`);
        return;
        
 /*        // Vérifier si la carte a un effet "instant" (AVANT de la retirer)
        const card = slot.card;
        if (card.effect) {
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            const hasInstantEffect = effects.some(e => 
                e.type === 'instant_draw' || 
                e.type === 'instant_all_slots_bonus'
            );
            
            if (hasInstantEffect) {
                this.gm.log(`❌ ${card.name} ne peut pas être retirée (effet instantané)`);
                return;  // 🛑 Bloquer le retrait
            }
        }
        
        // Retirer la carte
        slot.removeCard();

        // Gérer retrait des bonus
        if (card.effect) {
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            
            // Bonus neighbors
            const hasNeighborEffect = effects.some(e => e.type === 'bonus_neighbors' || e.type === 'penalty_neighbors');
            if (hasNeighborEffect) {
                const neighbors = this.gm.board.getNeighbors(slotId);
                neighbors.forEach(n => {
                    n.neighborBonus = 0;
                    n.rewardBonus = 0;
                });
            }
            
            // All slots bonus
            const allSlotsEffect = effects.find(e => e.type === 'instant_all_slots_bonus');
            if (allSlotsEffect) {
                this.gm.board.getAllSlots().forEach(s => {
                    if (s.type !== 'enemy' && s.type !== 'player' && s.id !== slotId) {
                        s.neighborBonus -= allSlotsEffect.value;
                    }
                });
            }
        }

        slot.neighborBonus = 0;  
        slot.rewardBonus = 0;   
        
        // Gérer les charmes
        if (slot.equipments.length > 0) {
            slot.equipments.forEach(charm => {
                if (this.gm.hand.length < 12) {
                    this.gm.hand.push(charm);
                } else {
                    this.gm.discard.push(charm);
                }
            });
            this.gm.log(`⚙️ ${slot.equipments.length} charme(s) aussi retiré(s)`);
            slot.equipments = [];
        }

        // Remettre en main si possible
        if (this.gm.hand.length < 12) {
            this.gm.hand.push(card);
            this.gm.log(`↩️ ${card.name} retirée et retournée en main`);
        } else {
            this.gm.discard.push(card);
            this.gm.log(`↩️ ${card.name} retirée (main pleine, défaussée)`);
        }

        

        this.gm.recalculateMaxxers();
        
        this.render(); */
    }

    showCardTooltip(card, mouseX, mouseY, slotId = null) {
        const tooltip = document.getElementById('cardTooltip');
        if (!tooltip) return;
        
        // Construire contenu
        let effectText = '';
        if (card.effect) {
            const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
            effectText = effects.map(eff => {
                switch(eff.type) {
                    case 'maxxer_dmg': return `Maxxer DMG +${eff.value}`;
                    case 'maxxer_block': return `Maxxer BLOCK +${eff.value}`;
                    case 'maxxer_all': return `Tous maxxers +${eff.value}`;
                    case 'maxxer_any': return `Maxxer slot +${eff.value}`;
                    case 'bonus_neighbors': return `Voisins +${eff.value}`;
                    case 'penalty_neighbors': return `Voisins ${eff.value}`;
                    case 'instant_draw': return `📥 Pioche ${eff.value} (immédiat)`;
                    case 'instant_all_slots_bonus': return `All slots +${eff.value}`;
                    case 'heal': return `Heal ${eff.value}`;
                    case 'draw': return `Pioche ${eff.value}`;
                    // Effets atouts
                    case 'atout_draw_eot': return `Pioche ${eff.value} fin de tour (max ${eff.max_hand} main)`;
                    case 'atout_token_on_discard': return `Crée jeton ${eff.tag} quand ${eff.tag} défaussé`;
                    case 'atout_maxxer_start': return `Maxxers débutent à ${eff.start}, ne peuvent pas augmenter`;
                    case 'atout_damage_eot': return `Dégâts +${eff.value} fin de tour`;
                    case 'atout_block_eot': return `Blocage +${eff.value} fin de tour`;
                    case 'atout_heal_on_charm_played' : return `Heal ${eff.value} quand un charme est joué`;
                    // Distribution aléatoire
                    case 'instant_missiles':
                        return `${eff.count} missiles ×${eff.value} sur ${eff.targetTypes.join('/')}`;
                    case 'instant_distribute':
                        const occupiedText = eff.onlyOccupied ? ' (slots occupés)' : '';
                        return `Distribue ${eff.value} sur ${eff.targetTypes.join('/')}${occupiedText}`;
                    // Aura tribal
                    case 'aura_tribal':
                        if (eff.includesSelf) {
                            return `Toutes ${eff.tag}s +${eff.value}`;
                        } else {
                            return `Autres ${eff.tag}s +${eff.value}`;
                        }
                    default: return eff.type;

                    // Count tribal (self-scaling)
                    case 'count_tribal':
                        if (eff.includesSelf) {
                            return `+${eff.value} par ${eff.tag} (inclus soi-même)`;
                        } else {
                            return `+${eff.value} par autre ${eff.tag}`;
                        }

                    // 🆕 Discover / Transform
                    case 'instant_discover':
                        if (eff.filter && eff.filter.tag) {
                            return `Discover ${eff.filter.tag}`;
                        }
                        return `Discover ${eff.pool}`;
                    case 'instant_transform_neighbor':
                        if (eff.filter && eff.filter.tag) {
                            return `Transform voisin en ${eff.filter.tag}`;
                        }
                        return `Transform voisin`;

                    case 'instant_transform_random_to_mythic':
                        return `Transform créature aléatoire en Mythique`;

                    case 'instant_devour_neighbors':
                        return `Dévore voisins (×${eff.multiplier} value)`;

                    // Création jetons
                    case 'instant_create_token':
                        return `Crée jeton en main`;
                    case 'instant_create_token_on_neighbors':
                        return `Crée jetons sur voisins vides`;
                    case 'on_discard_create_token':
                        return `Crée jeton à la défausse`;
                    case 'on_discard_create_token_same_slot':
                        return `Crée jeton sur même slot (défausse)`;
                    case 'on_discard_create_creature_same_slot':
                        if (eff.filter && eff.filter.tag) {
                            return `Crée ${eff.filter.tag} aléatoire sur même slot (défausse)`;
                        } else if (eff.filter && eff.filter.rarity) {
                            return `Crée créature ${eff.filter.rarity} aléatoire sur même slot (défausse)`;
                        }
                        return `Crée créature aléatoire sur même slot (défausse)`;
                    case 'on_discard_draw':
                        return `Draw ${eff.value} à la défausse`;
                    case 'bonus_per_discard':
                        return `+${eff.value} par ${eff.tag} défaussé au tour précédent`;
                }
            }).join('<br>');
        }
        
        // Slots compatibles (pour cartes joueur)
        let slotsText = '';
        if (card.slotTypes) {
            const slotNames = {
                damage: 'DMG',
                block: 'BLOCK',
                shared: 'SHARED',
                player: 'PLAYER',
                enemy: 'ENEMY',
                state: 'STATE'
            };
            
            if (card.slotTypes.length === 1) {
                slotsText = `<div style="color: #FF6347; font-size: 12px; margin: 5px 0;">${slotNames[card.slotTypes[0]]} only</div>`;
            }
        }
        
        // Cartes ennemies (avec effets boost + onDeath + timer)
        let enemyEffectText = '';
        if (card.currentHp !== undefined) {
            let effectsList = [];
            
            // Effets passifs
            if (card.effect) {
                const effects = Array.isArray(card.effect) ? card.effect : [card.effect];
                effects.forEach(eff => {
                    if (eff.type === 'boost_damage') effectsList.push(`+${eff.value} 🔥 Dégâts ennemi`);
                    if (eff.type === 'boost_block') effectsList.push(`+${eff.value} 🛡️ Blocage ennemi`);
                });
            }
            
            // OnDeath
            if (card.onDeath) {
                switch(card.onDeath.type) {
                    case 'draw':
                        effectsList.push(`💀 OnDeath: Draw ${card.onDeath.value}`);
                        break;
                    case 'add_rare_card':
                        effectsList.push(`💀 OnDeath: Rare card en main`);
                        break;
                    case 'heal':
                        effectsList.push(`💀 OnDeath: Heal ${card.onDeath.value}`);
                        break;
                }
            }
            
            // Timer
            if (card.timer && card.turnPlaced !== null) {
                const turnsElapsed = this.gm.turnNumber - card.turnPlaced;
                const turnsRemaining = card.timer.turns - turnsElapsed;
                
                if (turnsRemaining > 0) {
                    const effect = card.timer.effect;
                    let effectDesc = '';
                    if (effect.type === 'damage_player') effectDesc = `${effect.value} DMG au joueur`;
                    if (effect.type === 'heal_enemy') effectDesc = `Heal ${effect.value} au boss`;
                    
                    effectsList.push(`⏰ Dans ${turnsRemaining} tour(s): ${effectDesc}`);
                }
            }
            
            enemyEffectText = effectsList.join('<br>');
        }

        // Ajouter section charmes si carte sur board avec équipements
        let equipmentSection = '';
        if (slotId) {
            const slot = this.gm.board.getSlot(slotId);
            if (slot && slot.equipments.length > 0) {
                equipmentSection = `
                    <hr style="border-color: #FFD700; margin: 10px 0;">
                    <div style="font-size: 12px; color: #FFD700; font-weight: bold; margin-bottom: 5px;">
                        ⚙️ Charmes (${slot.equipments.length})
                    </div>
                `;
                
                slot.equipments.forEach(eq => {
                    equipmentSection += `
                        <div style="font-size: 11px; color: #AED581; margin: 3px 0; line-height: 1.4;">
                            • ${eq.name}: ${eq.description}
                        </div>
                    `;
                });
            }
        }
        
        tooltip.innerHTML = `
            <div style="font-size: 16px; font-weight: bold; color: #FFD700; margin-bottom: 8px;">
                ${card.name}
            </div>
            ${card.currentHp !== undefined ? `
                <div style="font-size: 14px; color: #FF6347; margin: 5px 0;">
                    HP: ${card.currentHp}/${card.maxHp}
                </div>
            ` : `
                <div style="font-size: 20px; color: #AED581; margin: 5px 0;">
                    Value: ${card.value || 0}
                </div>
            `}
            ${slotsText}
            ${effectText ? `
                <div style="font-size: 12px; color: #AED581; margin: 8px 0; line-height: 1.4;">
                    ${effectText}
                </div>
            ` : ''}
            ${enemyEffectText ? `
                <div style="font-size: 12px; color: #FFD700; margin: 8px 0; line-height: 1.4;">
                    ${enemyEffectText}
                </div>
            ` : ''}
            ${equipmentSection}
            ${card.rarity ? `
                <div style="font-size: 11px; color: #888; margin-top: 8px;">
                    ${card.rarity}
                </div>
            ` : ''}
        `;
        
        // Positionner près de la souris
        tooltip.style.left = `${mouseX + 15}px`;
        tooltip.style.top = `${mouseY + 15}px`;
        tooltip.style.display = 'block';
    }

    hideCardTooltip() {
        const tooltip = document.getElementById('cardTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

}
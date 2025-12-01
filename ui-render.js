// ========================================
// UI-RENDER.JS - Rendering du board, entities, info
// ========================================

import { CardType } from './constants.js';

export class UIRenderer {
    constructor(uiManager) {
        this.ui = uiManager;
        this.gm = uiManager.gm;
        this.boardElement = uiManager.boardElement;
        this.handElement = uiManager.handElement;
        this.logElement = uiManager.logElement;
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

            // Slots player: gérer déverrouillage
            if (slot.type === 'player') {
                const slotIndex = parseInt(slot.id.split('_')[1]);
                
                if (slotIndex > this.gm.unlockedPlayerSlots) {
                    slotDiv.classList.add('locked');
                    slotDiv.style.opacity = '0.3';
                    slotDiv.style.cursor = 'not-allowed';
                    slotDiv.innerHTML = `<div style="font-size: 12px; color: #999;">Tour ${slotIndex * 3}</div>`;
                    this.boardElement.appendChild(slotDiv);
                    return;
                }
                
                if (!slot.card) {
                    slotDiv.classList.add('unlocked-empty');
                    slotDiv.style.border = '3px solid gold';
                    slotDiv.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    slotDiv.style.cursor = 'pointer';
                    slotDiv.style.display = 'flex';
                    slotDiv.style.alignItems = 'center';
                    slotDiv.style.justifyContent = 'center';
                    slotDiv.innerHTML = `
                        <div style="
                            font-size: 11px;
                            color: gold;
                            text-align: center;
                            animation: pulse 2s infinite;
                            line-height: 1.3;
                            padding: 2px;
                        ">
                            choisir<br> atout
                        </div>
                    `;
                }
            }
            
            // Carte posée
            if (slot.card) {
                slotDiv.classList.add('occupied');
                
                // Si slot enemy, afficher HP + effets
                if (slot.type === 'enemy' && slot.card.currentHp !== undefined) {
                    let effectText = '';
                    if (slot.card.effect) {
                        const effects = Array.isArray(slot.card.effect) ? slot.card.effect : [slot.card.effect];
                        effectText = effects.map(eff => {
                            if (eff.type === 'boost_damage') return `+${eff.value} 🔥`;
                            if (eff.type === 'boost_block') return `+${eff.value} 🛡️`;
                            return '';
                        }).filter(t => t).join(' ');
                    }
                    
                    let onDeathText = '';
                    if (slot.card.onDeath) {
                        switch(slot.card.onDeath.type) {
                            case 'draw': onDeathText = `💀 Draw ${slot.card.onDeath.value}`; break;
                            case 'add_rare_card': onDeathText = `💀 Rare`; break;
                            case 'heal': onDeathText = `💀 Heal ${slot.card.onDeath.value}`; break;
                        }
                    }
                    
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
                            ${effectText ? `<div style="font-size: 12px; color: #FFD700;">${effectText}</div>` : ''}
                            ${onDeathText ? `<div style="font-size: 11px; color: #9370DB;">${onDeathText}</div>` : ''}
                            ${timerText ? `<div style="font-size: 11px; color: #FF4500; font-weight: bold;">${timerText}</div>` : ''}
                        </div>
                    `;
                } else {
                    // Carte normale (non-enemy)
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
                        if (this.ui.selectedCardIndex !== null) {
                            return;
                        }
                        
                        // Sinon → retirer carte
                        e.stopPropagation();
                        this.ui.interactions.removeCardFromSlot(slot.id);
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

            // ✅ TOOLTIP sur slots avec cartes
            if (slot.card) {
                slotDiv.onmouseenter = (e) => {
                    this.ui.popups.showCardTooltip(slot.card, e.clientX, e.clientY, slot.id);
                };
                
                slotDiv.onmouseleave = () => {
                    this.ui.popups.hideCardTooltip();
                };
                
                slotDiv.onmousemove = (e) => {
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

    // ========================================
    // ENTITIES (BLOCK, DAMAGE, STATE)
    // ========================================
    
    renderEntities() {
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
            
            // Jauge Fortress pour BLOCK
            if (entity.type === 'block') {
                const fs = this.gm.fortressSystem;
                const percent = fs.getMeterPercent();
                const hasReward = fs.hasAvailableReward();
                
                html += `
                    <div style="margin-top: 10px; width: 100%;">
                        <div style="font-size: 12px; color: #4A90E2; margin-bottom: 3px;">
                            Shield: ${fs.shield}
                        </div>
                        <div class="fortress-meter ${hasReward ? 'has-reward' : ''}" 
                            data-fortress-meter="true"
                            style="cursor: ${hasReward ? 'pointer' : 'default'}">
                            <div class="fortress-meter-fill" style="width: ${percent}%"></div>
                        </div>
                        ${hasReward ? '<div class="reward-available">⚡ Dispo</div>' : ''}
                    </div>
                `;
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
            }
            
            entityDiv.innerHTML = html;
            this.boardElement.appendChild(entityDiv);
            
            // Event listener pour la jauge fortress
            if (entity.type === 'block') {
                const fs = this.gm.fortressSystem;
                if (fs.hasAvailableReward()) {
                    const meterEl = entityDiv.querySelector('[data-fortress-meter]');
                    if (meterEl) {
                        meterEl.onclick = () => this.ui.popups.showFortressRewardPopup();
                    }
                }
            }
        });
    }

    // ========================================
    // PLAYER INFO
    // ========================================
    
    renderPlayerInfo() {
        const playerDiv = document.getElementById('playerInfo');
        if (!playerDiv) return;
        
        const hp = this.gm.player;
        
        // Compter tokens Ombre sur le board
        const shadowTokenCount = this.gm.fusionSystem.countShadowTokensOnBoard();
        const availableTiers = this.gm.fusionSystem.getAvailableFusionTiers();
        const hasFusionAvailable = availableTiers.length > 0;
        
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
            
            <!-- ⬇️ NOUVEAU : Affichage Fusion Ombres -->
            <div style="font-size: 13px; color: #9370DB; margin-top: 8px; font-weight: bold;">
                🌑 Tokens Ombre: ${shadowTokenCount} | Niveau: ${this.gm.fusionSystem.fusionLevel}
            </div>
            ${hasFusionAvailable ? `
                <button id="fusion-button" style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #9370DB, #4B0082);
                    border: 2px solid #9370DB;
                    border-radius: 8px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 13px;
                    animation: fusionPulse 2s infinite;
                ">
                    🌑 Fusion Disponible !
                </button>
            ` : ''}
        `;
        
        // Event listener boutique
        const shopButton = document.getElementById('shop-button');
        if (shopButton) {
            shopButton.onclick = () => this.ui.popups.showShopPopup();
        }
        
        // ⬇️ NOUVEAU : Event listener fusion
        const fusionButton = document.getElementById('fusion-button');
        if (fusionButton) {
            fusionButton.onclick = () => this.ui.popups.showFusionPopup();
        }
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
            <div style="font-size: 14px; color: #aaa; margin-top: 5px;">
                ⚔️ Attaque : 5-50 dmg
            </div>
            <div style="font-size: 14px; color: #aaa;">
                🛡️ Block : 0-25
            </div>
            <div style="font-size: 13px; color: #aaa; margin-top: 5px;">
                🃏 Pose carte ? Huhu
            </div>
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
                cardDiv.style.borderColor = '#9370DB';
                cardDiv.style.background = 'linear-gradient(135deg, #4B0082 0%, #8A2BE2 100%)';
            }

            // Style spécial pour atouts
            if (card.cardType === CardType.ATOUT) {
                cardDiv.style.borderColor = '#32CD32';
                cardDiv.style.background = 'linear-gradient(135deg, #006400 0%, #228B22 100%)';
            }
            
            if (card.isArtifact) {
                cardDiv.classList.add('artifact');
            }
            
            // Highlight si sélectionnée
            if (index === this.ui.selectedCardIndex) {
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
                        case 'instant_draw': return `Pioche ${eff.value} (immédiat)`;
                        case 'instant_all_slots_bonus': return `All slots +${eff.value}`;  
                        case 'instant_destroy_enemy': return `Détruit enemy ciblé`;
                        case 'instant_protect_ally': return `Protège la créature ciblée ce tour ci`;

                        // Effets auras tribales
                        case 'aura_tribal':
                            if (eff.includesSelf) {
                                return `Toutes ${eff.tag}s +${eff.value}`;
                            } else {
                                return `Autres ${eff.tag}s +${eff.value}`;
                            }

                        case 'gain_goods': return `+${eff.value} marchandises`;

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
                        
                        // Discover / Transform
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
                <div class="card-value">${card.value !== undefined ? this.gm.getCardDisplayValue(card) : '?'}</div>
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
            
            cardDiv.onclick = () => this.ui.interactions.onCardClick(index);
            
            this.handElement.appendChild(cardDiv);
        });
    }

    // ========================================
    // CONTROLS & LOG
    // ========================================
    
    renderControls() {
        const endTurnBtn = document.getElementById('endTurnBtn');
    }
    
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
}
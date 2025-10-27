// ========================================
// UI.JS - Gestion du rendu visuel
// ========================================

import { BoardLinesRenderer } from './boardLines.js';

export class UIManager {
    constructor(gameManager) {
        this.gm = gameManager;
        this.boardElement = document.getElementById('board');
        this.handElement = document.getElementById('handContainer');
        this.logElement = document.getElementById('logContainer');

        this.selectedCardIndex = null;
        this.highlightedSlots = [];

        // 🆕 Désélectionner au click ailleurs
        this.setupDeselectListener();

        this.linesRenderer = new BoardLinesRenderer(gameManager);
    }

    //déselection si clique ailleurs que sur une carte
    setupDeselectListener() {
        document.getElementById('gameContainer').addEventListener('click', (e) => {
            // 🆕 Ne rien faire si click sur carte, slot, OU enemyInfo
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
                
                // Si slot enemy, afficher HP
                if (slot.type === 'enemy' && slot.card.currentHp !== undefined) {
                    slotDiv.innerHTML = `
                        <div style="font-size: 12px; font-weight: bold;">${slot.card.name}</div>
                        <div style="font-size: 16px; color: #FF6347;">${slot.card.currentHp}/${slot.card.maxHp}</div>
                    `;
                } else {
                    const displayValue = (slot.card.value || 0) + slot.bonus;
                    const bonusText = slot.bonus !== 0 ? ` (${slot.card.value}${slot.bonus > 0 ? '+' : ''}${slot.bonus})` : '';
                    slotDiv.innerHTML = `
                        <span style="font-size: 20px; font-weight: bold;">${displayValue}</span>
                        ${bonusText ? `<div style="font-size: 10px; color: #AED581;">${bonusText}</div>` : ''}
                    `;
                }
                
                // 🆕 Click pour retirer (sauf enemy/player)
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

            // 🆕 Slot vide avec bonus en attente
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
            
            this.boardElement.appendChild(slotDiv);
        });
    }
    
    setupTargeting() {
        // 🆕 Utiliser délégation pour ennemi principal
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

        // 🆕 Click sur autres slots (retrait si pas de carte sélectionnée)
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
            
            // 🆕 Tier et progression pour STATE
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
                
                if (nextThreshold) {
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
                }
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
        `;
    }
    
    // ========================================
    // ENEMY INFO
    // ========================================
    
    renderEnemyInfo() {
        const enemyDiv = document.getElementById('enemyInfo');
        if (!enemyDiv) return;
        
        const enemy = this.gm.enemy;
        enemyDiv.innerHTML = `
            <div style="font-size: 14px; color: #FF6347;">ENEMY</div>
            <div class="hp-bar">💀 ${enemy.currentHp}/${enemy.maxHp}</div>
            <div style="font-size: 12px; color: #aaa;">Attaque: ${enemy.attackDamage} dmg/tour</div>
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
        
        if (card.isArtifact) {
            cardDiv.classList.add('artifact');
        }
        
        // Highlight si sélectionnée
        if (index === this.selectedCardIndex) {
            cardDiv.style.border = '4px solid #00FF00';
            cardDiv.style.transform = 'translateY(-10px)';
            cardDiv.style.boxShadow = '0 10px 30px rgba(0, 255, 0, 0.8)';
        }
        
        // 🆕 Afficher "X only" si spécialisée
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
                // 🆕 Re-render APRÈS le flash pour voir les bonus voisins
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
        
        const card = slot.removeCard();
        slot.bonus = 0;
        
        // Remettre en main si possible
        if (this.gm.hand.length < 12) {
            this.gm.hand.push(card);
            this.gm.log(`↩️ ${card.name} retirée et retournée en main`);
        } else {
            this.gm.discard.push(card);
            this.gm.log(`↩️ ${card.name} retirée (main pleine, défaussée)`);
        }

        this.gm.recalculateMaxxers();
        
        this.render();
    }

}
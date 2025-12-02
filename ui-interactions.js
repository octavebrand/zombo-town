// ========================================
// UI-INTERACTIONS.JS - Gestion des interactions utilisateur
// ========================================

export class UIInteractions {
    constructor(uiManager) {
        this.ui = uiManager;
        this.gm = uiManager.gm;
    }

    // ========================================
    // CARD SELECTION
    // ========================================

    onCardClick(index) {
        const card = this.gm.hand[index];
        
        // Si même carte cliquée → désélectionner
        if (this.ui.selectedCardIndex === index) {
            this.ui.selectedCardIndex = null;
            this.clearHighlights();
            this.ui.renderer.renderHand();
            return;
        }
        
        // Sélectionner nouvelle carte
        this.ui.selectedCardIndex = index;
        this.highlightCompatibleSlots(card);
        this.ui.renderer.renderHand();
        
        this.gm.log(`🎴 ${card.name} sélectionnée - Cliquez sur un slot compatible`);
        this.ui.renderer.renderLog();
    }

    onSlotClick(slotId) {
        if (this.ui.selectedCardIndex === null) return;
        
        const result = this.gm.placeCardOnSlot(this.ui.selectedCardIndex, slotId);
        
        if (result.success) {
            // Flash vert
            const slotElement = document.getElementById(slotId);
            slotElement.style.background = 'rgba(0, 255, 0, 0.5)';
            setTimeout(() => {
                slotElement.style.background = '';
                this.ui.render();
            }, 300);
            
            // Nettoyer sélection
            this.ui.selectedCardIndex = null;
            this.clearHighlights();
            this.ui.render();
        }
    }

    // ========================================
    // HIGHLIGHTS
    // ========================================

    highlightCompatibleSlots(card) {
        this.clearHighlights();
        
        const allSlots = this.gm.board.getAllSlots();
        
        allSlots.forEach(slot => {
            if (slot.canAccept(card)) {
                const slotElement = document.getElementById(slot.id);
                if (slotElement) {
                    slotElement.classList.add('highlighted');
                    slotElement.style.border = '4px solid #00FF00';
                    slotElement.style.boxShadow = '0 0 20px #00FF00';
                    
                    slotElement.onclick = () => this.onSlotClick(slot.id);
                    
                    this.ui.highlightedSlots.push(slot.id);
                }
            }
        });
    }

    clearHighlights() {
        this.ui.highlightedSlots.forEach(slotId => {
            const slotElement = document.getElementById(slotId);
            if (slotElement) {
                slotElement.classList.remove('highlighted');
                slotElement.style.border = '';
                slotElement.style.boxShadow = '';
                slotElement.onclick = null;
            }
        });
        
        this.ui.highlightedSlots = [];
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
    // TARGETING SYSTEM
    // ========================================

    setupTargeting() {
        // Ciblage ennemi principal
        const enemyInfo = document.getElementById('enemyInfo');
        if (enemyInfo) {
            enemyInfo.style.cursor = 'pointer';
            enemyInfo.style.border = '3px solid #8B0000';
            
            enemyInfo.onclick = null;
            enemyInfo.onclick = (e) => {
                e.stopPropagation();
                this.gm.setTarget('enemy');
                this.highlightTarget();
                this.ui.renderer.renderLog();
            };
        }
        
        // Click sur slots enemy
        this.gm.board.slots.enemy.forEach(slot => {
            const slotElement = document.getElementById(slot.id);
            if (slotElement && slot.card) {
                slotElement.style.cursor = 'pointer';
                
                slotElement.onclick = null;
                slotElement.onclick = (e) => {
                    e.stopPropagation();
                    
                    // FORTRESS : Détruire enemy
                    if (this.gm.selectionMode === 'destroy_enemy_fortress') {
                        this.gm.fortressSystem.claimReward('lv5', slot.id);
                        this.gm.selectionMode = null;
                        this.clearHighlights();
                        
                        const tooltip = document.getElementById('tooltip');
                        if (tooltip) tooltip.style.display = 'none';
                        
                        this.ui.render();
                        return;
                    }

                    // destroy enemy pour cartes
                    if (this.gm.selectionMode === 'destroy_enemy') {
                        if (slot?.card) {
                            const cardName = slot.card.name;
                            slot.removeCard();
                            this.gm.log(`💀 ${cardName} détruit !`);
                        }
                        
                        this.gm.selectionMode = null;
                        this.clearHighlights();
                        
                        const tooltip = document.getElementById('tooltip');
                        if (tooltip) tooltip.style.display = 'none';
                        
                        this.ui.render();
                        return;
                    }
                    
                    // Action normale : ciblage
                    this.gm.setTarget(slot.id);
                    this.highlightTarget();
                    this.ui.renderer.renderLog();
                };
                
                // Highlight si mode destroy_enemy actif
                if (this.gm.selectionMode === 'destroy_enemy' || this.gm.selectionMode === 'destroy_enemy_fortress') {
                    slotElement.classList.add('highlighted');
                    slotElement.style.border = '4px solid #00FF00';
                    slotElement.style.boxShadow = '0 0 20px #00FF00';
                }
            }
        });

        // Gestion slots PLAYER (atouts)
        this.gm.board.slots.player.forEach(slot => {
            const slotElement = document.getElementById(slot.id);
            if (!slotElement) return;
            
            const slotIndex = parseInt(slot.id.split('_')[1]);
            
            if (slotIndex <= this.gm.unlockedPlayerSlots && !slot.card) {
                slotElement.style.cursor = 'pointer';
                slotElement.onclick = (e) => {
                    e.stopPropagation();
                    this.ui.popups.showAtoutSelectionPopup(slot.id);
                };
            }
        });

        // Click sur autres slots
        ['block', 'damage', 'state', 'shared'].forEach(type => {
            this.gm.board.slots[type].forEach(slot => {
                const slotElement = document.getElementById(slot.id);
                if (slotElement && slot.card) {
                    slotElement.style.cursor = 'pointer';
                    
                    const existingOnClick = slotElement.onclick;
                    slotElement.onclick = (e) => {
                        e.stopPropagation();
                        
                        // FORTRESS : Protéger carte
                        if (this.gm.selectionMode === 'protect_card_fortress') {
                            this.gm.fortressSystem.claimReward('lv4', slot.id);
                            this.gm.selectionMode = null;
                            this.clearHighlights();
                            this.gm.log(`🛡️ ${slot.card.name} protégée ce tour`);
                            this.ui.render();
                            return;
                        }

                        // protect card pour cartes
                        if (this.gm.selectionMode === 'protect_card') {
                            // Vérifier que l'array existe (sécurité)
                            if (!this.gm.fortressSystem.protectedCardSlotIds) {
                                this.gm.fortressSystem.protectedCardSlotIds = [];
                            }
                            
                            this.gm.fortressSystem.protectedCardSlotIds.push(slot.id);
                            this.gm.selectionMode = null;
                            this.clearHighlights();
                            this.gm.log(`🛡️ ${slot.card.name} protégée ce tour`);
                            this.ui.render();
                            return;
                        }

                        // MIROIR : Copier carte
                        if (this.gm.selectionMode === 'mirror_copy') {
                            this.gm.mirrorSystem.copyCard(slot.id);
                            this.gm.selectionMode = null;
                            this.clearHighlights();
                            this.ui.render();
                            return;
                        }
                        
                        // Si carte sélectionnée en main → placer carte
                        if (this.ui.selectedCardIndex !== null && this.ui.highlightedSlots.includes(slot.id)) {
                            if (existingOnClick) existingOnClick(e);
                            return;
                        }
                        
                        // Sinon → retirer carte (bloqué)
                        this.removeCardFromSlot(slot.id);
                    };
                    
                    // Highlight si mode protect_card OU mirror_copy actif
                    if (this.gm.selectionMode === 'protect_card' || 
                        this.gm.selectionMode === 'protect_card_fortress' ||
                        this.gm.selectionMode === 'mirror_copy') {
                        slotElement.classList.add('highlighted');
                        slotElement.style.border = '4px solid #00FF00';
                        slotElement.style.boxShadow = '0 0 20px #00FF00';
                    }
                } else if (slotElement && !slot.card) {
                    // ← NOUVEAU : Gestion slots VIDES
                    
                    if (this.gm.selectionMode === 'mirror_invoke') {
                        slotElement.style.cursor = 'pointer';
                        slotElement.classList.add('highlighted');
                        slotElement.style.border = '4px solid #00D9FF';
                        slotElement.style.boxShadow = '0 0 20px #00D9FF';
                        
                        slotElement.onclick = (e) => {
                            e.stopPropagation();
                            this.gm.mirrorSystem.invokeReflection(slot.id);
                            this.gm.selectionMode = null;
                            this.clearHighlights();
                            this.ui.render();
                        };
                    }
                }
            });
        });
    }

    // ========================================
    // SELECTION MODES (FORTRESS & CARDS)
    // ========================================

    selectCardToProtect() {
        this.gm.log('🛡️ Cliquer sur une carte à protéger');
        this.gm.selectionMode = 'protect_card';
        this.setupTargeting();
    }

    selectEnemyToDestroy() {
        this.gm.log('💀 Cliquer sur un enemy à détruire');
        this.gm.selectionMode = 'destroy_enemy';
        this.setupTargeting();
    }

    selectCardToProtectFortress() {
        this.gm.log('🛡️ Cliquer sur une carte à protéger');
        this.gm.selectionMode = 'protect_card_fortress';
        this.setupTargeting();
    }

    selectEnemyToDestroyFortress() {
        this.gm.log('💀 Cliquer sur un enemy à détruire');
        this.gm.selectionMode = 'destroy_enemy_fortress';
        this.setupTargeting();
    }

    // ========================================
    // MIRROR SYSTEM SELECTION
    // ========================================

    selectCardToCopyMirror() {
        this.gm.log('🪞 Cliquez sur une carte du board à copier');
        this.gm.selectionMode = 'mirror_copy';
        this.setupTargeting();
    }

    selectSlotToInvokeMirror() {
        this.gm.log('✨ Cliquez sur un slot vide pour invoquer le reflet');
        this.gm.selectionMode = 'mirror_invoke';
        this.setupTargeting();
    }

    // ========================================
    // CARD REMOVAL (BLOCKED)
    // ========================================

    removeCardFromSlot(slotId) {
        this.gm.log(`🔒 Impossible de retirer une carte une fois jouée`);
    }
}
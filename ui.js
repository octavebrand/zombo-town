// ========================================
// UI.JS - Coordinateur principal (REFACTORÉ)
// ========================================

import { BoardLinesRenderer } from './boardLines.js';
import { UIRenderer } from './ui-render.js';
import { UIPopups } from './ui-popups.js';
import { UIInteractions } from './ui-interactions.js';

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

        // Instancier les 3 modules
        this.renderer = new UIRenderer(this);
        this.popups = new UIPopups(this);
        this.interactions = new UIInteractions(this);
    }

    // Désélection si clique ailleurs que sur une carte
    setupDeselectListener() {
        document.getElementById('gameContainer').addEventListener('click', (e) => {
            if (e.target.closest('.card') || 
                e.target.closest('.slot') || 
                e.target.closest('#enemyInfo') ||
                e.target.closest('#playerInfo')) {
                return;
            }
            
            if (this.selectedCardIndex !== null) {
                this.selectedCardIndex = null;
                this.interactions.clearHighlights();
                this.renderer.renderHand();
            }
        });
    }
    
    // ========================================
    // RENDER COMPLET (orchestre les modules)
    // ========================================
    
    render() {
        this.renderer.renderBoard();
        this.renderer.renderEntities();
        this.renderer.renderPlayerInfo();
        this.renderer.renderEnemyInfo();
        this.renderer.renderHand();
        this.renderer.renderControls();
        this.renderer.renderLog();
        this.interactions.setupTargeting();
        this.interactions.highlightTarget();
        this.linesRenderer.render();
    }
}
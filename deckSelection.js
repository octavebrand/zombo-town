// ========================================
// DECK_SELECTION.JS - Écran de sélection de deck
// ========================================

import { getAllDecks, getDeckById } from './prebuiltDecks.js';

export class DeckSelectionUI {
    constructor() {
        this.selectedDeckId = null;
        this.onDeckSelected = null; // Callback
    }
    
    /**
     * Affiche l'écran de sélection
     */
    show(onDeckSelectedCallback) {
        this.onDeckSelected = onDeckSelectedCallback;
        this.render();
    }
    
    /**
     * Cache l'écran de sélection
     */
    hide() {
        const container = document.getElementById('deck-selection-screen');
        if (container) {
            container.style.display = 'none';
        }
    }
    
    /**
     * Render l'écran de sélection
     */
    render() {
        // Vérifier si le conteneur existe déjà
        let container = document.getElementById('deck-selection-screen');
        
        if (!container) {
            // Créer le conteneur
            container = document.createElement('div');
            container.id = 'deck-selection-screen';
            container.className = 'deck-selection-screen';
            document.body.appendChild(container);
        }
        
        // Afficher le conteneur
        container.style.display = 'flex';
        
        // Générer le HTML
        const decks = getAllDecks();
        
        container.innerHTML = `
            <div class="deck-selection-content">
                <h1 class="deck-selection-title">🎴 ZOMBO TOWN</h1>
                <h2 class="deck-selection-subtitle">Choisissez votre deck</h2>
                
                <div class="deck-cards-container">
                    ${decks.map(deck => this.renderDeckCard(deck)).join('')}
                </div>
                
                <div class="deck-selection-footer">
                    <p>Plus de decks à venir : Création personnalisée et choix d'ennemi</p>
                </div>
            </div>
        `;
        
        // Attacher les event listeners
        this.attachEventListeners();
    }
    
    /**
     * Render une carte de deck
     */
    renderDeckCard(deck) {
        const cardCount = deck.cards === 'all' ? '~56' : this.calculateCardCount(deck.cards);
        
        return `
            <div class="deck-card" data-deck-id="${deck.id}" style="border-color: ${deck.color}">
                <div class="deck-card-header" style="background: linear-gradient(135deg, ${deck.color}, ${this.darkenColor(deck.color, 20)})">
                    <h3 class="deck-card-name">${deck.name}</h3>
                    <span class="deck-card-tribe">${deck.tribe}</span>
                </div>
                
                <div class="deck-card-body">
                    <p class="deck-card-description">${deck.description}</p>
                    <div class="deck-card-count">${cardCount} cartes</div>
                </div>
                
                <div class="deck-card-footer">
                    <button class="deck-select-btn" data-deck-id="${deck.id}">
                        Jouer
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Calcule le nombre total de cartes dans un deck
     */
    calculateCardCount(cards) {
        return cards.reduce((total, entry) => total + entry.count, 0);
    }
    
    /**
     * Assombrit une couleur hexadécimale
     */
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    /**
     * Attache les event listeners
     */
    attachEventListeners() {
        const buttons = document.querySelectorAll('.deck-select-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deckId;
                this.selectDeck(deckId);
            });
        });
        
        // Hover effect sur les cartes
        const cards = document.querySelectorAll('.deck-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
    
    /**
     * Sélectionne un deck et démarre le jeu
     */
    selectDeck(deckId) {
        this.selectedDeckId = deckId;
        
        // Animation de sélection
        const selectedCard = document.querySelector(`.deck-card[data-deck-id="${deckId}"]`);
        if (selectedCard) {
            selectedCard.style.transform = 'scale(1.05)';
            selectedCard.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
        }
        
        // Attendre un peu pour l'animation
        setTimeout(() => {
            this.hide();
            
            // Callback vers main.js
            if (this.onDeckSelected) {
                this.onDeckSelected(deckId);
            }
        }, 300);
    }
}

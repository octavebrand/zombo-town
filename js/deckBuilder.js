import { ALL_CARDS } from './cards.js';
import { Rarity } from './constants.js';

class DeckBuilder {
    constructor(gameManager, enemyId = 0) {
        this.gm = gameManager;
        this.enemyId = enemyId;
        this.deck = [];
        this.rarity_limits = {
            [Rarity.COMMUNE]: 3,
            [Rarity.UNCOMMON]: 3,
            [Rarity.RARE]: 2,
            [Rarity.MYTHIQUE]: 1
        };
    }

    show() {
        document.getElementById('enemySelection').style.display = 'none';
        const screen = document.getElementById('deckBuilderScreen');
        screen.style.display = 'block';  // FORCE le display à block
        screen.classList.add('active');
        this.renderCardsPool();
        // Charger deck sauvegardé si existe
        if (this.loadDeckFromStorage()) {
            console.log("Deck chargé depuis storage:", this.deck.length, "cartes");
            this.renderDeckList();
            this.updateCounters();
        }
        this.renderDeckList();
    }

    renderCardsPool() {
        const pool = document.getElementById('cardsPool');
        pool.innerHTML = '';

        ALL_CARDS.forEach(card => {
            const count = this.deck.filter(c => c.id === card.id).length;
            const maxAllowed = this.rarity_limits[card.rarity];
            const canAdd = count < maxAllowed && this.deck.length < 50;

            const cardEl = document.createElement('div');
            cardEl.className = 'pool-card';
            cardEl.style.opacity = canAdd ? '1' : '0.5';
            cardEl.style.cursor = canAdd ? 'pointer' : 'not-allowed';

            cardEl.innerHTML = `
                <div class="pool-card-name">${card.name}</div>
                <div class="pool-card-rarity">${card.rarity}</div>
                <div class="pool-card-count">${count}/${maxAllowed === Infinity ? '∞' : maxAllowed}</div>
            `;

            if (canAdd) {
                cardEl.onclick = () => this.addCardToDeck(card);
                cardEl.onmouseenter = () => {
                    cardEl.style.transform = 'scale(1.08)';
                    this.showCardPopup(card);
                };
                cardEl.onmouseleave = () => {
                    cardEl.style.transform = 'scale(1.05)';
                    this.hideCardPopup();
                };
            }

            pool.appendChild(cardEl);
        });
    }

    renderDeckList() {
        const list = document.getElementById('deckList');
        list.innerHTML = '';

        this.deck.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'deck-card-item';

            item.innerHTML = `
                <span class="deck-card-name">${card.name}</span>
                <button class="deck-card-remove">×</button>
            `;

            const nameSpan = item.querySelector('.deck-card-name');
            nameSpan.onmouseenter = () => this.showCardPopup(card);
            nameSpan.onmouseleave = () => this.hideCardPopup();

            item.querySelector('.deck-card-remove').onclick = () => this.removeCardFromDeck(index);
            list.appendChild(item);
        });

        this.updateCounters();
    }

    showCardPopup(card) {
        let popup = document.getElementById('cardPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'cardPopup';
            popup.className = 'card-popup';
            document.body.appendChild(popup);
        }
        
        const typeClass = card.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        popup.className = `card-popup card type-${typeClass} visible`;
        popup.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-type">${card.type}</div>
            <div class="card-rarity">${card.rarity}</div>
            <div class="card-description">${card.description}</div>
        `;
    }

    hideCardPopup() {
        const popup = document.getElementById('cardPopup');
        if (popup) {
            popup.classList.remove('visible');
        }
    }

    addCardToDeck(card) {
        const count = this.deck.filter(c => c.id === card.id).length;
        const maxAllowed = this.rarity_limits[card.rarity];

        if (count >= maxAllowed || this.deck.length >= 50) return;

        this.deck.push({...card});
        this.renderCardsPool();
        this.renderDeckList();
    }

    removeCardFromDeck(index) {
        this.deck.splice(index, 1);
        this.renderCardsPool();
        this.renderDeckList();
    }

    updateCounters() {
        document.getElementById('deckCounter').textContent = this.deck.length;
        document.getElementById('communeCounter').textContent = this.deck.filter(c => c.rarity === Rarity.COMMUNE).length + '/∞';
        document.getElementById('uncommonCounter').textContent = this.deck.filter(c => c.rarity === Rarity.UNCOMMON).length + '/∞';
        document.getElementById('rareCounter').textContent = this.deck.filter(c => c.rarity === Rarity.RARE).length + '/∞';
        document.getElementById('mythicCounter').textContent = this.deck.filter(c => c.rarity === Rarity.MYTHIQUE).length + '/∞';
    
        const validateBtn = document.getElementById('validateDeckBtn');
        validateBtn.disabled = this.deck.length !== 50;
        validateBtn.style.opacity = this.deck.length === 50 ? '1' : '0.5';
        validateBtn.style.cursor = this.deck.length === 50 ? 'pointer' : 'not-allowed';
    }
    
    saveDeckToStorage() {
        const deckData = this.deck.map(card => card.id);
        localStorage.setItem('customDeck', JSON.stringify(deckData));
        console.log("Deck sauvegardé:", deckData.length, "cartes");
    }

    loadDeckFromStorage() {
        const saved = localStorage.getItem('customDeck');
        if (saved) {
            try {
                const cardIds = JSON.parse(saved);
                this.deck = cardIds.map(id => {
                    const card = ALL_CARDS.find(c => c.id === id);
                    return card ? {...card} : null;
                }).filter(c => c !== null);
                console.log("Deck chargé depuis storage:", this.deck.length, "cartes");
                return true;
            } catch (e) {
                console.error("Erreur chargement deck:", e);
                return false;
            }
        }
        return false;
    }


    validateAndPlay() {
        if (this.deck.length !== 50) {
            alert('Votre deck doit avoir exactement 50 cartes!');
            return;
        }
        const popup = document.getElementById('cardPopup');
        if (popup) popup.remove();
        // Stocker le deck dans window et appeler startGameWithCustomDeck
        window.customDeckToLoad = this.deck;
        window.startGameWithCustomDeck(this.enemyId);
        this.saveDeckToStorage();
    }

    cancel() {
        document.getElementById('deckBuilderScreen').classList.remove('active');
        document.getElementById('enemySelection').style.display = 'block';
        this.deck = [];
    }
}

export { DeckBuilder };
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

        const guideBtn = document.getElementById('guideBtnDeckSelect');
        if (guideBtn) {
            guideBtn.style.display = 'none';
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

        // ✅ Créer le bouton guide (APRÈS container.innerHTML)
        let guideBtn = document.getElementById('guideBtnDeckSelect');
        if (!guideBtn) {
            guideBtn = document.createElement('button');
            guideBtn.id = 'guideBtnDeckSelect';
            guideBtn.innerHTML = `
                <span class="guide-btn-icon">📖</span>
                <span class="guide-btn-text">Règles du jeu</span>
            `;
            document.body.appendChild(guideBtn); // Au body, pas au container
        }
        
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

        // Event listener pour le bouton Guide
        const guideBtn = document.getElementById('guideBtnDeckSelect');
        if (guideBtn) {
            guideBtn.onclick = () => {
                this.showGuideFromDeckSelection();
            };
        }
            
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
     * Afficher le guide depuis l'écran de sélection
     */
    showGuideFromDeckSelection() {
        console.log('📖 Ouverture du guide depuis deck selection');
        
        const popup = document.getElementById('popup');
        if (!popup) {
            console.error('❌ Popup non trouvé, création...');
            const newPopup = document.createElement('div');
            newPopup.id = 'popup';
            newPopup.style.cssText = `
                display: flex !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.95) !important;
                z-index: 999999 !important;
                justify-content: center !important;
                align-items: center !important;
                overflow-y: auto !important;
                padding: 20px !important;
            `;
            document.body.appendChild(newPopup);
            return this.showGuideFromDeckSelection();
        }
        
        popup.style.cssText = `
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.95) !important;
            z-index: 999999 !important;
            justify-content: center !important;
            align-items: center !important;
            overflow-y: auto !important;
            padding: 20px !important;
        `;
        
        const tabsHTML = `
            <div class="guide-tabs-container" style="
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                justify-content: center;
            ">
                <button class="guide-tab active" data-tab="basics" style="
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                ">Règles de Base</button>
                <button class="guide-tab" data-tab="board" style="
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                ">Board & Slots</button>
                <button class="guide-tab" data-tab="cards" style="
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                ">Types de Cartes</button>
                <button class="guide-tab" data-tab="tribes" style="
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                ">Tribus</button>
                <button class="guide-tab" data-tab="tips" style="
                    padding: 10px 20px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ff00;
                    color: #00ff00;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                ">Conseils</button>
            </div>
        `;
        
        popup.innerHTML = `
            <div style="
                background: rgba(10, 10, 10, 0.98);
                border: 3px solid #00ff00;
                border-radius: 10px;
                padding: 30px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
                color: #00ff00;
                font-family: 'VT323', monospace;
            ">
                <h1 style="
                    text-align: center;
                    font-size: 2.5rem;
                    margin-bottom: 30px;
                    color: #00ff00;
                    text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
                ">📖 GUIDE DU JEU</h1>
                
                ${tabsHTML}
                
                <div id="guide-content" style="
                    background: rgba(0, 0, 0, 0.5);
                    padding: 25px;
                    border-radius: 8px;
                    border: 2px solid rgba(0, 255, 0, 0.3);
                    margin-bottom: 20px;
                    line-height: 1.8;
                    font-size: 1.1rem;
                "></div>
                
                ${tabsHTML}
                
                <button id="closeGuide" style="
                    display: block;
                    margin: 20px auto 0;
                    padding: 12px 40px;
                    background: rgba(139, 0, 0, 0.8);
                    border: 2px solid #8B0000;
                    color: white;
                    cursor: pointer;
                    font-family: 'VT323', monospace;
                    font-size: 1.3rem;
                    border-radius: 5px;
                    box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
                    transition: all 0.2s;
                ">Fermer le Guide</button>
            </div>
        `;
        
        this.showGuideContentDeckSelect('basics');
        
        const allTabs = popup.querySelectorAll('.guide-tab');
        allTabs.forEach(tab => {
            tab.onclick = () => {
                const selectedTab = tab.dataset.tab;
                allTabs.forEach(t => {
                    if (t.dataset.tab === selectedTab) {
                        t.classList.add('active');
                        t.style.background = 'rgba(0, 255, 0, 0.3)';
                        t.style.borderColor = '#FFD700';
                        t.style.color = '#FFD700';
                    } else {
                        t.classList.remove('active');
                        t.style.background = 'rgba(0, 0, 0, 0.8)';
                        t.style.borderColor = '#00ff00';
                        t.style.color = '#00ff00';
                    }
                });
                this.showGuideContentDeckSelect(selectedTab);
                document.getElementById('guide-content').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            };
        });
        
        document.getElementById('closeGuide').onclick = () => {
            popup.style.display = 'none';
        };
        
        console.log('✅ Guide affiché');
    }

    /**
     * Afficher le contenu du guide (copié de ui-popups.js)
     */
    showGuideContentDeckSelect(tabName) {
        const content = document.getElementById('guide-content');
        if (!content) return;
        
        const contents = {
            basics: `
                <h2 style="color: #FFD700; font-size: 25px; margin-bottom: 15px;">But du Jeu</h2>
                <p>Tuer le monstre méchant avant de mourir.</p>
                
                <h2 style="color: #FFD700; font-size: 25px; margin: 20px 0 15px;">⚡ Déroulement d'un Tour</h2>
                <ol style="margin-left: 30px;">
                    <li><strong>Placement :</strong> Placez vos cartes sur les slots compatibles du board en réfléchissant bien, une carte posée ne peut plus être retirée.</li>
                    <li><strong>Cliquez "Fin de Tour" :</strong> Résolution automatique</li>
                    <li><strong>Résolution :</strong>
                        <ul style="margin-left: 20px; margin-top: 10px;">
                            <li>A) Calcul DAMAGE total → Dégâts à l'ennemi</li>
                            <li>B) Calcul BLOCK total → Shield ajouté</li>
                            <li>C) Ennemi attaque → Shield absorbe</li>
                            <li>D) Dégâts résiduels au joueur</li>
                            <li>E) Effets STATE (draw, heal, etc.)</li>
                            <li>F) <strong>Défausse de TOUTES les cartes</strong> (sauf atouts et enemies)</li>
                        </ul>
                    </li>
                    <li><strong>Nouveau tour :</strong> </li>
                    <p> On recommence au 1.</p>
                    <p>Pas de pioche automatique en début de tour. Il faudra piocher grâce à vos cartes ou aux effets STATE.</p>
                </ol>
                
                <h2 style="color: #FFD700; font-size: 25px; margin: 20px 0 15px;">Attention, fondamental :</h2>
                <p style="color: #FF1744; font-size: 20px;">
                    ❌ <strong>TOUTES les cartes sont défaussées en fin de tour</strong> (sauf atouts)
                </p>
                <p>→ Les bonus (charmes, auras, maxxers) ne persistent PAS d'un tour à l'autre</p>
                <p>→ Planifiez vos combos sur un seul tour !</p>
            `,
            
            board: `
                <h2 style="color: #FFD700; font-size: 36px; margin-bottom: 15px;">Le Board (16 Slots)</h2>
                
                <h3 style="color: #00BFFF; font-size: 28px; margin: 15px 0 10px;">🛡️ ENTITE BLOCK (slots bleus)</h3>
                <p>• Réduit les dégâts ennemis</p>
                <p>• Alimente le shield si il y a un excédent de blocage.</p>
                <p>• Le shield persiste entre les tours, avec 20% de moins à chaque tour. </p>
                <p>• Une jauge combo augmente quand vous gagnez du shield, cliquez dessus pour des bonus</p>
                
                <h3 style="color: #FF1744; font-size: 28px; margin: 15px 0 10px;">⚔️ ENTITE DAMAGE (slots rouges)</h3>
                <p>• Inflige des dégâts à l'ennemi</p>
                
                <h3 style="color: #FFD700; font-size: 28px; margin: 15px 0 10px;">✨ ENTITE STATE (slots dorés)</h3>
                <p>• Value totale → Rewards (draw, heal, marchandises)</p>
                <p>• Tier 0→4</p>
                <p>• Pas de maxxer</p>

                <h2 style="color: #FFD700; font-size: 36px; margin: 20px 0 15px;">Les Maxxers</h2>
                <p>• Ce sont des multiplicateurs qui augmentent la value des slots DAMAGE et BLOCK</p>
                <p>• Il y a un maxxer BLOCK et un maxxer DAMAGE qui sont associés à leur entité respective.</p>
                <p>• Attention : A chauque tour ils commencent à 0, ce qui veut dire que les slots BLOCK et DAMAGE sont inutilisables tant que les maxxers n'ont pas été augmentés </p>
                <p>• Niveau 0 par défaut = ×0 (aucun bonus)</p>
                <p>• Niveau 1 = ×1 (+25%)</p>
                <p>• Niveau 2 = ×1.25 (+50%)</p>
                <p>• ETC</p>
                <p>• <strong>Reset à 0 chaque tour</strong> </p>
                
                <h3 style="color: #00ff00; font-size: 28px; margin: 15px 0 10px;">🎯 PLAYER (3 slots verts)</h3>
                <p>• Pour les atouts permanents uniquement</p>
                <p>• Atouts ne se défaussent JAMAIS</p>
                
                <h3 style="color: #FF0000; font-size: 28px; margin: 15px 0 10px;">👹 ENEMY (3 slots rouges)</h3>
                <p>• Cartes ennemies avec HP et effets</p>
                <p>• Certaines ont des timers (compteurs)</p>
                <p>• Vous pouvez cibler une carte ennemie en lui cliquant dessus</p>
                
                <h2 style="color: #FFD700; font-size: 36px; margin: 20px 0 15px;">🔗 Voisinage</h2>
                <p>• Les slots adjacents se donnent des bonus</p>
                <p>• Lignes vertes = voisins actifs</p>
                <p>• Certaines cartes ont des effets "bonus_neighbors" ou "penalty_neighbors"</p>
                <p>• Généralement les cartes ayant un effet voisin ne peuvent pas être posées sur les slots partagés (DAMAGE+BLOCK ou DAMAGE+STATE)</p>
                
            `,
            
            cards: `
                <h2 style="color: #FFD700; font-size: 36px; margin-bottom: 15px;">🃏 Types de Cartes</h2>
                
                <h3 style="color: #00ff00; font-size: 28px; margin: 15px 0 10px;">🐙 CRÉATURES</h3>
                <p>• Cartes jouables classiques</p>
                <p>• Elles ont une value, leur force d'une certaine manière, cette value va augmenter la value de l'entité correspondante au slot sur lequel la créature est posée. </p>
                <p>• Défaussées en fin de tour</p>
                <p>• Peuvent avoir des effets instant, passifs, ou on_discard</p>
                
                <h3 style="color: #9370DB; font-size: 28px; margin: 15px 0 10px;">⚡ CHARMES (Violet)</h3>
                <p>• Ils équipent des créatures déjà posées</p>
                <p>• <strong>Pose infinie :</strong> Aucune limite par créature</p>
                <p>• Défaussés avec la créature équipée</p>
                <p>• Exemples : +10 value, maxxer +1, heal à la défausse</p>
                
                <h3 style="color: #808080; font-size: 28px; margin: 15px 0 10px;">🎫 TOKENS (Gris)</h3>
                <p>• Générés par des effets de cartes</p>
                <p>• Défaussés en fin de tour comme les créatures</p>
                
                <h3 style="color: #FF0000; font-size: 28px; margin: 15px 0 10px;">👹 ENEMIES</h3>
                <p>• Cartes ennemies avec HP et attaque</p>
                <p>• Certaines ont des effets spéciaux ou timers</p>
                <p>• On peut cibler les cartes ennemies en leur cliquant dessus</p>

                <h3 style="color: #00ff00; font-size: 28px; margin: 15px 0 10px;">🏭 ATOUTS (Vert)</h3>
                <p>• <strong>Permanents</strong> </p>
                <p>• Ce ne sont pas vraiment des cartes, les slots players se débloquent au tours 3, 6 et 9. Une fois débloqué, clique dessus pour placer un atout.</p>
                
                <h2 style="color: #FFD700; font-size: 36px; margin: 20px 0 15px;">✨ Types d'Effets</h2>
                <p><strong>Instant :</strong> Se déclenche immédiatement à la pose (draw, discover, missiles)</p>
                <p><strong>Passif :</strong> Calculé dynamiquement (aura_tribal, count_tribal)</p>
                <p><strong>On Discard :</strong> Se déclenche à la défausse (jetons, heal, draw)</p>
                <p><strong>Maxxer :</strong> Boost les maxxers ce tour</p>
            `,
            
            tribes: `
                <h2 style="color: #FFD700; font-size: 36px; margin-bottom: 15px;">🌟 Les 5 Tribus</h2>
                
                <h3 style="color: #00BFFF; font-size: 32px; margin: 20px 0 10px;">🐚 MOLLUSQUES</h3>
                <p><strong>Identité :</strong> On parle de mollusques, ils n'ont pas d'identité.</p>
                
                <h3 style="color: #FF1744; font-size: 32px; margin: 20px 0 10px;">🔪 ZIGOUILLEURS</h3>
                <p><strong>Identité :</strong> Gné. </p>
                <p><strong>Système Tribal :</strong> CASINO : amassez des munitions pour jouer au casino.</p>
                
                <h3 style="color: #FFD700; font-size: 32px; margin: 20px 0 10px;">💰 TRAFIQUANTS</h3>
                <p><strong>Identité :</strong> Business is business</p>
                <p><strong>Mécaniques :</strong> Variées</p>
                <p><strong>Système Tribal :</strong> Shop : Il vous faudra des marchandises pour faire des affaires au magasin.</p>
                
                <h3 style="color: #9370DB; font-size: 32px; margin: 20px 0 10px;">👤 OMBRES</h3>
                <p><strong>Identité :</strong> Elles sont partout</p>
                <p><strong>Système Tribal :</strong> Fusion : fusionnez vos tokens pour plus de puissaaaaance. Plus vous fusionnez, plus vos tokens sont forts. </p>
                
                <h3 style="color: #FF00FF; font-size: 32px; margin: 20px 0 10px;">🪞 ILLUSIONS</h3>
                <p><strong>Identité :</strong> On me voit, on me voit plus.</p>
                <p><strong>Système Tribal :</strong> Miroir des illusions : vous pouvez copier une carte dans le miroir, elle sera jouable une nouvelle fois depuis le miroir au tour suivant. Plus vous utilisez le miroir plus il est fort et pourra dupliquer la créature à l'intérieur quand vous la jouez. Mais attention, il finit par se briser.</p>
            `,
        };
        
        content.innerHTML = contents[tabName] || contents.basics;
        
        // Scroll en haut après changement de tab
        content.scrollTop = 0;
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

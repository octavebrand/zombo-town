// ========================================
// SPLASH SCREEN - "Enter Game"
// ========================================
// Écran d'entrée pour contourner autoplay policy

import { getAudioManager } from './audioManager.js';

export class SplashScreen {
    constructor() {
        this.audioManager = getAudioManager();
        this.onEnter = null;
    }

    /**
     * Affiche le splash screen
     * @param {Function} callback - Fonction appelée quand l'utilisateur clique
     */
    show(callback) {
        this.onEnter = callback;
        this.render();
    }

    render() {
        // Créer le conteneur
        const container = document.createElement('div');
        container.id = 'splash-screen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #000000ff 0%, #000000ff 50%, #24243e 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            animation: fadeIn 0.5s ease-in;
        `;

        container.innerHTML = `
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
                }
            </style>

            <!-- Titre du jeu -->
            <div style="
                font-size: 72px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            ">
                ZOMBO TOWN
            </div>

            <!-- Sous-titre -->
            <div style="
                font-size: 24px;
                color: #aaa;
                margin-bottom: 60px;
                letter-spacing: 2px;
            ">
                Welcome <br>to zombo town
            </div>

            <!-- Bouton Enter Game -->
            <button id="enterGameBtn" style="
                padding: 20px 60px;
                font-size: 28px;
                font-weight: bold;
                color: #1a1a2e;
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                border: 3px solid #FFD700;
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s;
                animation: glow 2s infinite;
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
            ">
                ENTER LOBBY
            </button>

            <!-- Instructions -->
            <div style="
                margin-top: 40px;
                font-size: 16px;
                color: #888;
                text-align: center;
            ">
                Welcome
            </div>
        `;

        document.body.appendChild(container);

        // Effet hover sur bouton
        const btn = document.getElementById('enterGameBtn');
        btn.onmouseover = () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 15px 40px rgba(255, 215, 0, 0.6)';
        };
        btn.onmouseout = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 10px 30px rgba(255, 215, 0, 0.4)';
        };

        // Click handler
        btn.onclick = () => {
            // Démarrer la musique lobby
            this.audioManager.playMusic('deck_selection');
            
            // Effet de disparition
            container.style.animation = 'fadeOut 0.5s ease-out';
            container.style.opacity = '0';

            // Retirer après l'animation
            setTimeout(() => {
                container.remove();
                
                // Callback
                if (this.onEnter) {
                    this.onEnter();
                }
            }, 500);
        };
    }

    /**
     * Cache immédiatement le splash screen (si besoin)
     */
    hide() {
        const container = document.getElementById('splash-screen');
        if (container) {
            container.remove();
        }
    }
}
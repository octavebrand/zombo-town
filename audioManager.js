// ========================================
// AUDIO MANAGER - ZOMBO TOWN
// ========================================
// Système audio centralisé : musique + SFX
// Data-driven, extensible, avec contrôle volume

export class AudioManager {
    constructor() {
        // Configuration des sons (data-driven)
        this.sounds = {
            // Musiques (loop)
            music: {
                deck_selection: { path: 'sounds/music/deck_selection.mp3', loop: true, volume: 0.4 },
                combat: { path: 'sounds/music/combat.mp3', loop: true, volume: 0.2 }
            },
            // SFX (one-shot)
            sfx: {
                click: { path: 'sounds/sfx/click.mp3', volume: 0.4 },
                card_place: { path: 'sounds/sfx/card_place.mp3', volume: 0.15 },
                card_invalid: { path: 'sounds/sfx/card_invalid.mp3', volume: 0.2 },
                victory: { path: 'sounds/sfx/victory.mp3', volume: 0.7 },
                defeat: { path: 'sounds/sfx/defeat.mp3', volume: 0.7 }
            }
        };

        // Audio elements
        this.musicPlayer = null; // Current playing music
        this.currentMusicKey = null;
        this.sfxPlayers = {}; // Pool de players SFX

        // Settings (persistent via localStorage)
        this.masterVolume = this.loadVolume();
        this.isMuted = false;

        // Preload audio
        this.preloadAudio();
    }

    // ========================================
    // PRELOAD
    // ========================================
    preloadAudio() {
        // Preload music
        Object.entries(this.sounds.music).forEach(([key, config]) => {
            const audio = new Audio();
            audio.src = config.path;
            audio.loop = config.loop;
            audio.volume = config.volume * this.masterVolume;
            audio.preload = 'auto';
            // Store for later use (optional optimization)
        });

        // Preload SFX
        Object.entries(this.sounds.sfx).forEach(([key, config]) => {
            const audio = new Audio();
            audio.src = config.path;
            audio.volume = config.volume * this.masterVolume;
            audio.preload = 'auto';
            this.sfxPlayers[key] = audio;
        });
    }

    // ========================================
    // MUSIC
    // ========================================
    playMusic(musicKey) {
        if (this.isMuted) return;
        if (this.currentMusicKey === musicKey && this.musicPlayer && !this.musicPlayer.paused) {
            return; // Already playing this music
        }

        // Stop current music
        this.stopMusic();

        // Get config
        const config = this.sounds.music[musicKey];
        if (!config) {
            console.warn(`[AudioManager] Music not found: ${musicKey}`);
            return;
        }

        // Create new player
        this.musicPlayer = new Audio(config.path);
        this.musicPlayer.loop = config.loop;
        this.musicPlayer.volume = config.volume * this.masterVolume;
        this.currentMusicKey = musicKey;

        // Play with error handling
        this.musicPlayer.play().catch(err => {
            console.warn(`[AudioManager] Could not play music ${musicKey}:`, err);
        });
    }

    stopMusic() {
        if (this.musicPlayer) {
            this.musicPlayer.pause();
            this.musicPlayer.currentTime = 0;
            this.musicPlayer = null;
            this.currentMusicKey = null;
        }
    }

    // ========================================
    // SFX
    // ========================================
    playSFX(sfxKey) {
        if (this.isMuted) return;

        const config = this.sounds.sfx[sfxKey];
        if (!config) {
            console.warn(`[AudioManager] SFX not found: ${sfxKey}`);
            return;
        }

        // Clone audio to allow overlapping plays
        const audio = this.sfxPlayers[sfxKey].cloneNode();
        audio.volume = config.volume * this.masterVolume;
        
        audio.play().catch(err => {
            console.warn(`[AudioManager] Could not play SFX ${sfxKey}:`, err);
        });
    }

    // ========================================
    // VOLUME CONTROL
    // ========================================
    setVolume(value) {
        // value: 0.0 to 1.0
        this.masterVolume = Math.max(0, Math.min(1, value));
        this.saveVolume();

        // Update current music volume
        if (this.musicPlayer) {
            const config = this.sounds.music[this.currentMusicKey];
            this.musicPlayer.volume = config.volume * this.masterVolume;
        }

        // Update SFX volumes (they'll use new volume on next play)
    }

    getVolume() {
        return this.masterVolume;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            if (this.musicPlayer) {
                this.musicPlayer.pause();
            }
        } else {
            if (this.musicPlayer) {
                this.musicPlayer.play();
            }
        }
        return this.isMuted;
    }

    // ========================================
    // PERSISTENCE
    // ========================================
    saveVolume() {
        localStorage.setItem('zombotown_volume', this.masterVolume.toString());
    }

    loadVolume() {
        const saved = localStorage.getItem('zombotown_volume');
        return saved ? parseFloat(saved) : 0.5; // Default 50%
    }

    // ========================================
    // HELPERS
    // ========================================
    // Stop all audio (useful for game over, etc.)
    stopAll() {
        this.stopMusic();
        // SFX will naturally finish playing
    }
}

// Instance unique (singleton)
let instance = null;

export function getAudioManager() {
    if (!instance) {
        instance = new AudioManager();
    }
    return instance;
}

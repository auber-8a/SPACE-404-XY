/**
 * Gestor centralizado de audio para música y efectos de sonido del juego
 */
class AudioManager {
  constructor() {
    this.menuMusic = null;
    this.gameMusic = null;
    this.audioElements = new Map();
    this.settings = {
      musicEnabled: true,
      soundEffectsEnabled: true,
      musicVolume: 0.5,
      effectsVolume: 0.3,
    };
  }

  /**
   * Inicializa el gestor de audio y registra los elementos HTML de audio
   */
  initialize() {
    this.menuMusic = document.getElementById("menuMusic");
    this.gameMusic = document.getElementById("gameMusic");

    this.audioElements.set("menu", this.menuMusic);
    this.audioElements.set("game", this.gameMusic);
    this.audioElements.set("impact", document.getElementById("impactSound"));
    this.audioElements.set(
      "gameOver",
      document.getElementById("gameOverSound")
    );
    this.audioElements.set("win", document.getElementById("winSound"));

    this.applySettings();
  }

  /**
   * Aplica la configuración de volumen y estado de audio actual
   */
  applySettings() {
    if (this.menuMusic) {
      this.menuMusic.volume = this.settings.musicVolume;
      this.menuMusic.muted = !this.settings.musicEnabled;
    }
    if (this.gameMusic) {
      this.gameMusic.volume = this.settings.musicVolume;
      this.gameMusic.muted = !this.settings.musicEnabled;
    }
  }

  /**
   * Reproduce la música del menú y detiene la música del juego si está sonando
   */
  playMenuMusic() {
    if (!this.menuMusic || !this.settings.musicEnabled) return;

    if (this.gameMusic && !this.gameMusic.paused) {
      this.gameMusic.pause();
      this.gameMusic.currentTime = 0;
    }

    if (this.menuMusic.paused) {
      this.menuMusic
        .play()
        .catch((err) => console.log("Error playing menu music:", err));
    }
  }

  /**
   * Reproduce la música del juego y detiene la música del menú
   */
  playGameMusic() {
    if (!this.gameMusic || !this.settings.musicEnabled) return;

    if (this.menuMusic && !this.menuMusic.paused) {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }

    this.gameMusic.currentTime = 0;
    this.gameMusic
      .play()
      .catch((err) => console.log("Error playing game music:", err));
  }

  /**
   * Detiene la música del juego y reinicia su posición
   */
  stopGameMusic() {
    if (this.gameMusic) {
      this.gameMusic.pause();
      this.gameMusic.currentTime = 0;
    }
  }

  /**
   * Reproduce un efecto de sonido específico
   * @param {string} soundName - Nombre del efecto de sonido a reproducir
   */
  playSoundEffect(soundName) {
    if (!this.settings.soundEffectsEnabled) return;

    const audio = this.audioElements.get(soundName);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = this.settings.effectsVolume;
      audio
        .play()
        .catch((err) => console.log(`Error playing ${soundName}:`, err));
    }
  }

  /**
   * Alterna el estado de la música entre encendido y apagado
   */
  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;

    if (this.menuMusic) this.menuMusic.muted = !this.settings.musicEnabled;
    if (this.gameMusic) this.gameMusic.muted = !this.settings.musicEnabled;

    if (this.settings.musicEnabled) {
      const activeMusic =
        this.gameMusic && !this.gameMusic.paused
          ? this.gameMusic
          : this.menuMusic;
      if (activeMusic && activeMusic.paused) {
        activeMusic
          .play()
          .catch((err) => console.log("Error playing music:", err));
      }
    }
  }

  /**
   * Alterna el estado de los efectos de sonido y reproduce uno de prueba si se activan
   */
  toggleSoundEffects() {
    this.settings.soundEffectsEnabled = !this.settings.soundEffectsEnabled;

    if (this.settings.soundEffectsEnabled && window.playSoundEffect) {
      window.playSoundEffect("laserSound");
    }
  }

  /**
   * Establece el volumen de la música
   * @param {number} volume - Volumen entre 0 y 1
   */
  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.menuMusic) this.menuMusic.volume = this.settings.musicVolume;
    if (this.gameMusic) this.gameMusic.volume = this.settings.musicVolume;
  }

  setEffectsVolume(volume) {
    this.settings.effectsVolume = Math.max(0, Math.min(1, volume));
    if (window.gameConfig) {
      window.gameConfig.effectsVolume = this.settings.effectsVolume;
    }
  }

  /**
   * Obtiene una copia de la configuración actual de audio
   * @returns {Object} Configuración de audio actual
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Sincroniza la configuración local con la configuración global del juego
   */
  syncWithGlobalConfig() {
    if (window.gameConfig) {
      this.settings.soundEffectsEnabled = window.gameConfig.soundEffectsEnabled;
      this.settings.effectsVolume = window.gameConfig.effectsVolume || 0.3;
    }
  }
}

export const audioManager = new AudioManager();

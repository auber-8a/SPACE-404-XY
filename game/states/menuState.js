import { loader } from "../../engine/loader.js";
import { audioManager } from "../utils/audioManager.js";

/**
 * Estado del menú principal con botones de navegación y control de audio
 */
class MenuState {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   * @param {Object} stateManager - Gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;
    this.musicStarted = false;
    this.buttons = {
      play: { x: 0, y: 0, width: 0, height: 0 },
      settings: { x: 0, y: 0, width: 0, height: 0 },
      sound: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  /**
   * Inicializa el estado y reproduce la música del menú
   */
  enter() {
    console.log("Entrando al menú principal");

    if (!audioManager.menuMusic) {
      audioManager.initialize();
    }

    audioManager.playMenuMusic();
    this.musicStarted = true;
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Delta time en segundos
   */
  update(dt) {}

  /**
   * Renderiza el menú principal con fondo, título y botones
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    const fondoCarga = loader.getImage("fondo_carga");
    if (fondoCarga) {
      ctx.drawImage(fondoCarga, 0, 0, this.canvas.width, this.canvas.height);
    }

    const tituloImg = loader.getImage("titulo");
    if (tituloImg) {
      const tituloX = (this.canvas.width - tituloImg.width) / 2;
      const tituloY = -25;
      ctx.drawImage(tituloImg, tituloX, tituloY);
    }

    const playBtn = loader.getImage("play");
    if (playBtn) {
      const playX = this.canvas.width - playBtn.width - 50;
      const playY = this.canvas.height / 2 - 100;
      ctx.drawImage(playBtn, playX, playY);
      this.buttons.play = {
        x: playX,
        y: playY,
        width: playBtn.width,
        height: playBtn.height,
      };
    }

    const settingsBtn = loader.getImage("settings");
    if (settingsBtn) {
      const settingsX = this.canvas.width - settingsBtn.width - 50;
      const settingsY = this.canvas.height / 2 + 20;
      ctx.drawImage(settingsBtn, settingsX, settingsY);
      this.buttons.settings = {
        x: settingsX,
        y: settingsY,
        width: settingsBtn.width,
        height: settingsBtn.height,
      };
    }

    const soundBtn = loader.getImage("sound");
    if (soundBtn) {
      const soundX = 20;
      const soundY = this.canvas.height - soundBtn.height * 2.5 - 20;
      const newWidth = soundBtn.width * 2.5;
      const newHeight = soundBtn.height * 2.5;
      ctx.drawImage(soundBtn, soundX, soundY, newWidth, newHeight);

      this.buttons.sound = {
        x: soundX,
        y: soundY,
        width: newWidth,
        height: newHeight,
      };

      const settings = audioManager.getSettings();
      if (!settings.musicEnabled) {
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        const padding = 10;
        ctx.beginPath();
        ctx.moveTo(soundX + padding, soundY + padding);
        ctx.lineTo(soundX + newWidth - padding, soundY + newHeight - padding);
        ctx.moveTo(soundX + newWidth - padding, soundY + padding);
        ctx.lineTo(soundX + padding, soundY + newHeight - padding);
        ctx.stroke();

        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          soundX + newWidth / 2,
          soundY + newHeight / 2,
          newWidth / 2 + 5,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }
  }

  /**
   * Maneja los clics en los botones del menú
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción ejecutada o null
   */
  handleClick(x, y) {
    if (
      x >= this.buttons.play.x &&
      x <= this.buttons.play.x + this.buttons.play.width &&
      y >= this.buttons.play.y &&
      y <= this.buttons.play.y + this.buttons.play.height
    ) {
      console.log("Botón Play presionado");
      this.stateManager.setState("levelSelect");
      return "play";
    }

    if (
      x >= this.buttons.settings.x &&
      x <= this.buttons.settings.x + this.buttons.settings.width &&
      y >= this.buttons.settings.y &&
      y <= this.buttons.settings.y + this.buttons.settings.height
    ) {
      console.log("Botón Settings presionado");
      this.stateManager.setState("settings");
      return "settings";
    }

    if (
      x >= this.buttons.sound.x &&
      x <= this.buttons.sound.x + this.buttons.sound.width &&
      y >= this.buttons.sound.y &&
      y <= this.buttons.sound.y + this.buttons.sound.height
    ) {
      console.log("Botón Sound presionado");
      audioManager.toggleMusic();
      const settings = audioManager.getSettings();
      console.log("Música habilitada:", settings.musicEnabled);
      return "sound";
    }

    return null;
  }

  /**
   * Limpia el estado al salir (la música del menú continúa en otros estados del menú)
   */
  exit() {
    console.log("Saliendo del menú principal");
  }
}

export default MenuState;

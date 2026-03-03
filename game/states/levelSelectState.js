import { loader } from "../../engine/loader.js";
import { audioManager } from "../utils/audioManager.js";

/**
 * Estado de selección de niveles con botones de navegación y control de audio
 */
class LevelSelectState {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   * @param {Object} stateManager - Gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;
    this.levels = [
      { id: 1, x: 150, y: 200, width: 64, height: 64 },
      { id: 2, x: 400, y: 200, width: 64, height: 64 },
      { id: 3, x: 650, y: 200, width: 64, height: 64 },
    ];
    this.buttons = {
      back: { x: 0, y: 0, width: 0, height: 0 },
      sound: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  /**
   * Inicializa el estado y asegura que la música del menú continúe
   */
  enter() {
    console.log("Entrando a selección de niveles");

    audioManager.playMenuMusic();
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Delta time en segundos
   */
  update(dt) {}

  /**
   * Renderiza la pantalla de selección de niveles
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    const fondoDesenfocado = loader.getImage("fondo_desenfocado");
    if (fondoDesenfocado) {
      ctx.drawImage(
        fondoDesenfocado,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
    }

    ctx.fillStyle = "#eee";
    ctx.font = "36px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Selecciona un Nivel", this.canvas.width / 2, 100);

    const nivel1 = loader.getImage("nivel1");
    const nivel2 = loader.getImage("nivel2");
    const nivel3 = loader.getImage("nivel3");

    if (nivel1) {
      ctx.drawImage(
        nivel1,
        this.levels[0].x,
        this.levels[0].y,
        this.levels[0].width,
        this.levels[0].height
      );
    }

    if (nivel2) {
      ctx.drawImage(
        nivel2,
        this.levels[1].x,
        this.levels[1].y,
        this.levels[1].width,
        this.levels[1].height
      );
    }

    if (nivel3) {
      ctx.drawImage(
        nivel3,
        this.levels[2].x,
        this.levels[2].y,
        this.levels[2].width,
        this.levels[2].height
      );
    }

    ctx.font = "20px system-ui";
    ctx.fillStyle = "#fff";
    ctx.fillText("Nivel 1", this.levels[0].x + 32, this.levels[0].y + 90);
    ctx.fillText("Nivel 2", this.levels[1].x + 32, this.levels[1].y + 90);
    ctx.fillText("Nivel 3", this.levels[2].x + 32, this.levels[2].y + 90);

    const backBtn = loader.getImage("back");
    if (backBtn) {
      const backX = 20;
      const backY = 20;
      const newWidth = backBtn.width * 2.5;
      const newHeight = backBtn.height * 2.5;
      ctx.drawImage(backBtn, backX, backY, newWidth, newHeight);
      this.buttons.back = {
        x: backX,
        y: backY,
        width: newWidth,
        height: newHeight,
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
   * Limpia el estado al salir
   */
  exit() {
    console.log("Saliendo de selección de niveles");
  }

  /**
   * Maneja los clics en niveles y botones
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|number|null} Acción ejecutada o nivel seleccionado
   */
  handleClick(x, y) {
    if (
      x >= this.buttons.back.x &&
      x <= this.buttons.back.x + this.buttons.back.width &&
      y >= this.buttons.back.y &&
      y <= this.buttons.back.y + this.buttons.back.height
    ) {
      console.log("Botón Back presionado - Regresando al menú");
      this.stateManager.setState("menu");
      return "back";
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

    for (let level of this.levels) {
      if (
        x >= level.x &&
        x <= level.x + level.width &&
        y >= level.y &&
        y <= level.y + level.height
      ) {
        console.log(`Nivel ${level.id} seleccionado`);
        if (level.id === 1) {
          this.stateManager.setState("level1");
        } else if (level.id === 2) {
          this.stateManager.setState("level2");
        } else if (level.id === 3) {
          this.stateManager.setState("level3");
        }
        return level.id;
      }
    }
    return null;
  }

  /**
   * Maneja las teclas presionadas
   * @param {string} key - Tecla presionada
   */
  handleKeyDown(key) {
    if (key === "Escape") {
      console.log("Tecla Escape presionada - Regresando al menú");
      this.stateManager.setState("menu");
    }
  }
}

export default LevelSelectState;

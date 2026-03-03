/**
 * Estado que muestra la pantalla de Game Over cuando el jugador pierde
 */
import { loader } from "../../engine/loader.js";

class GameOverState {
  /**
   * @param {HTMLCanvasElement} canvas - Lienzo del juego
   * @param {Object} stateManager - Instancia del gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;

    this.backgroundState = null;
    this.backgroundStateName = "";

    this.buttons = {
      reiniciar: { x: 0, y: 0, width: 0, height: 0 },
      menuPrincipal: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  /**
   * Ciclo de vida del estado: Entrar al estado
   */
  enter() {
    console.log("Entrando a Game Over");

    if (window.playSoundEffect) {
      window.playSoundEffect("gameOverSound");
    }

    const gameMusic = document.getElementById("gameMusic");
    if (gameMusic) {
      gameMusic.pause();
    }
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Tiempo delta en segundos
   */
  update(dt) {}

  /**
   * Configura el estado de fondo a renderizar
   * @param {Object} state - Estado del nivel a mostrar congelado
   * @param {string} stateName - Nombre del estado
   */
  setBackgroundState(state, stateName) {
    this.backgroundState = state;
    this.backgroundStateName = stateName;
  }

  /**
   * Renderiza la pantalla de Game Over
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   */
  render(ctx) {
    if (this.backgroundState) {
      this.backgroundState.render(ctx);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const panelWidth = 600;
    const panelHeight = 400;
    const panelX = (this.canvas.width - panelWidth) / 2;
    const panelY = (this.canvas.height - panelHeight) / 2;

    this.drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 20);

    ctx.fillStyle = "#f00";
    ctx.font = "bold 48px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", this.canvas.width / 2, panelY + 80);

    ctx.fillStyle = "#eee";
    ctx.font = "20px system-ui";
    ctx.fillText(
      "Tu nave ha sido destruida",
      this.canvas.width / 2,
      panelY + 130
    );

    const centerX = this.canvas.width / 2;
    const startY = panelY + 180;
    const spacing = 80;

    const reiniciarBtn = loader.getImage("reiniciar");
    if (reiniciarBtn) {
      const btnX = centerX - reiniciarBtn.width / 2;
      const btnY = startY;
      ctx.drawImage(reiniciarBtn, btnX, btnY);
      this.buttons.reiniciar = {
        x: btnX,
        y: btnY,
        width: reiniciarBtn.width,
        height: reiniciarBtn.height,
      };
    }

    const menuPrincipalBtn = loader.getImage("menu_principal");
    if (menuPrincipalBtn) {
      const btnX = centerX - menuPrincipalBtn.width / 2;
      const btnY = startY + spacing;
      ctx.drawImage(menuPrincipalBtn, btnX, btnY);
      this.buttons.menuPrincipal = {
        x: btnX,
        y: btnY,
        width: menuPrincipalBtn.width,
        height: menuPrincipalBtn.height,
      };
    }

    ctx.fillStyle = "#aaa";
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Presiona ESC para volver a la selección de niveles",
      this.canvas.width / 2,
      panelY + panelHeight - 20
    );
  }

  /**
   * Dibuja un rectángulo con bordes redondeados
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   * @param {number} width - Ancho
   * @param {number} height - Alto
   * @param {number} radius - Radio de las esquinas
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.fillStyle = "rgba(20, 20, 30, 0.95)";
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#4bd";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  /**
   * Ciclo de vida del estado: Salir del estado
   */
  exit() {
    console.log("Saliendo de Game Over");
  }

  /**
   * Maneja eventos de clic del mouse
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción realizada o null
   */
  handleClick(x, y) {
    if (
      x >= this.buttons.reiniciar.x &&
      x <= this.buttons.reiniciar.x + this.buttons.reiniciar.width &&
      y >= this.buttons.reiniciar.y &&
      y <= this.buttons.reiniciar.y + this.buttons.reiniciar.height
    ) {
      console.log("Reiniciando nivel");
      if (
        this.backgroundState &&
        typeof this.backgroundState.restart === "function"
      ) {
        this.backgroundState.restart();
      }
      this.stateManager.setState(this.backgroundStateName);
      return "reiniciar";
    }

    if (
      x >= this.buttons.menuPrincipal.x &&
      x <= this.buttons.menuPrincipal.x + this.buttons.menuPrincipal.width &&
      y >= this.buttons.menuPrincipal.y &&
      y <= this.buttons.menuPrincipal.y + this.buttons.menuPrincipal.height
    ) {
      console.log("Regresando al menú principal");

      if (
        this.backgroundState &&
        typeof this.backgroundState.restart === "function"
      ) {
        this.backgroundState.restart();
      }

      this.stateManager.setState("menu");
      return "menuPrincipal";
    }

    return null;
  }

  /**
   * Maneja la presión de una tecla del teclado
   * @param {string} key - Nombre de la tecla
   */
  handleKeyDown(key) {
    if (key === "Escape") {
      console.log("Regresando a la selección de niveles");

      if (
        this.backgroundState &&
        typeof this.backgroundState.restart === "function"
      ) {
        this.backgroundState.restart();
      }

      this.stateManager.setState("levelSelect");
    }
  }
}

export default GameOverState;

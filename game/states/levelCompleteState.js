import { loader } from "../../engine/loader.js";

/**
 * Estado de nivel completado con variantes para niveles intermedios y final
 */
class LevelCompleteState {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   * @param {Object} stateManager - Gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;

    this.backgroundState = null;
    this.backgroundStateName = "";
    this.currentLevel = 1;

    this.buttons = {
      siguienteNivel: { x: 0, y: 0, width: 0, height: 0 },
      reiniciar: { x: 0, y: 0, width: 0, height: 0 },
      menuPrincipal: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  /**
   * Inicializa el estado reproduciendo sonido de victoria y pausando música
   */
  enter() {
    console.log("Entrando a Level Complete");

    if (window.playSoundEffect) {
      window.playSoundEffect("winSound");
    }

    const gameMusic = document.getElementById("gameMusic");
    if (gameMusic) {
      gameMusic.pause();
    }
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Delta time en segundos
   */
  update(dt) {}

  /**
   * Configura el estado de fondo mostrando el nivel congelado
   * @param {Object} state - Estado del nivel a mostrar de fondo
   * @param {string} stateName - Nombre del estado
   * @param {number} level - Número del nivel completado
   */
  setBackgroundState(state, stateName, level) {
    this.backgroundState = state;
    this.backgroundStateName = stateName;
    this.currentLevel = level || 1;
  }

  /**
   * Renderiza la pantalla de nivel completado con overlay y botones
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    if (this.backgroundState) {
      this.backgroundState.render(ctx);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentLevel === 3) {
      this.renderGameComplete(ctx);
    } else {
      this.renderLevelComplete(ctx);
    }
  }

  /**
   * Renderiza la pantalla de nivel completado para niveles intermedios (1 y 2)
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  renderLevelComplete(ctx) {
    const panelWidth = 600;
    const panelHeight = 450;
    const panelX = (this.canvas.width - panelWidth) / 2;
    const panelY = (this.canvas.height - panelHeight) / 2;

    this.drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 20);

    ctx.fillStyle = "#4bd";
    ctx.font = "bold 42px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("NIVEL COMPLETADO", this.canvas.width / 2, panelY + 70);

    ctx.fillStyle = "#eee";
    ctx.font = "20px system-ui";
    ctx.fillText(
      "¡Felicidades! Has destruido todas las naves enemigas",
      this.canvas.width / 2,
      panelY + 120
    );

    const centerX = this.canvas.width / 2;
    const startY = panelY + 170;
    const spacing = 80;

    const siguienteNivelBtn = loader.getImage("siguiente_nivel");
    if (siguienteNivelBtn) {
      const btnX = centerX - siguienteNivelBtn.width / 2;
      const btnY = startY;
      ctx.drawImage(siguienteNivelBtn, btnX, btnY);
      this.buttons.siguienteNivel = {
        x: btnX,
        y: btnY,
        width: siguienteNivelBtn.width,
        height: siguienteNivelBtn.height,
      };
    }

    const reiniciarBtn = loader.getImage("reiniciar");
    if (reiniciarBtn) {
      const btnX = centerX - reiniciarBtn.width / 2;
      const btnY = startY + spacing;
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
      const btnY = startY + spacing * 2;
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
   * Renderiza la pantalla de juego completado para el nivel final (3)
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  renderGameComplete(ctx) {
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (this.canvas.width - panelWidth) / 2;
    const panelY = (this.canvas.height - panelHeight) / 2;

    this.drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 20);

    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 48px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("JUEGO COMPLETADO", this.canvas.width / 2, panelY + 80);

    ctx.fillStyle = "#4bd";
    ctx.font = "bold 28px system-ui";
    ctx.fillText("¡Felicidades!", this.canvas.width / 2, panelY + 150);

    ctx.fillStyle = "#eee";
    ctx.font = "24px system-ui";
    ctx.fillText(
      "Has vengado a la Tierra",
      this.canvas.width / 2,
      panelY + 190
    );

    ctx.fillStyle = "#FFD700";
    ctx.font = "40px system-ui";
    ctx.fillText("★ ★ ★", this.canvas.width / 2, panelY + 240);

    const centerX = this.canvas.width / 2;
    const startY = panelY + 290;
    const spacing = 80;

    this.buttons.siguienteNivel = { x: -1000, y: -1000, width: 0, height: 0 };

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
   * Limpia el estado al salir
   */
  exit() {
    console.log("Saliendo de Level Complete");
  }

  /**
   * Maneja los clics en los botones de la pantalla
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción ejecutada o null
   */
  handleClick(x, y) {
    if (
      x >= this.buttons.siguienteNivel.x &&
      x <= this.buttons.siguienteNivel.x + this.buttons.siguienteNivel.width &&
      y >= this.buttons.siguienteNivel.y &&
      y <= this.buttons.siguienteNivel.y + this.buttons.siguienteNivel.height
    ) {
      console.log("Avanzando al siguiente nivel");

      const nextLevel = this.currentLevel + 1;

      if (nextLevel > 3) {
        console.log("No hay más niveles disponibles");
        this.stateManager.setState("levelSelect");
      } else if (nextLevel === 2) {
        console.log("Cargando Nivel 2");
        this.stateManager.setState("level2");
      } else if (nextLevel === 3) {
        console.log("Cargando Nivel 3");
        this.stateManager.setState("level3");
      }

      return "siguienteNivel";
    }
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

    // Botón Menú Principal
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
   * Maneja las teclas presionadas
   * @param {string} key - Tecla presionada
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

export default LevelCompleteState;

/**
 * Gestión centralizada de controles táctiles para dispositivos móviles
 */
class TouchControlsManager {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.buttons = {
      up: { x: 50, y: 350, radius: 40, pressed: false },
      down: { x: 50, y: 450, radius: 40, pressed: false },
      shoot: { x: 860, y: 400, radius: 50, pressed: false },
    };
    this.activeTouches = new Map();
    this.enabled = true;
  }

  /**
   * Carga las posiciones de los botones desde localStorage
   */
  loadPositions() {
    try {
      const saved = localStorage.getItem("hudButtonPositions");
      if (saved) {
        const positions = JSON.parse(saved);
        this.buttons.up.x = positions.up.x;
        this.buttons.up.y = positions.up.y;
        this.buttons.down.x = positions.down.x;
        this.buttons.down.y = positions.down.y;
        this.buttons.shoot.x = positions.shoot.x;
        this.buttons.shoot.y = positions.shoot.y;
      }
    } catch (e) {
      console.error("Error cargando posiciones HUD:", e);
    }
  }

  /**
   * Guarda las posiciones de los botones en localStorage
   */
  savePositions() {
    try {
      const positions = {
        up: { x: this.buttons.up.x, y: this.buttons.up.y },
        down: { x: this.buttons.down.x, y: this.buttons.down.y },
        shoot: { x: this.buttons.shoot.x, y: this.buttons.shoot.y },
      };
      localStorage.setItem("hudButtonPositions", JSON.stringify(positions));
    } catch (e) {
      console.error("Error guardando posiciones HUD:", e);
    }
  }

  /**
   * Maneja el inicio de un toque
   * @param {number} x - Coordenada X del toque
   * @param {number} y - Coordenada Y del toque
   * @param {number} touchId - ID del toque
   * @returns {boolean} True si se tocó un botón
   */
  handleTouchStart(x, y, touchId) {
    for (let [buttonName, button] of Object.entries(this.buttons)) {
      const distance = Math.sqrt((x - button.x) ** 2 + (y - button.y) ** 2);
      if (distance <= button.radius) {
        button.pressed = true;
        this.activeTouches.set(touchId, buttonName);
        return true;
      }
    }
    return false;
  }

  /**
   * Maneja el movimiento de un toque
   * @param {number} x - Coordenada X del toque
   * @param {number} y - Coordenada Y del toque
   * @param {number} touchId - ID del toque
   */
  handleTouchMove(x, y, touchId) {
    const currentButton = this.activeTouches.get(touchId);
    if (currentButton) {
      const button = this.buttons[currentButton];
      const distance = Math.sqrt((x - button.x) ** 2 + (y - button.y) ** 2);
      if (distance > button.radius) {
        button.pressed = false;
        this.activeTouches.delete(touchId);
      }
    }
  }

  /**
   * Maneja el fin de un toque
   * @param {number} touchId - ID del toque
   */
  handleTouchEnd(touchId) {
    const buttonName = this.activeTouches.get(touchId);
    if (buttonName) {
      this.buttons[buttonName].pressed = false;
      this.activeTouches.delete(touchId);
    }
  }

  /**
   * Verifica si un botón está presionado
   * @param {string} buttonName - Nombre del botón
   * @returns {boolean} True si está presionado
   */
  isButtonPressed(buttonName) {
    return this.buttons[buttonName]?.pressed || false;
  }

  /**
   * Renderiza los controles táctiles en el canvas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    if (!this.enabled) return;

    this.drawButton(ctx, this.buttons.up, "▲");

    this.drawButton(ctx, this.buttons.down, "▼");

    this.drawButton(ctx, this.buttons.shoot, "🎯", true);
  }

  /**
   * Dibuja un botón táctil
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {Object} button - Botón a dibujar
   * @param {string} icon - Icono o texto del botón
   * @param {boolean} isShoot - Si es el botón de disparo
   */
  drawButton(ctx, button, icon, isShoot = false) {
    const { x, y, radius, pressed } = button;

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = pressed
      ? "rgba(100, 150, 255, 0.6)"
      : "rgba(50, 50, 50, 0.5)";
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    ctx.strokeStyle = pressed ? "#6cf" : "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius - 10, 0, Math.PI * 2);
    ctx.fillStyle = pressed
      ? "rgba(120, 180, 255, 0.8)"
      : "rgba(80, 80, 80, 0.7)";
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = isShoot
      ? `${radius}px system-ui`
      : `bold ${radius * 0.8}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, x, y);
  }

  /**
   * Reinicia el estado de todos los botones
   */
  reset() {
    for (const button of Object.values(this.buttons)) {
      button.pressed = false;
    }
    this.activeTouches.clear();
  }

  /**
   * Habilita o deshabilita los controles táctiles
   * @param {boolean} enabled - Estado deseado
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.reset();
    }
  }
}

export default TouchControlsManager;

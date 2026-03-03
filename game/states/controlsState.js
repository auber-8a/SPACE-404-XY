/**
 * Estado que muestra la documentación de controles del juego
 */
import { loader } from "../../engine/loader.js";

class ControlsState {
  /**
   * @param {HTMLCanvasElement} canvas - Lienzo del juego
   * @param {Object} stateManager - Instancia del gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;

    this.buttons = {
      back: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  /**
   * Ciclo de vida del estado: Entrar al estado
   */
  enter() {
    console.log("Entrando a pantalla de controles");
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Tiempo delta en segundos
   */
  update(dt) {}

  /**
   * Renderiza la pantalla de controles
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
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

    const controlesDoc = loader.getImage("controles_doc");
    if (controlesDoc) {
      const docX = (this.canvas.width - controlesDoc.width) / 2;
      const docY = (this.canvas.height - controlesDoc.height) / 2;
      ctx.drawImage(controlesDoc, docX, docY);
    }

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
  }

  /**
   * Ciclo de vida del estado: Salir del estado
   */
  exit() {
    console.log("Saliendo de pantalla de controles");
  }

  /**
   * Maneja eventos de clic del mouse
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción realizada o null
   */
  handleClick(x, y) {
    if (
      x >= this.buttons.back.x &&
      x <= this.buttons.back.x + this.buttons.back.width &&
      y >= this.buttons.back.y &&
      y <= this.buttons.back.y + this.buttons.back.height
    ) {
      console.log("Botón Back presionado - Regresando a configuración");
      this.stateManager.setState("settings");
      return "back";
    }

    return null;
  }

  /**
   * Maneja la presión de una tecla del teclado
   * @param {string} key - Nombre de la tecla
   */
  handleKeyDown(key) {
    if (key === "Escape") {
      console.log("Tecla Escape presionada - Regresando a configuración");
      this.stateManager.setState("settings");
    }
  }
}

export default ControlsState;

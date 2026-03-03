/**
 * Clase base para estados de menú que proporciona funcionalidad común
 * como renderizado de fondo, títulos y gestión de botones/sliders.
 */
import ButtonManager from "../utils/buttonManager.js";
import SliderManager from "../utils/sliderManager.js";
import { audioManager } from "../utils/audioManager.js";

class BaseMenuState {
  /**
   * @param {HTMLCanvasElement} canvas - Lienzo del juego
   * @param {Object} stateManager - Instancia del gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;
    this.buttonManager = new ButtonManager();
    this.sliderManager = new SliderManager();
  }

  /**
   * Renderiza una imagen de fondo en el canvas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   * @param {string} imageName - Nombre de la imagen a renderizar
   */
  renderBackground(ctx, imageName = "fondo_desenfocado") {
    const loader = window.loader || require("../../engine/loader.js").loader;
    const bg = loader.getImage(imageName);
    if (bg) {
      ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Renderiza un título en el canvas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   * @param {string} title - Texto del título
   * @param {number} y - Posición vertical del título
   */
  renderTitle(ctx, title, y = 80) {
    ctx.fillStyle = "#eee";
    ctx.font = "42px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(title, this.canvas.width / 2, y);
  }

  /**
   * Maneja la tecla Escape para navegar a otro estado
   * @param {string} targetState - Estado destino al presionar Escape
   */
  handleEscapeKey(targetState = "menu") {
    console.log(`Tecla Escape presionada - Regresando a ${targetState}`);
    this.stateManager.setState(targetState);
  }

  /**
   * Limpia los gestores de botones y sliders
   */
  cleanup() {
    this.buttonManager.clear();
    this.sliderManager.clear();
  }

  /**
   * Ciclo de vida del estado: Salir del estado
   */
  exit() {
    this.cleanup();
  }
}

export default BaseMenuState;

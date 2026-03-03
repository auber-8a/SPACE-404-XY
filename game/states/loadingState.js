import { loader } from "../../engine/loader.js";

/**
 * Estado de pantalla de carga con barra de progreso
 */
class LoadingState {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   */
  constructor(canvas) {
    this.canvas = canvas;
  }

  /**
   * Inicializa el estado de carga
   */
  enter() {
    console.log("Cargando assets...");
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Delta time en segundos
   */
  update(dt) {}

  /**
   * Renderiza la pantalla de carga con barra de progreso
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    ctx.fillStyle = "#0f0f10";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#eee";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Cargando...", this.canvas.width / 2, this.canvas.height / 2);

    const progress = loader.getProgress();
    const barWidth = 400;
    const barHeight = 30;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = this.canvas.height / 2 + 20;

    ctx.strokeStyle = "#eee";
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "#4bd";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  }

  /**
   * Limpia el estado al completar la carga
   */
  exit() {
    console.log("Carga completada");
  }
}

export default LoadingState;

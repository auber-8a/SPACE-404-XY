/**
 * Monitor de rendimiento para verificar FPS y tiempos de carga
 */
class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 1000;
    this.fpsHistory = [];
    this.maxHistoryLength = 60;

    this.loadTimes = {};
    this.isEnabled = true;

    this.position = { x: 10, y: 50 };
    this.showDetailed = false;
  }

  /**
   * Actualiza el contador de FPS
   * @param {number} currentTime - Tiempo actual en milisegundos
   */
  update(currentTime) {
    if (!this.isEnabled) return;

    this.frameCount++;
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.fpsHistory.push(this.fps);

      if (this.fpsHistory.length > this.maxHistoryLength) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * Renderiza el monitor de rendimiento en el canvas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    if (!this.isEnabled) return;

    const { x, y } = this.position;
    const boxWidth = this.showDetailed ? 250 : 150;
    const boxHeight = this.showDetailed ? 180 : 100;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(x, y, boxWidth, boxHeight);

    const borderColor =
      this.fps >= 45 ? "#0f0" : this.fps >= 30 ? "#ff0" : "#f00";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxWidth, boxHeight);

    ctx.fillStyle = borderColor;
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${this.fps} FPS`, x + 10, y + 30);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#fff";
    const status =
      this.fps >= 45 ? "✓ ÓPTIMO" : this.fps >= 30 ? "⚠ ACEPTABLE" : "✗ BAJO";
    ctx.fillText(status, x + 10, y + 50);

    ctx.font = "10px monospace";
    ctx.fillStyle = "#aaa";
    ctx.fillText("F3: Toggle | F4: Detalles", x + 10, y + boxHeight - 15);

    if (this.showDetailed) {
      const minFps =
        this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : this.fps;
      ctx.fillText(`Min: ${minFps} FPS`, x + 10, y + 70);

      const avgFps =
        this.fpsHistory.length > 0
          ? Math.round(
              this.fpsHistory.reduce((a, b) => a + b, 0) /
                this.fpsHistory.length
            )
          : this.fps;
      ctx.fillText(`Avg: ${avgFps} FPS`, x + 10, y + 90);

      this.renderGraph(ctx, x + 10, y + 100, boxWidth - 20, 30);
    }
  }

  /**
   * Renderiza una gráfica de FPS
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho de la gráfica
   * @param {number} height - Alto de la gráfica
   */
  renderGraph(ctx, x, y, width, height) {
    if (this.fpsHistory.length < 2) return;

    ctx.strokeStyle = "rgba(100, 200, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    const fps45Y = y + height - (45 / 60) * height;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
    ctx.beginPath();
    ctx.moveTo(x, fps45Y);
    ctx.lineTo(x + width, fps45Y);
    ctx.stroke();

    ctx.strokeStyle = "#0cf";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = width / (this.maxHistoryLength - 1);
    const maxFps = 60;

    this.fpsHistory.forEach((fps, index) => {
      const px = x + index * step;
      const py = y + height - (Math.min(fps, maxFps) / maxFps) * height;

      if (index === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });

    ctx.stroke();
  }

  /**
   * Marca el inicio de una operación de carga
   * @param {string} name - Nombre de la operación
   */
  startLoad(name) {
    this.loadTimes[name] = {
      start: performance.now(),
      end: null,
      duration: null,
    };
  }

  /**
   * Marca el fin de una operación de carga y registra su duración
   * @param {string} name - Nombre de la operación
   */
  endLoad(name) {
    if (this.loadTimes[name]) {
      this.loadTimes[name].end = performance.now();
      this.loadTimes[name].duration =
        this.loadTimes[name].end - this.loadTimes[name].start;

      console.log(
        `[Performance] ${name}: ${this.loadTimes[name].duration.toFixed(2)}ms`
      );

      if (this.loadTimes[name].duration > 100) {
        console.warn(
          `[Performance] ${name} tardó ${this.loadTimes[name].duration.toFixed(
            2
          )}ms (>100ms puede causar bloqueos)`
        );
      }
    }
  }

  /**
   * Alterna la visibilidad del monitor de rendimiento
   */
  toggle() {
    this.isEnabled = !this.isEnabled;
    console.log(
      `Monitor de rendimiento: ${this.isEnabled ? "ACTIVADO" : "DESACTIVADO"}`
    );
  }

  /**
   * Alterna entre vista simple y detallada
   */
  toggleDetailed() {
    this.showDetailed = !this.showDetailed;
  }
}

export default PerformanceMonitor;

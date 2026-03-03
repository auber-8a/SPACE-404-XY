/**
 * Utilidades compartidas para UI - Reduce duplicación de código
 */
import { loader } from "../../engine/loader.js";

export const UIHelpers = {
  /**
   * Dibuja un rectángulo con esquinas redondeadas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho
   * @param {number} height - Alto
   * @param {number} radius - Radio de las esquinas
   * @param {string} fillColor - Color de relleno
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  /**
   * Renderiza un botón desde una imagen
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {string} imageName - Nombre de la imagen del botón
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {Object|null} Objeto con las propiedades del botón o null
   */
  renderButton(ctx, imageName, x, y) {
    const btn = loader.getImage(imageName);
    if (btn) {
      ctx.drawImage(btn, x, y);
      return { x, y, width: btn.width, height: btn.height };
    }
    return null;
  },

  /**
   * Renderiza un botón centrado horizontalmente
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {string} imageName - Nombre de la imagen del botón
   * @param {number} centerX - Coordenada X del centro
   * @param {number} y - Coordenada Y
   * @returns {Object|null} Objeto con las propiedades del botón o null
   */
  renderCenteredButton(ctx, imageName, centerX, y) {
    const btn = loader.getImage(imageName);
    if (btn) {
      const x = centerX - btn.width / 2;
      ctx.drawImage(btn, x, y);
      return { x, y, width: btn.width, height: btn.height };
    }
    return null;
  },

  /**
   * Verifica si un punto está dentro de un botón
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   * @param {Object} button - Botón a verificar
   * @returns {boolean} True si el punto está dentro
   */
  isPointInButton(x, y, button) {
    return (
      button &&
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    );
  },

  /**
   * Crea y dibuja un botón personalizado con gradiente
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {string} text - Texto del botón
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho
   * @param {number} height - Alto
   * @param {Object} colors - Colores del botón (start, end, border)
   * @returns {Object} Propiedades del botón creado
   */
  drawCustomButton(
    ctx,
    text,
    x,
    y,
    width,
    height,
    colors = {
      start: "rgba(60, 80, 140, 0.9)",
      end: "rgba(40, 60, 120, 0.9)",
      border: "#6af",
    }
  ) {
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(text, x + width / 2, y + height / 2 + 7);

    return { x, y, width, height };
  },

  /**
   * Dibuja un slider de volumen mejorado
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho
   * @param {number} height - Alto
   * @param {number} value - Valor actual (0-1)
   * @param {string} type - Tipo de slider ('volume' o 'contrast')
   */
  drawSlider(ctx, x, y, width, height, value, type = "volume") {
    const colors =
      type === "contrast"
        ? { progress: ["#fc0", "#fa0", "#f80"], border: "#fc0", handle: "#fa0" }
        : {
            progress: ["#5df", "#4bd", "#39c"],
            border: "#6ef",
            handle: "#4bd",
          };

    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    const bgGradient = ctx.createLinearGradient(x, y, x, y + height);
    bgGradient.addColorStop(0, "rgba(30, 30, 40, 0.9)");
    bgGradient.addColorStop(0.5, "rgba(20, 20, 30, 0.95)");
    bgGradient.addColorStop(1, "rgba(30, 30, 40, 0.9)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(x, y, width, height);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const fillWidth = width * value;
    if (fillWidth > 0) {
      const progressGradient = ctx.createLinearGradient(x, y, x, y + height);
      colors.progress.forEach((color, i) => {
        progressGradient.addColorStop(i / (colors.progress.length - 1), color);
      });
      ctx.fillStyle = progressGradient;
      ctx.fillRect(x, y, fillWidth, height);

      const shineGradient = ctx.createLinearGradient(x, y, x, y + height / 3);
      shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = shineGradient;
      ctx.fillRect(x, y, fillWidth, height / 3);
    }

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    this.drawSliderHandle(
      ctx,
      x + fillWidth,
      y + height / 2,
      14,
      colors.handle
    );

    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 3;
    ctx.fillStyle = type === "contrast" ? "#ffd700" : "#fff";
    ctx.font = "bold 16px system-ui";
    ctx.textAlign = "left";
    const percent =
      type === "contrast" ? Math.round(value * 200) : Math.round(value * 100);
    ctx.fillText(percent + "%", x + width + 12, y + height / 2 + 6);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },

  /**
   * Dibuja el mango del slider
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   * @param {number} radius - Radio del mango
   * @param {string} color - Color del mango
   */
  drawSliderHandle(ctx, x, y, radius, color) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const handleGradient = ctx.createRadialGradient(
      x - 3,
      y - 3,
      0,
      x,
      y,
      radius
    );
    handleGradient.addColorStop(0, "#fff");
    handleGradient.addColorStop(0.7, "#f0f0f0");
    handleGradient.addColorStop(1, "#d0d0d0");
    ctx.fillStyle = handleGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius - 5, 0, Math.PI * 2);
    ctx.stroke();

    const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, radius - 6);
    centerGradient.addColorStop(0, color === "#fa0" ? "#fc0" : "#6ef");
    centerGradient.addColorStop(1, color);
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius - 7, 0, Math.PI * 2);
    ctx.fill();
  },

  /**
   * Maneja la interacción con un slider
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @param {Object} slider - Slider a verificar
   * @param {Function} onUpdate - Callback al actualizar el valor
   * @returns {boolean} True si se interactúo con el slider
   */
  handleSliderInteraction(x, y, slider, onUpdate) {
    if (!slider || !slider.x) return false;

    const { x: sliderX, y: sliderY, width, height } = slider;
    if (
      x >= sliderX &&
      x <= sliderX + width &&
      y >= sliderY - 10 &&
      y <= sliderY + height + 10
    ) {
      const newValue = Math.max(0, Math.min(1, (x - sliderX) / width));
      if (onUpdate) onUpdate(newValue);
      return true;
    }
    return false;
  },

  /**
   * Aplica un filtro de contraste al canvas del juego
   * @param {number} contrastLevel - Nivel de contraste (0-2)
   */
  applyContrast(contrastLevel) {
    const canvas = document.getElementById("game");
    if (canvas) {
      canvas.style.filter = `contrast(${Math.round(contrastLevel * 100)}%)`;
    }
  },
};

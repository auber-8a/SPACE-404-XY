/**
 * Funciones de renderizado comunes para el juego
 */
export const RenderHelpers = {
  /**
   * Renderiza una barra de progreso o vida
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho de la barra
   * @param {number} height - Alto de la barra
   * @param {number} percentage - Porcentaje de relleno (0-100)
   * @param {string} bgColor - Color de fondo
   * @param {string} fillColor - Color de relleno
   * @param {string} borderColor - Color del borde
   * @param {string} label - Etiqueta opcional
   */
  drawProgressBar(
    ctx,
    x,
    y,
    width,
    height,
    percentage,
    bgColor,
    fillColor,
    borderColor,
    label
  ) {
    percentage = Math.max(0, Math.min(100, percentage));

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    const fillWidth = (width * percentage) / 100;
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, fillWidth, height);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    if (label) {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`${label}:`, x, y - 5);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px system-ui";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 3;
    ctx.fillText(
      `${Math.round(percentage)}%`,
      x + width / 2,
      y + height / 2 + 4
    );
    ctx.shadowBlur = 0;
  },

  /**
   * Renderiza una barra de vida sobre enemigos
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho de la barra
   * @param {number} height - Alto de la barra
   * @param {number} healthPercent - Porcentaje de vida (0-1)
   */
  renderHealthBar(ctx, x, y, width, height, healthPercent) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, y, width, height);

    let barColor;
    if (healthPercent > 0.6) {
      barColor = "#0f0";
    } else if (healthPercent > 0.3) {
      barColor = "#ff0";
    } else {
      barColor = "#f00";
    }

    const healthWidth = width * healthPercent;
    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, healthWidth, height);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
  },

  /**
   * Renderiza un overlay oscuro semi-transparente
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} canvasWidth - Ancho del canvas
   * @param {number} canvasHeight - Alto del canvas
   * @param {number} alpha - Transparencia (0-1, por defecto 0.5)
   */
  renderOverlay(ctx, canvasWidth, canvasHeight, alpha = 0.5) {
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  },

  /**
   * Renderiza un panel con esquinas redondeadas
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho del panel
   * @param {number} height - Alto del panel
   * @param {number} cornerRadius - Radio de las esquinas (por defecto 20)
   * @param {string} bgColor - Color de fondo (por defecto rgba(50, 50, 50, 0.95))
   */
  renderPanel(
    ctx,
    x,
    y,
    width,
    height,
    cornerRadius = 20,
    bgColor = "rgba(50, 50, 50, 0.95)"
  ) {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.arcTo(
      x + width,
      y + height,
      x + width - cornerRadius,
      y + height,
      cornerRadius
    );
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();
  },

  /**
   * Renderiza efecto de veneno/daño eléctrico
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho del efecto
   * @param {number} height - Alto del efecto
   */
  renderPoisonEffect(ctx, x, y, width, height) {
    ctx.save();

    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * pulse);
    gradient.addColorStop(0, "#a0f");
    gradient.addColorStop(0.4, "#80d");
    gradient.addColorStop(1, "rgba(128, 0, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 10, y - 10, width + 20, height + 20);

    const coreGradient = ctx.createLinearGradient(x, y, x + width, y + height);
    coreGradient.addColorStop(0, "#d0f");
    coreGradient.addColorStop(0.5, "#a0d");
    coreGradient.addColorStop(1, "#80c");
    ctx.fillStyle = coreGradient;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = "#f0f";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + offsetX, cy + offsetY);
      ctx.stroke();
    }

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
  },

  /**
   * Renderiza un escudo sobre un enemigo
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho
   * @param {number} height - Alto
   * @param {number} shieldHealth - Salud actual del escudo
   * @param {number} maxShieldHealth - Salud máxima del escudo
   */
  renderShield(ctx, x, y, width, height, shieldHealth, maxShieldHealth) {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const alpha = (shieldHealth / maxShieldHealth) * 0.6 + 0.2;
    const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;

    ctx.save();
    ctx.globalAlpha = alpha * pulse;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.7);
    gradient.addColorStop(0, "rgba(0, 150, 255, 0.3)");
    gradient.addColorStop(0.7, "rgba(0, 200, 255, 0.6)");
    gradient.addColorStop(1, "rgba(0, 255, 255, 0.8)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, width * 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#0ff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Renderiza un asteroide
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {Object} asteroid - Objeto del asteroide con propiedades de posición y rotación
   */
  renderAsteroid(ctx, asteroid) {
    ctx.save();
    ctx.translate(
      asteroid.x + asteroid.width / 2,
      asteroid.y + asteroid.height / 2
    );
    ctx.rotate(asteroid.rotation);

    ctx.fillStyle = "#5a4a3a";
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const variance = 0.7 + Math.random() * 0.3;
      const radius = (asteroid.width / 2) * variance;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#4a3a2a";
    ctx.beginPath();
    ctx.arc(
      -asteroid.width * 0.15,
      -asteroid.height * 0.1,
      asteroid.width * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      asteroid.width * 0.1,
      asteroid.height * 0.15,
      asteroid.width * 0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  },

  /**
   * Renderiza un indicador de veneno en el HUD
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} duration - Duración restante del efecto
   * @param {number} maxDuration - Duración máxima del efecto
   */
  renderPoisonIndicator(ctx, x, y, duration, maxDuration) {
    const alpha = Math.sin(Date.now() / 200) * 0.3 + 0.7;

    ctx.fillStyle = `rgba(160, 0, 255, ${alpha})`;
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("⚡ SISTEMAS DAÑADOS", x, y);

    const barWidth = 200;
    const barHeight = 8;
    const progress = duration / maxDuration;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, y + 5, barWidth, barHeight);

    const gradient = ctx.createLinearGradient(x, y + 5, x + barWidth, y + 5);
    gradient.addColorStop(0, "#d0f");
    gradient.addColorStop(0.5, "#a0d");
    gradient.addColorStop(1, "#80c");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y + 5, barWidth * progress, barHeight);

    ctx.strokeStyle = "#f0f";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y + 5, barWidth, barHeight);
  },

  /**
   * Renderiza una pantalla de carga
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {number} canvasWidth - Ancho del canvas
   * @param {number} canvasHeight - Alto del canvas
   * @param {number} levelNumber - Número del nivel
   * @param {number} progress - Progreso de carga (0-1)
   * @param {Image} fondoCarga - Imagen de fondo de carga
   */
  renderLoadingScreen(
    ctx,
    canvasWidth,
    canvasHeight,
    levelNumber,
    progress,
    fondoCarga
  ) {
    if (fondoCarga) {
      ctx.drawImage(fondoCarga, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = "#0f0f10";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);

    const time = Date.now() / 1000;
    ctx.rotate(time * 2);

    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((Math.PI * 2 * i) / 8);
      ctx.beginPath();
      ctx.arc(30, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(75, 187, 221, ${1 - i * 0.12})`;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    ctx.fillStyle = "#eee";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      `Cargando Nivel ${levelNumber}...`,
      canvasWidth / 2,
      canvasHeight / 2 + 80
    );

    const barWidth = 400;
    const barHeight = 20;
    const barX = (canvasWidth - barWidth) / 2;
    const barY = canvasHeight / 2 + 120;

    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "#4bd";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  },
};

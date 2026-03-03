import { loader } from "../../engine/loader.js";
import { UIHelpers } from "../utils/uiHelpers.js";

/**
 * Estado de pausa con submenús de configuración, controles y ajustes de audio
 */
class PauseState {
  /**
   * @param {HTMLCanvasElement} canvas - Canvas del juego
   * @param {Object} stateManager - Gestor de estados
   */
  constructor(canvas, stateManager) {
    this.canvas = canvas;
    this.stateManager = stateManager;
    this.backgroundState = null;
    this.previousState = "level1";
    this.subMenuState = null;

    this.panel = {
      x: 0,
      y: 0,
      width: 400,
      height: 450,
      cornerRadius: 20,
      backgroundColor: "rgba(50, 50, 50, 0.95)",
    };
    this.buttons = {
      reanudar: {},
      reiniciar: {},
      settings: {},
      menuPrincipal: {},
    };
    this.settingsButtons = {
      controles: {},
      musica: {},
      efectos_sonido: {},
      atras: {},
      hud: {},
    };
    this.settings = {
      difficulty: "medio",
      contrast: 1.0,
      music: true,
      soundEffects: true,
    };

    this.volumeSliders = {
      music: {
        x: 0,
        y: 0,
        width: 200,
        height: 20,
        handleRadius: 10,
        isDragging: false,
      },
      effects: {
        x: 0,
        y: 0,
        width: 200,
        height: 20,
        handleRadius: 10,
        isDragging: false,
      },
      contrast: {
        x: 0,
        y: 0,
        width: 200,
        height: 20,
        handleRadius: 10,
        isDragging: false,
      },
    };
  }

  /**
   * Establece el estado que está siendo pausado para mostrarlo de fondo
   * @param {Object} state - Estado a pausar
   * @param {string} stateName - Nombre del estado
   */
  setBackgroundState(state, stateName) {
    this.backgroundState = state;
    this.previousState = stateName;
  }

  /**
   * Inicializa el estado y carga la configuración de audio actual
   */
  enter() {
    console.log("Juego pausado");
    if (!this.subMenuState) {
      this.subMenuState = null;
    }
    this.menuMusic = document.getElementById("menuMusic");
    this.gameMusic = document.getElementById("gameMusic");

    const activeMusic =
      this.gameMusic && !this.gameMusic.paused
        ? this.gameMusic
        : this.menuMusic;

    if (activeMusic) {
      this.settings.music = !activeMusic.muted;
      this.settings.musicVolume = activeMusic.volume;
    }
    if (window.gameConfig) {
      Object.assign(this.settings, {
        soundEffects: window.gameConfig.soundEffectsEnabled,
        effectsVolume: window.gameConfig.effectsVolume,
        contrast: window.gameConfig.contrast,
      });
    }
  }

  /**
   * Actualiza la lógica del estado
   * @param {number} dt - Delta time en segundos
   */
  update(dt) {}

  /**
   * Renderiza el menú de pausa con el juego de fondo
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  render(ctx) {
    if (this.backgroundState && this.backgroundState.render) {
      this.backgroundState.render(ctx);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.subMenuState === "settings") {
      this.renderSettingsMenu(ctx);
    } else if (this.subMenuState === "controls") {
      this.renderControlsMenu(ctx);
    } else {
      this.renderPauseMenu(ctx);
    }
  }

  /**
   * Renderiza un botón centrado en el menú de pausa
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {string} imageName - Nombre de la imagen del botón
   * @param {number} centerX - Posición X del centro
   * @param {number} y - Posición Y
   * @param {string} buttonKey - Clave del botón en el objeto buttons
   */
  renderButton(ctx, imageName, centerX, y, buttonKey) {
    const result = UIHelpers.renderCenteredButton(ctx, imageName, centerX, y);
    if (result) this.buttons[buttonKey] = result;
  }

  /**
   * Renderiza un botón centrado en el menú de configuración
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   * @param {string} imageName - Nombre de la imagen del botón
   * @param {number} centerX - Posición X del centro
   * @param {number} y - Posición Y
   * @param {string} buttonKey - Clave del botón en el objeto settingsButtons
   */
  renderSettingsButton(ctx, imageName, centerX, y, buttonKey) {
    const result = UIHelpers.renderCenteredButton(ctx, imageName, centerX, y);
    if (result) this.settingsButtons[buttonKey] = result;
  }

  /**
   * Renderiza el menú principal de pausa
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  renderPauseMenu(ctx) {
    this.panel.x = (this.canvas.width - this.panel.width) / 2;
    this.panel.y = (this.canvas.height - this.panel.height) / 2;

    UIHelpers.drawRoundedRect(
      ctx,
      this.panel.x,
      this.panel.y,
      this.panel.width,
      this.panel.height,
      this.panel.cornerRadius,
      this.panel.backgroundColor
    );

    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("PAUSA", this.canvas.width / 2, this.panel.y + 70);

    const centerX = this.canvas.width / 2;
    const startY = this.panel.y + 75;
    const spacing = 80;

    ["reanudar", "reiniciar", "settings", "menu_principal"].forEach(
      (name, i) => {
        const key = name === "menu_principal" ? "menuPrincipal" : name;
        this.renderButton(ctx, name, centerX, startY + spacing * i, key);
      }
    );

    ctx.fillStyle = "#aaa";
    ctx.font = "16px system-ui";
    ctx.fillText(
      "Presiona ESC para reanudar",
      this.canvas.width / 2,
      this.panel.y + this.panel.height - 20
    );
  }

  /**
   * Renderiza el menú de configuración con controles de audio y contraste
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  renderSettingsMenu(ctx) {
    const panel = {
      x: (this.canvas.width - 700) / 2,
      y: (this.canvas.height - 450) / 2,
      width: 700,
      height: 450,
    };

    UIHelpers.drawRoundedRect(
      ctx,
      panel.x,
      panel.y,
      panel.width,
      panel.height,
      this.panel.cornerRadius,
      this.panel.backgroundColor
    );

    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("CONFIGURACIÓN", this.canvas.width / 2, panel.y + 50);

    const centerX = this.canvas.width / 2 - 110;
    const startY = panel.y + 80;
    const spacing = 85;

    this.renderSettingsButton(ctx, "controles", centerX, startY, "controles");

    const musicBtn = loader.getImage("musica");
    if (musicBtn) {
      const btnX = centerX - musicBtn.width / 2;
      const btnY = startY + spacing;
      ctx.drawImage(musicBtn, btnX, btnY);
      this.settingsButtons.musica = {
        x: btnX,
        y: btnY,
        width: musicBtn.width,
        height: musicBtn.height,
      };

      ctx.font = "18px system-ui";
      ctx.textAlign = "left";
      ctx.fillStyle = this.settings.music ? "#00ff00" : "#ff0000";
      ctx.fillText(
        this.settings.music ? "ENCENDIDO" : "APAGADO",
        btnX + musicBtn.width + 35,
        btnY + 30
      );

      if (this.settings.music) {
        const sliderX = btnX + musicBtn.width + 35,
          sliderY = btnY + 45;
        this.volumeSliders.music = {
          x: sliderX,
          y: sliderY,
          width: 200,
          height: 20,
        };
        UIHelpers.drawSlider(
          ctx,
          sliderX,
          sliderY,
          200,
          20,
          this.settings.musicVolume,
          "volume"
        );
      }
    }

    const efectosBtn = loader.getImage("efectos_sonido");
    if (efectosBtn) {
      const btnX = centerX - efectosBtn.width / 2;
      const btnY = startY + spacing * 2;
      ctx.drawImage(efectosBtn, btnX, btnY);
      this.settingsButtons.efectos_sonido = {
        x: btnX,
        y: btnY,
        width: efectosBtn.width,
        height: efectosBtn.height,
      };

      ctx.font = "18px system-ui";
      ctx.fillStyle = this.settings.soundEffects ? "#00ff00" : "#ff0000";
      ctx.fillText(
        this.settings.soundEffects ? "ENCENDIDO" : "APAGADO",
        btnX + efectosBtn.width + 20,
        btnY + 30
      );

      if (this.settings.soundEffects) {
        const sliderX = btnX + efectosBtn.width + 20,
          sliderY = btnY + 50;
        this.volumeSliders.effects = {
          x: sliderX,
          y: sliderY,
          width: 200,
          height: 20,
        };
        UIHelpers.drawSlider(
          ctx,
          sliderX,
          sliderY,
          200,
          20,
          this.settings.effectsVolume,
          "volume"
        );
      }
    }

    const rightColX = this.canvas.width / 2 + 100;
    ctx.font = "bold 24px system-ui";
    ctx.fillStyle = "#fff";
    ctx.fillText("Contraste", rightColX - 27, startY + 20);
    const contrastSliderX = rightColX - 25,
      contrastSliderY = startY + 40;
    this.volumeSliders.contrast = {
      x: contrastSliderX,
      y: contrastSliderY,
      width: 200,
      height: 20,
    };
    UIHelpers.drawSlider(
      ctx,
      contrastSliderX,
      contrastSliderY,
      200,
      20,
      (this.settings.contrast - 0.0) / 2.0,
      "contrast"
    );

    const bottomY = startY + spacing * 3;
    const hudYPosition = startY + spacing * 3 + 15;
    const btnSpacing = 20;

    const atrasBtn = loader.getImage("atras");
    const hudBtnWidth = 150;
    const hudBtnHeight = 50;
    const totalWidth =
      (atrasBtn ? atrasBtn.width : 150) + btnSpacing + hudBtnWidth;
    const startX = (this.canvas.width - totalWidth) / 2;

    if (atrasBtn) {
      const atrasX = startX;
      ctx.drawImage(atrasBtn, atrasX, bottomY);
      this.settingsButtons.atras = {
        x: atrasX,
        y: bottomY,
        width: atrasBtn.width,
        height: atrasBtn.height,
      };
    }

    const hudX = startX + (atrasBtn ? atrasBtn.width : 150) + btnSpacing + 50;
    this.settingsButtons.hud = UIHelpers.drawCustomButton(
      ctx,
      "HUD",
      hudX,
      hudYPosition,
      hudBtnWidth,
      hudBtnHeight
    );

    console.log("Botón HUD renderizado en:", this.settingsButtons.hud);

    ctx.fillStyle = "#aaa";
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Presiona ESC para volver al menú de pausa",
      this.canvas.width / 2,
      panel.y + panel.height - 15
    );
  }

  /**
   * Renderiza el menú de controles con documentación visual
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado
   */
  renderControlsMenu(ctx) {
    const controlsPanel = {
      x: (this.canvas.width - 700) / 2,
      y: (this.canvas.height - 500) / 2,
      width: 700,
      height: 500,
    };

    UIHelpers.drawRoundedRect(
      ctx,
      controlsPanel.x,
      controlsPanel.y,
      controlsPanel.width,
      controlsPanel.height,
      this.panel.cornerRadius,
      this.panel.backgroundColor
    );

    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("CONTROLES", this.canvas.width / 2, controlsPanel.y + 50);

    const controlesDoc = loader.getImage("controles_doc");
    if (controlesDoc) {
      const maxWidth = controlsPanel.width - 80;
      const maxHeight = controlsPanel.height - 180;

      let imgWidth = controlesDoc.width;
      let imgHeight = controlesDoc.height;

      if (imgWidth > maxWidth || imgHeight > maxHeight) {
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        imgWidth *= scale;
        imgHeight *= scale;
      }

      const imgX = (this.canvas.width - imgWidth) / 2;
      const imgY = controlsPanel.y + 60;

      ctx.drawImage(controlesDoc, imgX, imgY, imgWidth, imgHeight);
    }

    const atrasBtn = loader.getImage("atras");
    if (atrasBtn) {
      const btnX = this.canvas.width / 2 - atrasBtn.width / 2;
      const btnY =
        controlsPanel.y + controlsPanel.height - atrasBtn.height - 20;
      ctx.drawImage(atrasBtn, btnX, btnY);

      this.settingsButtons.atras = {
        x: btnX,
        y: btnY,
        width: atrasBtn.width,
        height: atrasBtn.height,
      };
    }

    ctx.fillStyle = "#aaa";
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Presiona ESC para volver",
      this.canvas.width / 2,
      controlsPanel.y + controlsPanel.height - 5
    );
  }

  /**
   * Limpia el estado al salir
   */
  exit() {
    console.log("Saliendo del menú de pausa");
  }

  /**
   * Maneja los clics en los botones según el submenú activo
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción ejecutada o null
   */
  handleClick(x, y) {
    if (this.subMenuState === "controls") return this.handleControlsClick(x, y);
    if (this.subMenuState === "settings") {
      if (this.handleSliderClick(x, y)) return "slider";
      return this.handleSettingsClick(x, y);
    }

    const actions = {
      reanudar: () => {
        console.log("Reanudando juego");
        this.stateManager.setState(this.previousState);
      },
      reiniciar: () => {
        console.log("Reiniciando nivel");
        if (this.backgroundState?.restart) this.backgroundState.restart();
        this.stateManager.setState(this.previousState);
      },
      settings: () => {
        console.log("Abriendo configuración desde pausa");
        this.subMenuState = "settings";
      },
      menuPrincipal: () => {
        console.log("Regresando al menú principal");
        if (this.backgroundState?.restart) this.backgroundState.restart();
        this.stateManager.setState("menu");
      },
    };

    for (const [key, action] of Object.entries(actions)) {
      if (UIHelpers.isPointInButton(x, y, this.buttons[key])) {
        action();
        return key;
      }
    }
    return null;
  }

  /**
   * Maneja los clics en el menú de controles
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción ejecutada o null
   */
  handleControlsClick(x, y) {
    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.atras)) {
      console.log("Regresando al menú de configuración");
      this.subMenuState = "settings";
      return "atras";
    }
    return null;
  }

  /**
   * Maneja los clics en el menú de configuración
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} Acción ejecutada o null
   */
  handleSettingsClick(x, y) {
    console.log("Click en settings en posición:", x, y);

    if (this.settingsButtons.hud) {
      console.log("Verificando botón HUD:", this.settingsButtons.hud);
      console.log(
        `¿Click dentro de HUD? x: ${x} >= ${
          this.settingsButtons.hud.x
        } && ${x} <= ${
          this.settingsButtons.hud.x + this.settingsButtons.hud.width
        }`
      );
      console.log(
        `y: ${y} >= ${this.settingsButtons.hud.y} && ${y} <= ${
          this.settingsButtons.hud.y + this.settingsButtons.hud.height
        }`
      );
    }

    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.atras)) {
      console.log("Regresando al menú de pausa");
      this.subMenuState = null;
      return "atras";
    }

    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.hud)) {
      console.log("¡Clic en botón HUD detectado!");
      const hudConfigState = this.stateManager.states["hudConfig"];
      if (hudConfigState && hudConfigState.enter) {
        console.log(
          "Estado hudConfig encontrado, configurando previousState..."
        );
        // Establecer un estado especial para que HUD sepa que debe regresar a pause/settings
        hudConfigState.previousState = "pause-settings";
        hudConfigState.pauseStateRef = this;
      } else {
        console.error("Estado hudConfig NO encontrado");
      }
      this.stateManager.setState("hudConfig");
      return "hud";
    }

    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.controles)) {
      console.log("Mostrando controles");
      this.subMenuState = "controls";
      return "controles";
    }

    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.musica)) {
      this.settings.music = !this.settings.music;
      console.log(`Música: ${this.settings.music ? "Encendida" : "Apagada"}`);

      const activeMusic =
        this.gameMusic && !this.gameMusic.paused
          ? this.gameMusic
          : this.menuMusic;
      if (activeMusic) {
        activeMusic.muted = !this.settings.music;
        if (this.settings.music && activeMusic.paused) {
          activeMusic
            .play()
            .catch((err) => console.log("Error reproduciendo música:", err));
        }
      }
      if (this.menuMusic) this.menuMusic.muted = !this.settings.music;
      if (this.gameMusic) this.gameMusic.muted = !this.settings.music;
      return "musica";
    }

    if (UIHelpers.isPointInButton(x, y, this.settingsButtons.efectos_sonido)) {
      this.settings.soundEffects = !this.settings.soundEffects;
      console.log(
        `Efectos: ${this.settings.soundEffects ? "Encendidos" : "Apagados"}`
      );

      if (window.gameConfig)
        window.gameConfig.soundEffectsEnabled = this.settings.soundEffects;
      if (this.settings.soundEffects && window.playSoundEffect)
        window.playSoundEffect("laserSound");
      return "efectos_sonido";
    }

    return null;
  }

  /**
   * Maneja los clics en los sliders de volumen y contraste
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {boolean} True si se hizo clic en un slider
   */
  handleSliderClick(x, y) {
    if (
      this.settings.music &&
      UIHelpers.handleSliderInteraction(
        x,
        y,
        this.volumeSliders.music,
        (val) => {
          this.volumeSliders.music.isDragging = true;
          this.settings.musicVolume = val;
          const activeMusic =
            this.gameMusic && !this.gameMusic.paused
              ? this.gameMusic
              : this.menuMusic;
          if (activeMusic) activeMusic.volume = val;
          if (this.menuMusic) this.menuMusic.volume = val;
          if (this.gameMusic) this.gameMusic.volume = val;
        }
      )
    )
      return true;

    if (
      this.settings.soundEffects &&
      UIHelpers.handleSliderInteraction(
        x,
        y,
        this.volumeSliders.effects,
        (val) => {
          this.volumeSliders.effects.isDragging = true;
          this.settings.effectsVolume = val;
          if (window.gameConfig) window.gameConfig.effectsVolume = val;
        }
      )
    )
      return true;

    if (
      UIHelpers.handleSliderInteraction(
        x,
        y,
        this.volumeSliders.contrast,
        (val) => {
          this.volumeSliders.contrast.isDragging = true;
          this.settings.contrast = val * 2.0;
          UIHelpers.applyContrast(this.settings.contrast);
          if (window.gameConfig)
            window.gameConfig.contrast = this.settings.contrast;
        }
      )
    )
      return true;

    return false;
  }

  /**
   * Maneja el movimiento del mouse para arrastre fluido de sliders
   * @param {number} x - Coordenada X del mouse
   * @param {number} y - Coordenada Y del mouse
   */
  handleMouseMove(x, y) {
    if (this.subMenuState !== "settings") return;

    if (this.volumeSliders.music.isDragging) {
      const musicSlider = this.volumeSliders.music;
      const newVolume = Math.max(
        0,
        Math.min(1, (x - musicSlider.x) / musicSlider.width)
      );
      this.settings.musicVolume = newVolume;

      const activeMusic =
        this.gameMusic && !this.gameMusic.paused
          ? this.gameMusic
          : this.menuMusic;
      if (activeMusic) activeMusic.volume = newVolume;
      if (this.menuMusic) this.menuMusic.volume = newVolume;
      if (this.gameMusic) this.gameMusic.volume = newVolume;
    }

    if (this.volumeSliders.effects.isDragging) {
      const effectsSlider = this.volumeSliders.effects;
      const newVolume = Math.max(
        0,
        Math.min(1, (x - effectsSlider.x) / effectsSlider.width)
      );
      this.settings.effectsVolume = newVolume;

      if (window.gameConfig) {
        window.gameConfig.effectsVolume = newVolume;
      }
    }

    if (this.volumeSliders.contrast.isDragging) {
      const contrastSlider = this.volumeSliders.contrast;
      const newValue = Math.max(
        0,
        Math.min(1, (x - contrastSlider.x) / contrastSlider.width)
      );
      this.settings.contrast = newValue * 2.0;

      this.applyContrast(this.settings.contrast);

      if (window.gameConfig) {
        window.gameConfig.contrast = this.settings.contrast;
      }
    }
  }

  /**
   * Maneja la liberación del botón del mouse para detener arrastre de sliders
   */
  handleMouseUp() {
    this.volumeSliders.music.isDragging = false;
    this.volumeSliders.effects.isDragging = false;
    this.volumeSliders.contrast.isDragging = false;
  }

  /**
   * Maneja las teclas presionadas para navegación entre submenús
   * @param {string} key - Tecla presionada
   */
  handleKeyDown(key) {
    if (key === "Escape") {
      if (this.subMenuState === "controls") {
        console.log("Regresando al menú de configuración");
        this.subMenuState = "settings";
      } else if (this.subMenuState === "settings") {
        console.log("Regresando al menú de pausa");
        this.subMenuState = null;
      } else {
        console.log("Reanudando juego");
        this.stateManager.setState(this.previousState);
      }
    }
  }
}

export default PauseState;

/**
 * @fileoverview Punto de entrada principal del juego SPACE 404 XY
 * Inicializa el canvas, el gestor de estados, los event listeners y el game loop
 * @author Bautista Alexis - Ochoa Aubertin
 */

import { loader } from "./engine/loader.js";
import StateManager from "./engine/stateManager.js";
import PerformanceMonitor from "./game/utils/performanceMonitor.js";
import { audioManager } from "./game/utils/audioManager.js";
import LoadingState from "./game/states/loadingState.js";
import MenuState from "./game/states/menuState.js";
import LevelSelectState from "./game/states/levelSelectState.js";
import SettingsState from "./game/states/settingsState.js";
import ControlsState from "./game/states/controlsState.js";
import Level1State from "./game/states/level1State.js";
import Level2State from "./game/states/level2State.js";
import Level3State from "./game/states/level3State.js";
import PauseState from "./game/states/pauseState.js";
import GameOverState from "./game/states/gameOverState.js";
import LevelCompleteState from "./game/states/levelCompleteState.js";
import HudConfigState from "./game/states/hudConfigState.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let last = 0;

// Mejoras para touch y rendimiento en móviles
canvas.style.touchAction = 'none';
canvas.style.webkitTapHighlightColor = 'transparent';
canvas.style.userSelect = 'none';
const performanceMonitor = new PerformanceMonitor();
window.performanceMonitor = performanceMonitor;
// Ocultar el monitor de FPS por defecto (se puede activar con F3)
performanceMonitor.isEnabled = false;

// Marcas temporales para depurar toques en dispositivos móviles
const touchMarkers = [];

function addTouchMarker(x, y) {
  touchMarkers.push({ x, y, t: performance.now() });
  // mantener solo los últimos 10
  if (touchMarkers.length > 10) touchMarkers.shift();
}

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;

/**
 * Ajusta el tamaño del canvas: mantiene dimensiones lógicas (960x540) para que
 * los estados puedan calcular correctamente botones y elementos.
 * CSS maneja el escalado visual (viewport 100vw/100vh).
 */
function resizeCanvas() {
  // Mantener dimensiones lógicas del juego (los estados las usan para botones, etc.)
  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  // No escalar el contexto: el CSS maneja el tamaño visual
  // ctx.setTransform es identidad por defecto, así que no lo tocamos
  ctx.imageSmoothingEnabled = false;  // Pixelart nítido en móviles
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

/**
 * Configuración global del juego
 * @property {boolean} soundEffectsEnabled - Efectos de sonido activados
 * @property {boolean} musicEnabled - Música activada
 * @property {number} effectsVolume - Volumen de efectos (0.0 a 1.0)
 * @property {number} contrast - Nivel de contraste (0.0 a 2.0)
 */
window.gameConfig = {
  soundEffectsEnabled: true,
  musicEnabled: true,
  effectsVolume: 0.3,
  contrast: 1.0,
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

/**
 * Genera y reproduce un sonido láser usando Web Audio API
 */
function playGeneratedLaserSound() {
  const duration = 0.15;
  const startFrequency = 1200;
  const endFrequency = 200;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(startFrequency, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    endFrequency,
    audioContext.currentTime + duration
  );

  const volume = window.gameConfig.effectsVolume || 0.3;
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Reproduce un efecto de sonido por su ID
 * @param {string} soundId - ID del elemento de audio o "laserSound" para sonido generado
 */
window.playSoundEffect = function (soundId) {
  if (!window.gameConfig.soundEffectsEnabled) {
    return;
  }

  if (soundId === "laserSound") {
    playGeneratedLaserSound();
    return;
  }

  const sound = document.getElementById(soundId);
  if (sound) {
    sound.currentTime = 0;
    const volume = window.gameConfig.effectsVolume || 0.3;
    sound.volume = volume;
    sound.play().catch((err) => {
      console.log("Error reproduciendo efecto de sonido:", err);
    });
  }
};

const stateManager = new StateManager();

const loadingState = new LoadingState(canvas);
const menuState = new MenuState(canvas, stateManager);
const levelSelectState = new LevelSelectState(canvas, stateManager);
const settingsState = new SettingsState(canvas, stateManager);
const controlsState = new ControlsState(canvas, stateManager);
const level1State = new Level1State(canvas, stateManager);
const level2State = new Level2State(canvas, stateManager);
const level3State = new Level3State(canvas, stateManager);
const pauseState = new PauseState(canvas, stateManager);
const gameOverState = new GameOverState(canvas, stateManager);
const levelCompleteState = new LevelCompleteState(canvas, stateManager);
const hudConfigState = new HudConfigState(canvas, stateManager);

stateManager.addState("loading", loadingState);
stateManager.addState("menu", menuState);
stateManager.addState("levelSelect", levelSelectState);
stateManager.addState("settings", settingsState);
stateManager.addState("controls", controlsState);
stateManager.addState("level1", level1State);
stateManager.addState("level2", level2State);
stateManager.addState("level3", level3State);
stateManager.addState("pause", pauseState);
stateManager.addState("gameOver", gameOverState);
stateManager.addState("levelComplete", levelCompleteState);
stateManager.addState("hudConfig", hudConfigState);

stateManager.setState("loading");

audioManager.initialize();
console.log("AudioManager inicializado");

/**
 * Carga todos los assets del juego (imágenes)
 */
async function loadAssets() {
  try {
    await loader.loadImages({
      titulo: "assets/images/icons/titulo.png",
      fondo_carga: "assets/images/fondos/fondo_pantalla_carga.jpg",
      fondo_desenfocado: "assets/images/fondos/fondo_pantalla_desenfocado.jpg",
      play: "assets/images/icons/play.png",
      settings: "assets/images/icons/settings.png",
      sound: "assets/images/icons/sound.png",
      back: "assets/images/icons/back.png",
      atras: "assets/images/icons/atras.png",
      menu: "assets/images/icons/menu.png",
      nivel1: "assets/images/icons/nivel1.jpg",
      nivel2: "assets/images/icons/nivel2.jpg",
      nivel3: "assets/images/icons/nivel3.jpg",
      controles: "assets/images/icons/controles.png",
      dificultad: "assets/images/icons/dificultad.png",
      musica: "assets/images/icons/musica.png",
      efectos_sonido: "assets/images/icons/efectos_sonido.png",
      controles_doc: "assets/images/icons/controles_doc.png",
      reanudar: "assets/images/icons/reanudar.png",
      reiniciar: "assets/images/icons/reiniciar.png",
      menu_principal: "assets/images/icons/menu_principal.png",
      siguiente_nivel: "assets/images/icons/siguiente_nivel.png",
    });
    console.log("Assets cargados correctamente");

    stateManager.setState("menu");
  } catch (error) {
    console.error("Error cargando assets:", error);
  }
}

/**
 * Game loop principal - actualiza y renderiza el juego
 * @param {number} ts - Timestamp en milisegundos
 */
function loop(ts) {
  const dt = (ts - last) / 1000;
  last = ts;

  performanceMonitor.update(ts);
  stateManager.update(dt);

  // Limpiamos usando las coordenadas lógicas del juego (BASE_WIDTH x BASE_HEIGHT)
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  stateManager.render(ctx);
  performanceMonitor.render(ctx);

  // Render de marcas de toque (fade out)
  const now = performance.now();
  for (let i = touchMarkers.length - 1; i >= 0; i--) {
    const m = touchMarkers[i];
    const age = now - m.t;
    if (age > 600) {
      touchMarkers.splice(i, 1);
      continue;
    }
    const alpha = 1 - age / 600;
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,0,0,${alpha})`;
    ctx.arc(m.x, m.y, 12 * alpha, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(loop);
}

// Pointer events (reemplazan mouse+touch en la mayoría de dispositivos)
canvas.addEventListener(
  "pointerdown",
  (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const currentState = stateManager.getCurrentState();
    if (currentState && currentState.handleClick) {
      currentState.handleClick(x, y);
    }
    // Depuración visual y log
    try {
      addTouchMarker(x, y);
      console.log("TOUCH", { state: currentState?.constructor?.name, x, y });
    } catch (e) {}
    // Intentar capturar el pointer para seguir recibiendo eventos aunque salga del canvas
    try {
      if (event.pointerId && event.target && event.target.setPointerCapture) {
        event.target.setPointerCapture(event.pointerId);
      }
    } catch (e) {
      // algunos navegadores pueden lanzar si no es soportado
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "pointermove",
  (event) => {
    // Si no hay movimiento principal, ignorar
    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const currentState = stateManager.getCurrentState();
    if (currentState && currentState.handleMouseMove) {
      currentState.handleMouseMove(x, y);
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "pointerup",
  (event) => {
    const currentState = stateManager.getCurrentState();
    if (currentState && currentState.handleMouseUp) {
      currentState.handleMouseUp();
    }
    try {
      if (event.pointerId && event.target && event.target.releasePointerCapture) {
        event.target.releasePointerCapture(event.pointerId);
      }
    } catch (e) {}
  },
  { passive: false }
);

// pointercancel: tratar como pointerup y liberar captura
canvas.addEventListener(
  "pointercancel",
  (event) => {
    const currentState = stateManager.getCurrentState();
    if (currentState && currentState.handleMouseUp) {
      currentState.handleMouseUp();
    }
    try {
      if (event.pointerId && event.target && event.target.releasePointerCapture) {
        event.target.releasePointerCapture(event.pointerId);
      }
    } catch (e) {}
  },
  { passive: false }
);

document.addEventListener("keydown", (event) => {
  if (event.key === "F3") {
    event.preventDefault();
    performanceMonitor.toggle();
  } else if (event.key === "F4") {
    event.preventDefault();
    performanceMonitor.toggleDetailed();
  } else if (event.key === "F5" && event.ctrlKey) {
    event.preventDefault();
    performanceMonitor.printReport();
  }

  const currentState = stateManager.getCurrentState();
  if (currentState && currentState.handleKeyDown) {
    currentState.handleKeyDown(event.key);
  }
});

document.addEventListener("keyup", (event) => {
  const currentState = stateManager.getCurrentState();
  if (currentState && currentState.handleKeyUp) {
    currentState.handleKeyUp(event.key);
  }
});

// Sólo registrar touch handlers si el navegador NO soporta Pointer Events
if (!window.PointerEvent) {
  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      const touchId = touch.identifier;

      const currentState = stateManager.getCurrentState();
      if (currentState && currentState.handleTouchStart) {
        currentState.handleTouchStart(x, y, touchId);
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = BASE_WIDTH / rect.width;
    const scaleY = BASE_HEIGHT / rect.height;

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      const touchId = touch.identifier;

      const currentState = stateManager.getCurrentState();
      if (currentState && currentState.handleTouchMove) {
        currentState.handleTouchMove(x, y, touchId);
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchend", (event) => {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchId = touch.identifier;

      const currentState = stateManager.getCurrentState();
      if (currentState && currentState.handleTouchEnd) {
        currentState.handleTouchEnd(touchId);
      }
    }
  }, { passive: false });

  canvas.addEventListener("touchcancel", (event) => {
    event.preventDefault();

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      const touchId = touch.identifier;

      const currentState = stateManager.getCurrentState();
      if (currentState && currentState.handleTouchEnd) {
        currentState.handleTouchEnd(touchId);
      }
    }
  }, { passive: false });
}

loadAssets();
requestAnimationFrame(loop);

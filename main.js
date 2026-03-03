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

const performanceMonitor = new PerformanceMonitor();
window.performanceMonitor = performanceMonitor;

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;
let canvasScale = 1;

/**
 * Ajusta el tamaño del canvas manteniendo la proporción 16:9
 */
function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / BASE_WIDTH;
  const scaleY = windowHeight / BASE_HEIGHT;
  canvasScale = Math.min(scaleX, scaleY);

  canvas.width = BASE_WIDTH;
  canvas.height = BASE_HEIGHT;

  canvas.style.width = BASE_WIDTH * canvasScale + "px";
  canvas.style.height = BASE_HEIGHT * canvasScale + "px";
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stateManager.render(ctx);
  performanceMonitor.render(ctx);

  requestAnimationFrame(loop);
}

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();

  const scaleX = BASE_WIDTH / rect.width;
  const scaleY = BASE_HEIGHT / rect.height;

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  const currentState = stateManager.getCurrentState();
  if (currentState && currentState.handleClick) {
    currentState.handleClick(x, y);
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();

  const scaleX = BASE_WIDTH / rect.width;
  const scaleY = BASE_HEIGHT / rect.height;

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  const currentState = stateManager.getCurrentState();
  if (currentState && currentState.handleMouseMove) {
    currentState.handleMouseMove(x, y);
  }
});

canvas.addEventListener("mouseup", () => {
  const currentState = stateManager.getCurrentState();
  if (currentState && currentState.handleMouseUp) {
    currentState.handleMouseUp();
  }
});

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
});

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
});

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
});

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
});

loadAssets();
requestAnimationFrame(loop);

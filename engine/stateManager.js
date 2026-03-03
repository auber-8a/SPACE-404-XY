/**
 * Sistema de gestión de estados del juego
 * Maneja transiciones entre diferentes estados como menú, juego, pausa, gameover
 */

/**
 * Gestor de estados que controla el flujo de la aplicación
 * @class StateManager
 */
class StateManager {
  constructor() {
    /** @type {Object.<string, Object>} Mapa de estados registrados */
    this.states = {};
    /** @type {Object|null} Estado actualmente ejecutándose */
    this.currentState = null;
  }

  /**
   * Registra un nuevo estado en el gestor
   * @param {string} name - Nombre identificador del estado
   * @param {Object} state - Objeto del estado con métodos enter, update, render, exit
   */
  addState(name, state) {
    this.states[name] = state;
  }

  /**
   * Cambia al estado especificado, ejecutando exit del estado actual y enter del nuevo
   * @param {string} name - Nombre del estado al que cambiar
   */
  setState(name) {
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    this.currentState = this.states[name];

    if (this.currentState && this.currentState.enter) {
      this.currentState.enter();
    }
  }

  /**
   * Actualiza la lógica del estado actual
   * @param {number} dt - Delta time en segundos desde el último frame
   */
  update(dt) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(dt);
    }
  }

  /**
   * Renderiza el estado actual en el canvas
   * @param {CanvasRenderingContext2D} ctx - Contexto 2D del canvas
   */
  render(ctx) {
    if (this.currentState && this.currentState.render) {
      this.currentState.render(ctx);
    }
  }

  /**
   * Obtiene el estado actualmente activo
   * @returns {Object|null} El estado actual o null si no hay ninguno
   */
  getCurrentState() {
    return this.currentState;
  }
}

export default StateManager;

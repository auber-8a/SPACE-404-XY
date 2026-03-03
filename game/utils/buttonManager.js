/**
 * Gestor de botones reutilizable para todas las pantallas del juego
 */
class ButtonManager {
  constructor() {
    this.buttons = new Map();
  }

  /**
   * Registra un nuevo botón con su posición y callback
   * @param {string} id - Identificador único del botón
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho del botón
   * @param {number} height - Alto del botón
   * @param {Function|null} onClick - Callback a ejecutar al hacer clic
   * @returns {Object} El botón registrado
   */
  registerButton(id, x, y, width, height, onClick = null) {
    const button = { id, x, y, width, height, onClick };
    this.buttons.set(id, button);
    return button;
  }

  /**
   * Actualiza la posición y dimensiones de un botón existente
   * @param {string} id - Identificador del botón
   * @param {number} x - Nueva coordenada X
   * @param {number} y - Nueva coordenada Y
   * @param {number} width - Nuevo ancho
   * @param {number} height - Nuevo alto
   */
  updateButton(id, x, y, width, height) {
    const button = this.buttons.get(id);
    if (button) {
      button.x = x;
      button.y = y;
      button.width = width;
      button.height = height;
    }
  }

  /**
   * Maneja un clic y determina qué botón fue presionado
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|null} ID del botón clicado o null
   */
  handleClick(x, y) {
    for (const button of this.buttons.values()) {
      if (this.isPointInButton(x, y, button)) {
        if (button.onClick) {
          button.onClick();
        }
        return button.id;
      }
    }
    return null;
  }

  /**
   * Verifica si un punto está dentro de un botón
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   * @param {Object} button - Botón a verificar
   * @returns {boolean} True si el punto está dentro del botón
   */
  isPointInButton(x, y, button) {
    return (
      button &&
      x >= button.x &&
      x <= button.x + button.width &&
      y >= button.y &&
      y <= button.y + button.height
    );
  }

  /**
   * Obtiene un botón por su ID
   * @param {string} id - Identificador del botón
   * @returns {Object|undefined} El botón encontrado
   */
  getButton(id) {
    return this.buttons.get(id);
  }

  /**
   * Limpia todos los botones registrados
   */
  clear() {
    this.buttons.clear();
  }

  /**
   * Verifica si existe un botón con el ID especificado
   * @param {string} id - Identificador del botón
   * @returns {boolean} True si el botón existe
   */
  hasButton(id) {
    return this.buttons.has(id);
  }
}

export default ButtonManager;

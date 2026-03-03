/**
 * Gestor de sliders reutilizable para controles de volumen y ajustes
 */
class SliderManager {
  constructor() {
    this.sliders = new Map();
  }

  /**
   * Crea un nuevo slider
   * @param {string} id - Identificador único del slider
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @param {number} width - Ancho del slider
   * @param {number} height - Alto del slider
   * @returns {Object} El slider creado
   */
  createSlider(id, x, y, width, height) {
    const slider = {
      id,
      x,
      y,
      width,
      height,
      value: 0.5,
      isDragging: false,
      handleRadius: 10,
      onChange: null,
    };
    this.sliders.set(id, slider);
    return slider;
  }

  /**
   * Actualiza la posición de un slider
   * @param {string} id - Identificador del slider
   * @param {number} x - Nueva coordenada X
   * @param {number} y - Nueva coordenada Y
   */
  updateSliderPosition(id, x, y) {
    const slider = this.sliders.get(id);
    if (slider) {
      slider.x = x;
      slider.y = y;
    }
  }

  /**
   * Establece el valor de un slider
   * @param {string} id - Identificador del slider
   * @param {number} value - Nuevo valor (0-1)
   */
  setSliderValue(id, value) {
    const slider = this.sliders.get(id);
    if (slider) {
      slider.value = Math.max(0, Math.min(1, value));
      if (slider.onChange) {
        slider.onChange(slider.value);
      }
    }
  }

  /**
   * Maneja un clic en los sliders
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {boolean} True si se hizo clic en un slider
   */
  handleClick(x, y) {
    for (const slider of this.sliders.values()) {
      if (this.isPointInSlider(x, y, slider)) {
        slider.isDragging = true;
        const newValue = Math.max(
          0,
          Math.min(1, (x - slider.x) / slider.width)
        );
        this.setSliderValue(slider.id, newValue);
        return true;
      }
    }
    return false;
  }

  /**
   * Maneja el movimiento del mouse para arrastre de sliders
   * @param {number} x - Coordenada X del mouse
   * @param {number} y - Coordenada Y del mouse
   * @returns {boolean} True si se está arrastrando un slider
   */
  handleMouseMove(x, y) {
    for (const slider of this.sliders.values()) {
      if (slider.isDragging) {
        const newValue = Math.max(
          0,
          Math.min(1, (x - slider.x) / slider.width)
        );
        this.setSliderValue(slider.id, newValue);
        return true;
      }
    }
    return false;
  }

  /**
   * Maneja la liberación del mouse para detener arrastre
   */
  handleMouseUp() {
    for (const slider of this.sliders.values()) {
      slider.isDragging = false;
    }
  }

  /**
   * Verifica si un punto está dentro de un slider
   * @param {number} x - Coordenada X del punto
   * @param {number} y - Coordenada Y del punto
   * @param {Object} slider - Slider a verificar
   * @returns {boolean} True si el punto está dentro
   */
  isPointInSlider(x, y, slider) {
    return (
      x >= slider.x &&
      x <= slider.x + slider.width &&
      y >= slider.y - 10 &&
      y <= slider.y + slider.height + 10
    );
  }

  /**
   * Obtiene un slider por su ID
   * @param {string} id - Identificador del slider
   * @returns {Object|undefined} El slider encontrado
   */
  getSlider(id) {
    return this.sliders.get(id);
  }

  /**
   * Limpia todos los sliders
   */
  clear() {
    this.sliders.clear();
  }
}

export default SliderManager;

/**
 * Sistema de precarga de assets (imágenes, audio)
 * Gestiona la carga asíncrona de recursos del juego y proporciona
 * seguimiento del progreso de carga
 */

/**
 * Clase para gestionar la carga de recursos del juego
 * @class Loader
 */
class Loader {
  constructor() {
    /** @type {Object.<string, HTMLImageElement>} Mapa de imágenes cargadas por clave */
    this.images = {};
    /** @type {Object.<string, HTMLAudioElement>} Mapa de sonidos cargados por clave (futuro uso) */
    this.sounds = {};
    /** @type {number} Total de assets a cargar */
    this.totalAssets = 0;
    /** @type {number} Número de assets cargados exitosamente */
    this.loadedAssets = 0;
  }

  /**
   * Carga una imagen de forma asíncrona
   * @param {string} key - Identificador único para la imagen
   * @param {string} src - Ruta del archivo de imagen
   * @returns {Promise<HTMLImageElement>} Promise que se resuelve con la imagen cargada
   * @throws {Error} Si la imagen no se puede cargar
   */
  loadImage(key, src) {
    this.totalAssets++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        this.loadedAssets++;
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Error al cargar imagen: ${src}`);
        reject(new Error(`No se pudo cargar: ${src}`));
      };
      img.src = src;
    });
  }

  /**
   * Carga múltiples imágenes en paralelo
   * @param {Object.<string, string>} imageMap - Objeto con pares clave-ruta de imágenes
   * @returns {Promise<HTMLImageElement[]>} Promise que se resuelve cuando todas las imágenes están cargadas
   * @example
   * loader.loadImages({
   *   'player': 'assets/player.png',
   *   'enemy': 'assets/enemy.png'
   * });
   */
  loadImages(imageMap) {
    const promises = [];
    for (const [key, src] of Object.entries(imageMap)) {
      promises.push(this.loadImage(key, src));
    }
    return Promise.all(promises);
  }

  /**
   * Obtiene una imagen previamente cargada
   * @param {string} key - Identificador de la imagen
   * @returns {HTMLImageElement|undefined} La imagen cargada o undefined si no existe
   */
  getImage(key) {
    return this.images[key];
  }

  /**
   * Calcula el progreso de carga como porcentaje
   * @returns {number} Valor entre 0 y 1 representando el progreso (0 = 0%, 1 = 100%)
   */
  getProgress() {
    return this.totalAssets === 0 ? 1 : this.loadedAssets / this.totalAssets;
  }

  /**
   * Verifica si todos los assets han sido cargados
   * @returns {boolean} true si la carga está completa, false en caso contrario
   */
  isComplete() {
    return this.loadedAssets === this.totalAssets;
  }
}

/**
 * Instancia única del loader
 * @type {Loader}
 */
export const loader = new Loader();

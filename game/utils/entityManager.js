/**
 * Gestor de entidades del juego - Balas, enemigos y asteroides
 */
class EntityManager {
  constructor() {
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.asteroids = [];
  }

  /**
   * Agrega una bala del jugador
   * @param {Object} bullet - Objeto de la bala
   */
  addBullet(bullet) {
    this.bullets.push(bullet);
  }

  /**
   * Actualiza todas las balas del jugador y elimina las que están fuera de pantalla
   * @param {number} dt - Delta time en segundos
   * @param {number} canvasWidth - Ancho del canvas
   */
  updateBullets(dt, canvasWidth) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.speed * dt;

      if (bullet.x > canvasWidth || bullet.shouldRemove) {
        this.bullets.splice(i, 1);
      }
    }
  }

  /**
   * Elimina una bala por su índice
   * @param {number} index - Índice de la bala a eliminar
   */
  removeBullet(index) {
    if (index >= 0 && index < this.bullets.length) {
      this.bullets.splice(index, 1);
    }
  }

  /**
   * Obtiene el array de balas del jugador
   * @returns {Array} Array de balas
   */
  getBullets() {
    return this.bullets;
  }

  /**
   * Limpia todas las balas del jugador
   */
  clearBullets() {
    this.bullets = [];
  }

  /**
   * Agrega una bala enemiga
   * @param {Object} bullet - Objeto de la bala enemiga
   */
  addEnemyBullet(bullet) {
    this.enemyBullets.push(bullet);
  }

  /**
   * Actualiza todas las balas enemigas y elimina las que están fuera de pantalla
   * @param {number} dt - Delta time en segundos
   */
  updateEnemyBullets(dt) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.x += bullet.speed * dt;

      if (bullet.x + bullet.width < 0 || bullet.shouldRemove) {
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  /**
   * Elimina una bala enemiga por su índice
   * @param {number} index - Índice de la bala a eliminar
   */
  removeEnemyBullet(index) {
    if (index >= 0 && index < this.enemyBullets.length) {
      this.enemyBullets.splice(index, 1);
    }
  }

  /**
   * Obtiene el array de balas enemigas
   * @returns {Array} Array de balas enemigas
   */
  getEnemyBullets() {
    return this.enemyBullets;
  }

  /**
   * Limpia todas las balas enemigas
   */
  clearEnemyBullets() {
    this.enemyBullets = [];
  }

  /**
   * Agrega un enemigo
   * @param {Object} enemy - Objeto del enemigo
   */
  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  /**
   * Actualiza todos los enemigos y elimina los que están fuera de pantalla
   * @param {number} dt - Delta time en segundos
   * @param {number} canvasHeight - Alto del canvas
   * @param {Function} updateCallback - Callback para actualizar cada enemigo
   */
  updateEnemies(dt, canvasHeight, updateCallback) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (updateCallback) {
        updateCallback(enemy, dt);
      }

      if (enemy.isFalling && enemy.y > canvasHeight) {
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.x + enemy.width < 0) {
        this.enemies.splice(i, 1);
      }
    }
  }

  /**
   * Elimina un enemigo por su índice
   * @param {number} index - Índice del enemigo a eliminar
   */
  removeEnemy(index) {
    if (index >= 0 && index < this.enemies.length) {
      this.enemies.splice(index, 1);
    }
  }

  /**
   * Obtiene el array de enemigos
   * @returns {Array} Array de enemigos
   */
  getEnemies() {
    return this.enemies;
  }

  /**
   * Limpia todos los enemigos
   */
  clearEnemies() {
    this.enemies = [];
  }

  /**
   * Agrega un asteroide
   * @param {Object} asteroid - Objeto del asteroide
   */
  addAsteroid(asteroid) {
    this.asteroids.push(asteroid);
  }

  /**
   * Actualiza todos los asteroides y elimina los que están fuera de pantalla
   * @param {number} dt - Delta time en segundos
   */
  updateAsteroids(dt) {
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];

      asteroid.x -= asteroid.speed * dt;
      asteroid.rotation += asteroid.rotationSpeed * dt;

      if (asteroid.x + asteroid.width < 0) {
        this.asteroids.splice(i, 1);
      }
    }
  }

  /**
   * Elimina un asteroide por su índice
   * @param {number} index - Índice del asteroide a eliminar
   */
  removeAsteroid(index) {
    if (index >= 0 && index < this.asteroids.length) {
      this.asteroids.splice(index, 1);
    }
  }

  /**
   * Obtiene el array de asteroides
   * @returns {Array} Array de asteroides
   */
  getAsteroids() {
    return this.asteroids;
  }

  /**
   * Limpia todos los asteroides
   */
  clearAsteroids() {
    this.asteroids = [];
  }

  /**
   * Limpia todas las entidades del juego
   */
  clearAll() {
    this.clearBullets();
    this.clearEnemyBullets();
    this.clearEnemies();
    this.clearAsteroids();
  }

  /**
   * Obtiene el conteo actual de todas las entidades
   * @returns {Object} Objeto con los conteos de cada tipo de entidad
   */
  getCounts() {
    return {
      bullets: this.bullets.length,
      enemyBullets: this.enemyBullets.length,
      enemies: this.enemies.length,
      asteroids: this.asteroids.length,
    };
  }
}

export default EntityManager;

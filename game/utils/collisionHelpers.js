/**
 * Funciones de detección de colisiones reutilizables para el juego
 */
export const CollisionHelpers = {
  /**
   * Detección de colisión AABB (Axis-Aligned Bounding Box)
   * @param {Object} rect1 - Primer rectángulo con propiedades x, y, width, height
   * @param {Object} rect2 - Segundo rectángulo con propiedades x, y, width, height
   * @returns {boolean} True si hay colisión
   */
  checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  /**
   * Verifica colisiones entre balas del jugador y enemigos
   * @param {Array} bullets - Array de balas del jugador
   * @param {Array} enemies - Array de enemigos
   * @param {Function} onHit - Callback ejecutado al detectar colisión
   */
  checkBulletsVsEnemies(bullets, enemies, onHit) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      let bulletHit = false;

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j];

        if (enemy.isFalling) continue;

        if (this.checkAABB(bullet, enemy)) {
          bulletHit = true;

          if (onHit) {
            onHit(bullet, enemy, i, j);
          }

          break;
        }
      }

      if (bulletHit) {
        bullets.splice(i, 1);
      }
    }
  },

  /**
   * Verifica colisiones entre balas enemigas y el jugador
   * @param {Array} enemyBullets - Array de balas enemigas
   * @param {Object} player - Objeto del jugador
   * @param {Function} onHit - Callback ejecutado al detectar colisión
   */
  checkEnemyBulletsVsPlayer(enemyBullets, player, onHit) {
    if (player.isFalling) return;

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];

      if (this.checkAABB(bullet, player)) {
        if (onHit) {
          onHit(bullet, player, i);
        }

        enemyBullets.splice(i, 1);
      }
    }
  },

  /**
   * Verifica colisiones entre asteroides y el jugador
   * @param {Array} asteroids - Array de asteroides
   * @param {Object} player - Objeto del jugador
   * @param {Function} onHit - Callback ejecutado al detectar colisión
   */
  checkAsteroidsVsPlayer(asteroids, player, onHit) {
    if (player.isFalling) return;

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];

      if (this.checkAABB(asteroid, player)) {
        if (onHit) {
          onHit(asteroid, player, i);
        }

        asteroids.splice(i, 1);
      }
    }
  },

  /**
   * Verifica colisión circular entre dos puntos con radio
   * @param {number} x1 - Coordenada X del primer círculo
   * @param {number} y1 - Coordenada Y del primer círculo
   * @param {number} radius1 - Radio del primer círculo
   * @param {number} x2 - Coordenada X del segundo círculo
   * @param {number} y2 - Coordenada Y del segundo círculo
   * @param {number} radius2 - Radio del segundo círculo
   * @returns {boolean} True si hay colisión
   */
  checkCircular(x1, y1, radius1, x2, y2, radius2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius1 + radius2;
  },

  /**
   * Verifica si un punto está dentro de un rectángulo
   * @param {number} px - Coordenada X del punto
   * @param {number} py - Coordenada Y del punto
   * @param {Object} rect - Rectángulo con propiedades x, y, width, height
   * @returns {boolean} True si el punto está dentro
   */
  pointInRect(px, py, rect) {
    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    );
  },

  /**
   * Verifica si un punto está dentro de un círculo
   * @param {number} px - Coordenada X del punto
   * @param {number} py - Coordenada Y del punto
   * @param {number} cx - Coordenada X del centro del círculo
   * @param {number} cy - Coordenada Y del centro del círculo
   * @param {number} radius - Radio del círculo
   * @returns {boolean} True si el punto está dentro
   */
  pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  },
};

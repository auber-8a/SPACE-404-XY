/**
 * Clase base para niveles del juego.
 * Proporciona funcionalidad común para control del jugador, aparición de enemigos,
 * detección de colisiones, simulación física y renderizado. Las subclases deben
 * implementar comportamiento específico del nivel.
 */
import { loader } from "../../engine/loader.js";
import PhysicsManager from "../utils/physicsManager.js";
import EntityManager from "../utils/entityManager.js";
import TouchControlsManager from "../utils/touchControlsManager.js";
import { RenderHelpers } from "../utils/renderHelpers.js";
import { CollisionHelpers } from "../utils/collisionHelpers.js";
import { audioManager } from "../utils/audioManager.js";

class BaseLevel {
  /**
   * @param {HTMLCanvasElement} canvas - Lienzo del juego
   * @param {Object} stateManager - Instancia del gestor de estados
   * @param {number} levelNumber - Número del nivel actual (1, 2 o 3)
   */
  constructor(canvas, stateManager, levelNumber) {
    this.canvas = canvas;
    this.stateManager = stateManager;
    this.levelNumber = levelNumber;
    this.isLoading = true;
    this.assetsLoaded = false;

    this.levelProgress = 0;
    this.playerHealth = 100;
    this.levelCompleted = false;

    this.menuButton = {
      x: 20,
      y: 20,
      width: 0,
      height: 0,
      scale: 2.5,
    };

    this.bars = {
      progress: {
        x: 0,
        y: 20,
        width: 200,
        height: 20,
        backgroundColor: "rgba(50, 50, 50, 0.8)",
        fillColor: "#4bd",
        borderColor: "#fff",
      },
      health: {
        x: 0,
        y: 60,
        width: 200,
        height: 20,
        backgroundColor: "rgba(50, 50, 50, 0.8)",
        fillColor: "#0f0",
        borderColor: "#fff",
      },
    };

    this.bars.progress.x = this.canvas.width - this.bars.progress.width - 15;
    this.bars.health.x = this.canvas.width - this.bars.health.width - 15;

    this.layers = [];

    this.naveTerrestre = {
      image: null,
      x: 100,
      y: 200,
      width: 100,
      height: 100,
      speed: 300,
      velocityY: 0,
      health: 100,
      maxHealth: 100,
      isDestroyed: false,
      isFalling: false,
      fallSpeed: 0,
      fallAcceleration: 400,
    };

    this.entityManager = new EntityManager();
    this.physicsManager = new PhysicsManager();
    this.touchControls = new TouchControlsManager(canvas);

    this.bulletSpeed = 500;
    this.bulletWidth = 50;
    this.bulletHeight = 10;
    this.canShoot = true;
    this.shootCooldown = 0.2;
    this.shootTimer = 0;

    this.enemySpeed = 150;
    this.enemyVerticalSpeed = 100;
    this.enemyWidth = 80;
    this.enemyHeight = 80;
    this.maxEnemies = 10;
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 2;
    this.enemiesSpawned = 0;
    this.enemiesDestroyed = 0;
    this.enemyHealth = 3;
    this.enemyDamage = 10;

    this.enemyBulletSpeed = 400;
    this.enemyBulletWidth = 70;
    this.enemyBulletHeight = 30;
    this.enemyShootCooldown = 1.5;

    this.poisonState = {
      isPoisoned: false,
      duration: 0,
      maxDuration: 5,
      damagePerSecond: 1,
      damageTimer: 0,
      damageInterval: 0.5,
    };

    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowRight: false,
    };

    this.touchControls.loadPositions();
    this.physicsManager.initialize();
    this.setupPhysicsCollisions();
  }

  /**
   * Configura los listeners de colisión Box2D para las entidades del juego
   */
  setupPhysicsCollisions() {
    this.physicsManager.setContactListener((dataA, dataB, bodyA, bodyB) => {
      if (!dataA || !dataB) return;

      if (
        (dataA.type === "playerBullet" && dataB.type === "enemy") ||
        (dataA.type === "enemy" && dataB.type === "playerBullet")
      ) {
        const bullet = dataA.type === "playerBullet" ? dataA : dataB;
        const enemy = dataA.type === "enemy" ? dataA : dataB;
        this.handlePlayerBulletHitsEnemy(bullet, enemy);
      }

      if (
        (dataA.type === "enemyBullet" && dataB.type === "player") ||
        (dataA.type === "player" && dataB.type === "enemyBullet")
      ) {
        const bullet = dataA.type === "enemyBullet" ? dataA : dataB;
        this.handleEnemyBulletHitsPlayer(bullet);
      }
    });
  }

  /**
   * Maneja la colisión entre una bala del jugador y un enemigo
   * @param {Object} bullet - Datos de la bala del jugador
   * @param {Object} enemy - Datos de la nave enemiga
   */
  handlePlayerBulletHitsEnemy(bullet, enemy) {
    bullet.shouldRemove = true;

    if (enemy.entity && !enemy.entity.isFalling) {
      if (enemy.entity.hasShield && enemy.entity.shieldHealth > 0) {
        enemy.entity.shieldHealth--;
        console.log(
          `¡Escudo impactado! Resistencia del escudo: ${enemy.entity.shieldHealth}/${enemy.entity.maxShieldHealth}`
        );

        if (enemy.entity.shieldHealth <= 0) {
          console.log("¡Escudo destruido! Enemigo vulnerable.");
        }
      } else {
        enemy.entity.health--;
        console.log(
          `¡Impacto! Enemigo salud: ${enemy.entity.health}/${enemy.entity.maxHealth}`
        );

        if (enemy.entity.health <= 0) {
          enemy.entity.isFalling = true;
          enemy.entity.fallSpeed = 0;
          this.enemiesDestroyed++;

          if (enemy.body) {
            this.physicsManager.setBodyType(enemy.body, "dynamic");
          }

          console.log(
            `¡Enemigo destruido! ${this.enemiesDestroyed}/${this.maxEnemies}`
          );
        }
      }
    }
  }

  /**
   * Maneja la colisión entre una bala enemiga y el jugador
   * @param {Object} bullet - Datos de la bala enemiga
   */
  handleEnemyBulletHitsPlayer(bullet) {
    bullet.shouldRemove = true;

    if (this.naveTerrestre && !this.naveTerrestre.isFalling) {
      this.naveTerrestre.health -= this.enemyDamage;
      this.playerHealth = this.naveTerrestre.health;

      if (bullet.isPoison) {
        this.poisonState.isPoisoned = true;
        this.poisonState.duration = this.poisonState.maxDuration;
        this.poisonState.damageTimer = 0;
        console.log(
          "ALERTA: Sistemas electrónicos dañados - Virus detectado en la nave"
        );
        console.log("Energía de pulso EMP corrompiendo circuitos...");
      }

      if (window.playSoundEffect) {
        window.playSoundEffect("impactSound");
      }

      console.log(
        `¡Nave terrestre impactada! Salud: ${this.naveTerrestre.health}/${this.naveTerrestre.maxHealth}`
      );

      if (this.naveTerrestre.health <= 0) {
        this.naveTerrestre.isFalling = true;
        this.naveTerrestre.fallSpeed = 0;
        this.playerHealth = 0;

        const playerBody = this.physicsManager.getBody("player");
        if (playerBody) {
          this.physicsManager.setBodyType(playerBody, "dynamic");
        }

        console.log("¡Nave terrestre destruida!");
      }
    }
  }

  /**
   * Sincroniza los cuerpos físicos de Box2D con las entidades del juego
   */
  syncPhysicsToEntities() {
    if (!this.physicsManager.isInitialized) return;

    const bullets = this.entityManager.getBullets();
    bullets.forEach((bullet, index) => {
      const body = this.physicsManager.getBody(`playerBullet_${index}`);
      if (body) {
        const pos = this.physicsManager.getBodyPosition(body);
        bullet.x = pos.x - bullet.width / 2;
        bullet.y = pos.y - bullet.height / 2;

        if (bullet.shouldRemove) {
          this.physicsManager.removeBody(`playerBullet_${index}`);
        }
      }
    });

    const enemies = this.entityManager.getEnemies();
    enemies.forEach((enemy, index) => {
      const body = this.physicsManager.getBody(`enemy_${index}`);
      if (body) {
        const pos = this.physicsManager.getBodyPosition(body);
        enemy.x = pos.x - enemy.width / 2;
        enemy.y = pos.y - enemy.height / 2;
      }
    });

    const enemyBullets = this.entityManager.getEnemyBullets();
    enemyBullets.forEach((bullet, index) => {
      const body = this.physicsManager.getBody(`enemyBullet_${index}`);
      if (body) {
        const pos = this.physicsManager.getBodyPosition(body);
        bullet.x = pos.x - bullet.width / 2;
        bullet.y = pos.y - bullet.height / 2;

        if (bullet.shouldRemove) {
          this.physicsManager.removeBody(`enemyBullet_${index}`);
        }
      }
    });

    this.entityManager.bullets = bullets.filter((b) => !b.shouldRemove);
    this.entityManager.enemyBullets = enemyBullets.filter(
      (b) => !b.shouldRemove
    );
  }

  /**
   * Configura los parámetros del juego según el nivel de dificultad
   * @param {string} difficulty - Nivel de dificultad ('facil', 'medio', 'dificil')
   */
  configureDifficulty(difficulty) {
    switch (difficulty) {
      case "facil":
        this.maxEnemies = 10;
        this.enemySpawnInterval = 3;
        this.enemyShootCooldown = 2;
        this.enemyHealth = 2;
        this.enemyDamage = 5;
        break;
      case "medio":
        this.maxEnemies = 20;
        this.enemySpawnInterval = 2;
        this.enemyShootCooldown = 1.5;
        this.enemyHealth = 3;
        this.enemyDamage = 10;
        break;
      case "dificil":
        this.maxEnemies = 30;
        this.enemySpawnInterval = 1.5;
        this.enemyShootCooldown = 1;
        this.enemyHealth = 5;
        this.enemyDamage = 15;
        break;
      default:
        this.maxEnemies = 20;
        this.enemySpawnInterval = 2;
        this.enemyShootCooldown = 1.5;
        this.enemyHealth = 3;
        this.enemyDamage = 10;
    }
    console.log(
      `Nivel ${this.levelNumber} - Dificultad: ${difficulty} - ${this.maxEnemies} enemigos con ${this.enemyHealth} HP`
    );
  }

  /**
   * Ciclo de vida del estado: Entrar al estado
   */
  enter() {
    console.log(`Entrando al Nivel ${this.levelNumber}`);
    this.isLoading = true;
    this.assetsLoaded = false;

    const settingsState = this.stateManager.states["settings"];
    if (settingsState) {
      const difficulty = settingsState.getSettings().difficulty;
      this.configureDifficulty(difficulty);
    } else {
      this.configureDifficulty("medio");
    }

    audioManager.playGameMusic();
    this.loadLevelAssets();
  }

  /**
   * Método abstracto: Carga los recursos específicos del nivel
   * @abstract
   */
  async loadLevelAssets() {
    throw new Error("loadLevelAssets() debe ser implementado en la subclase");
  }

  /**
   * Ciclo de vida del estado: Salir del estado
   */
  exit() {
    console.log(`Saliendo del Nivel ${this.levelNumber}`);
    audioManager.stopGameMusic();
    audioManager.playMenuMusic();
  }

  /**
   * Actualiza la lógica del juego
   * @param {number} dt - Tiempo delta en segundos
   */
  update(dt) {
    if (this.physicsManager.isInitialized) {
      this.physicsManager.step(dt);
      this.syncPhysicsToEntities();
    }

    if (this.naveTerrestre.isDestroyed) {
      this.updateNaveTerrestre(dt);
      return;
    }

    if (!this.canShoot) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.canShoot = true;
      }
    }

    const shouldShoot =
      this.keys.ArrowRight || this.touchControls.isButtonPressed("shoot");
    if (shouldShoot && this.canShoot) {
      this.shoot();
    }

    this.updateNaveTerrestre(dt);
    this.updateBullets(dt);
    this.updateEnemySpawn(dt);
    this.updateEnemies(dt);
    this.updateEnemyBullets(dt);
    this.checkCollisions();
    this.updateProgress();
    this.updatePoisonEffect(dt);
  }

  /**
   * Actualiza el efecto de daño por veneno a lo largo del tiempo
   * @param {number} dt - Tiempo delta en segundos
   */
  updatePoisonEffect(dt) {
    if (!this.poisonState.isPoisoned) return;

    this.poisonState.duration -= dt;
    this.poisonState.damageTimer += dt;
    if (this.poisonState.damageTimer >= this.poisonState.damageInterval) {
      this.poisonState.damageTimer = 0;

      if (this.naveTerrestre && !this.naveTerrestre.isFalling) {
        const damage =
          this.poisonState.damagePerSecond * this.poisonState.damageInterval;
        this.naveTerrestre.health -= damage;
        this.playerHealth = this.naveTerrestre.health;

        console.log(
          `⚡ Cortocircuito: -${damage.toFixed(
            1
          )} HP | Integridad: ${this.naveTerrestre.health.toFixed(
            0
          )}% (${this.poisonState.duration.toFixed(1)}s restantes)`
        );

        if (this.naveTerrestre.health <= 0) {
          this.naveTerrestre.isFalling = true;
          this.naveTerrestre.fallSpeed = 0;
          this.playerHealth = 0;
          console.log("¡Nave terrestre destruida por veneno!");
        }
      }
    }

    if (this.poisonState.duration <= 0) {
      this.poisonState.isPoisoned = false;
      console.log("Sistemas restaurados - Daño electrónico reparado");
    }
  }

  /**
   * Actualiza la posición y estado de la nave del jugador
   * @param {number} dt - Tiempo delta en segundos
   */
  updateNaveTerrestre(dt) {
    if (this.naveTerrestre.isFalling) {
      this.naveTerrestre.fallSpeed += this.naveTerrestre.fallAcceleration * dt;
      this.naveTerrestre.y += this.naveTerrestre.fallSpeed * dt;

      if (this.naveTerrestre.y > this.canvas.height) {
        this.naveTerrestre.isDestroyed = true;
        console.log("Game Over - Nave terrestre destruida");

        const gameOverState = this.stateManager.states["gameOver"];
        if (gameOverState) {
          gameOverState.setBackgroundState(this, `level${this.levelNumber}`);
          this.stateManager.setState("gameOver");
        }
      }
      return;
    }

    this.naveTerrestre.velocityY = 0;

    const moveUp =
      this.keys.ArrowUp || this.touchControls.isButtonPressed("up");
    const moveDown =
      this.keys.ArrowDown || this.touchControls.isButtonPressed("down");

    if (moveUp) {
      this.naveTerrestre.velocityY = -this.naveTerrestre.speed;
    }
    if (moveDown) {
      this.naveTerrestre.velocityY = this.naveTerrestre.speed;
    }

    this.naveTerrestre.y += this.naveTerrestre.velocityY * dt;

    const minY = 0;
    const maxY = this.canvas.height - this.naveTerrestre.height;

    if (this.naveTerrestre.y < minY) {
      this.naveTerrestre.y = minY;
    }
    if (this.naveTerrestre.y > maxY) {
      this.naveTerrestre.y = maxY;
    }
  }

  /**
   * Dispara una bala desde la nave del jugador
   */
  shoot() {
    const bullet = {
      x: this.naveTerrestre.x + this.naveTerrestre.width,
      y:
        this.naveTerrestre.y +
        this.naveTerrestre.height / 2 -
        this.bulletHeight / 2,
      width: this.bulletWidth,
      height: this.bulletHeight,
      speed: this.bulletSpeed,
      scale: 2,
      image: loader.getImage("bala"),
    };

    this.entityManager.addBullet(bullet);

    this.canShoot = false;
    this.shootTimer = this.shootCooldown;

    if (window.playSoundEffect) {
      window.playSoundEffect("laserSound");
    }

    console.log(
      "¡Disparo! Balas activas:",
      this.entityManager.getBullets().length
    );
  }

  /**
   * Actualiza todas las balas del jugador
   * @param {number} dt - Tiempo delta en segundos
   */
  updateBullets(dt) {
    this.entityManager.updateBullets(dt, this.canvas.width);
  }

  /**
   * Gestiona el temporizador de aparición de enemigos
   * @param {number} dt - Tiempo delta en segundos
   */
  updateEnemySpawn(dt) {
    if (this.enemiesSpawned >= this.maxEnemies) {
      return;
    }

    this.enemySpawnTimer += dt;

    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  /**
   * Crea una nueva nave enemiga (puede ser sobrescrito para comportamiento específico del nivel)
   */
  spawnEnemy() {
    const minY = 50;
    const maxY = this.canvas.height - this.enemyHeight - 50;
    const randomY = minY + Math.random() * (maxY - minY);

    const enemy = {
      x: this.canvas.width,
      y: randomY,
      width: this.enemyWidth,
      height: this.enemyHeight,
      speed: this.enemySpeed,
      verticalSpeed: this.enemyVerticalSpeed,
      image: loader.getImage(`nave_extraterrestre_n${this.levelNumber}`),
      verticalDirection: Math.random() > 0.5 ? 1 : -1,
      verticalAmplitude: 100,
      verticalCenter: randomY,
      shootTimer: Math.random() * this.enemyShootCooldown,
      canShoot: true,
      health: this.enemyHealth,
      maxHealth: this.enemyHealth,
      isDestroyed: false,
      isFalling: false,
      fallSpeed: 0,
      fallAcceleration: 400,
    };

    this.entityManager.addEnemy(enemy);
    this.enemiesSpawned++;
    console.log(
      `Enemigo spawneado ${this.enemiesSpawned}/${
        this.maxEnemies
      } en Y=${Math.round(randomY)}`
    );
  }

  /**
   * Actualiza todas las naves enemigas
   * @param {number} dt - Tiempo delta en segundos
   */
  updateEnemies(dt) {
    const enemies = this.entityManager.getEnemies();
    this.entityManager.updateEnemies(
      dt,
      this.canvas.height,
      (enemy, deltaTime) => {
        if (enemy.isFalling) {
          enemy.fallSpeed += enemy.fallAcceleration * deltaTime;
          enemy.y += enemy.fallSpeed * deltaTime;
          return;
        }

        if (enemy.x > this.naveTerrestre.x + this.naveTerrestre.width + 50) {
          enemy.x -= enemy.speed * deltaTime;
        }

        enemy.y += enemy.verticalDirection * enemy.verticalSpeed * deltaTime;

        const distanceFromCenter = Math.abs(enemy.y - enemy.verticalCenter);
        if (distanceFromCenter > enemy.verticalAmplitude / 2) {
          enemy.verticalDirection *= -1;
        }

        const minY = 0;
        const maxY = this.canvas.height - enemy.height;
        if (enemy.y < minY) {
          enemy.y = minY;
          enemy.verticalDirection = 1;
        }
        if (enemy.y > maxY) {
          enemy.y = maxY;
          enemy.verticalDirection = -1;
        }

        if (!enemy.isFalling) {
          enemy.shootTimer += deltaTime;
          if (enemy.shootTimer >= this.enemyShootCooldown) {
            this.enemyShoot(enemy);
            enemy.shootTimer = 0;
          }
        }
      }
    );
  }

  /**
   * Dispara una bala desde una nave enemiga
   * @param {Object} enemy - Objeto de la nave enemiga
   */
  enemyShoot(enemy) {
    const bullet = {
      x: enemy.x,
      y: enemy.y + enemy.height / 2 - this.enemyBulletHeight / 2,
      width: this.enemyBulletWidth,
      height: this.enemyBulletHeight,
      speed: -this.enemyBulletSpeed,
      scale: 3,
      image: loader.getImage("bala_enemiga"),
    };

    this.entityManager.addEnemyBullet(bullet);
  }

  /**
   * Actualiza todas las balas enemigas
   * @param {number} dt - Tiempo delta en segundos
   */
  updateEnemyBullets(dt) {
    this.entityManager.updateEnemyBullets(dt);
  }

  /**
   * Verifica colisiones entre todas las entidades del juego usando AABB
   */
  checkCollisions() {
    const bullets = this.entityManager.getBullets();
    const enemies = this.entityManager.getEnemies();
    const enemyBullets = this.entityManager.getEnemyBullets();

    CollisionHelpers.checkBulletsVsEnemies(
      bullets,
      enemies,
      (bullet, enemy, bulletIdx, enemyIdx) => {
        if (enemy.hasShield && enemy.shieldHealth > 0) {
          enemy.shieldHealth--;
          console.log(
            `¡Escudo impactado! Resistencia del escudo: ${enemy.shieldHealth}/${enemy.maxShieldHealth}`
          );

          if (enemy.shieldHealth <= 0) {
            console.log("¡Escudo destruido! Enemigo vulnerable.");
          }
        } else {
          enemy.health--;
          console.log(
            `¡Impacto! Enemigo recibió daño. Salud restante: ${enemy.health}/${enemy.maxHealth}`
          );

          if (enemy.health <= 0) {
            enemy.isFalling = true;
            enemy.fallSpeed = 0;
            this.enemiesDestroyed++;
            console.log(
              `¡Enemigo destruido! Total destruidos: ${this.enemiesDestroyed}/${this.maxEnemies}`
            );
          }
        }
      }
    );

    CollisionHelpers.checkEnemyBulletsVsPlayer(
      enemyBullets,
      this.naveTerrestre,
      (bullet, player) => {
        this.naveTerrestre.health -= this.enemyDamage;
        this.playerHealth = this.naveTerrestre.health;

        if (bullet.isPoison) {
          this.poisonState.isPoisoned = true;
          this.poisonState.duration = this.poisonState.maxDuration;
          this.poisonState.damageTimer = 0;
          console.log(
            "ALERTA: Sistemas electrónicos dañados - Virus detectado en la nave"
          );
          console.log("Energía de pulso EMP corrompiendo circuitos...");
        }

        if (window.playSoundEffect) {
          window.playSoundEffect("impactSound");
        }

        console.log(
          `¡Nave terrestre impactada! Salud restante: ${this.naveTerrestre.health}/${this.naveTerrestre.maxHealth}`
        );

        if (this.naveTerrestre.health <= 0) {
          this.naveTerrestre.isFalling = true;
          this.naveTerrestre.fallSpeed = 0;
          this.playerHealth = 0;
          console.log("¡Nave terrestre destruida! Iniciando caída...");
        }
      }
    );
  }

  /**
   * Actualiza el progreso del nivel y verifica si está completado
   */
  updateProgress() {
    if (this.maxEnemies > 0) {
      this.levelProgress = (this.enemiesDestroyed / this.maxEnemies) * 100;
    }

    if (this.enemiesDestroyed >= this.maxEnemies && !this.levelCompleted) {
      this.levelCompleted = true;
      console.log("¡Nivel completado!");

      const levelCompleteState = this.stateManager.states["levelComplete"];
      if (levelCompleteState) {
        levelCompleteState.setBackgroundState(
          this,
          `level${this.levelNumber}`,
          this.levelNumber
        );
        this.stateManager.setState("levelComplete");
      }
    }
  }

  /**
   * Renderiza toda la escena del juego
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   */
  render(ctx) {
    if (this.isLoading) {
      const fondoCarga = loader.getImage("fondo_carga");
      const progress = loader.getProgress();
      RenderHelpers.renderLoadingScreen(
        ctx,
        this.canvas.width,
        this.canvas.height,
        this.levelNumber,
        progress,
        fondoCarga
      );
      return;
    }

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderParallaxLayers(ctx);
    this.renderMainElements(ctx);
    this.renderHUD(ctx);
  }

  /**
   * Método abstracto: Renderiza las capas de fondo parallax
   * @abstract
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   */
  renderParallaxLayers(ctx) {
    throw new Error(
      "renderParallaxLayers() debe ser implementado en la subclase"
    );
  }

  /**
   * Renderiza las entidades del juego (balas, enemigos, jugador)
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   */
  renderMainElements(ctx) {
    const bullets = this.entityManager.getBullets();
    const enemies = this.entityManager.getEnemies();
    const enemyBullets = this.entityManager.getEnemyBullets();

    bullets.forEach((bullet) => {
      if (bullet.image) {
        ctx.drawImage(
          bullet.image,
          bullet.x,
          bullet.y,
          bullet.width,
          bullet.height
        );
      } else {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    });

    enemyBullets.forEach((bullet) => {
      if (bullet.image) {
        ctx.drawImage(
          bullet.image,
          bullet.x,
          bullet.y,
          bullet.width,
          bullet.height
        );
      } else {
        ctx.fillStyle = "#f00";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    });

    if (this.naveTerrestre.image && !this.naveTerrestre.isDestroyed) {
      const healthPercent =
        this.naveTerrestre.health / this.naveTerrestre.maxHealth;
      if (healthPercent < 0.3 && Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      ctx.drawImage(
        this.naveTerrestre.image,
        this.naveTerrestre.x,
        this.naveTerrestre.y,
        this.naveTerrestre.width,
        this.naveTerrestre.height
      );

      ctx.globalAlpha = 1.0;
    }

    enemies.forEach((enemy) => {
      if (enemy.image) {
        if (enemy.isFalling) {
          ctx.save();
          ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          ctx.rotate(Math.PI / 4);
          ctx.drawImage(
            enemy.image,
            -enemy.width / 2,
            -enemy.height / 2,
            enemy.width,
            enemy.height
          );
          ctx.restore();
        } else {
          ctx.drawImage(
            enemy.image,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );

          const healthPercent = enemy.health / enemy.maxHealth;
          RenderHelpers.renderHealthBar(
            ctx,
            enemy.x,
            enemy.y - 10,
            enemy.width,
            6,
            healthPercent
          );
        }
      } else {
        ctx.fillStyle = "#f00";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });
  }

  /**
   * Renderiza los elementos del HUD (barra de vida, barra de progreso, controles)
   * @param {CanvasRenderingContext2D} ctx - Contexto de renderizado del canvas
   */
  renderHUD(ctx) {
    const menuImg = loader.getImage("menu");
    if (menuImg) {
      const scaledWidth = menuImg.width * this.menuButton.scale;
      const scaledHeight = menuImg.height * this.menuButton.scale;

      ctx.drawImage(
        menuImg,
        this.menuButton.x,
        this.menuButton.y,
        scaledWidth,
        scaledHeight
      );

      this.menuButton.width = scaledWidth;
      this.menuButton.height = scaledHeight;
    }

    RenderHelpers.drawProgressBar(
      ctx,
      this.bars.progress.x,
      this.bars.progress.y,
      this.bars.progress.width,
      this.bars.progress.height,
      this.levelProgress,
      this.bars.progress.backgroundColor,
      this.bars.progress.fillColor,
      this.bars.progress.borderColor,
      "Progreso"
    );

    RenderHelpers.drawProgressBar(
      ctx,
      this.bars.health.x,
      this.bars.health.y,
      this.bars.health.width,
      this.bars.health.height,
      this.playerHealth,
      this.bars.health.backgroundColor,
      this.bars.health.fillColor,
      this.bars.health.borderColor,
      "Vida"
    );

    if (this.poisonState.isPoisoned) {
      RenderHelpers.renderPoisonIndicator(
        ctx,
        this.bars.health.x,
        this.bars.health.y + 30,
        this.poisonState.duration,
        this.poisonState.maxDuration
      );
    }

    this.touchControls.render(ctx);
  }

  /**
   * Maneja eventos de clic del mouse/táctil
   * @param {number} x - Coordenada X del clic
   * @param {number} y - Coordenada Y del clic
   * @returns {string|undefined} Resultado de la acción
   */
  handleClick(x, y) {
    if (
      x >= this.menuButton.x &&
      x <= this.menuButton.x + this.menuButton.width &&
      y >= this.menuButton.y &&
      y <= this.menuButton.y + this.menuButton.height
    ) {
      console.log("Botón de menú presionado - Pausando juego");
      const pauseState = this.stateManager.states["pause"];
      if (pauseState) {
        pauseState.setBackgroundState(this, `level${this.levelNumber}`);
        this.stateManager.setState("pause");
      }
      return "menu";
    }

    this.touchControls.handleTouchStart(x, y, "mouse");
  }

  /**
   * Maneja eventos de movimiento del mouse
   * @param {number} x - Coordenada X del mouse
   * @param {number} y - Coordenada Y del mouse
   */
  handleMouseMove(x, y) {
    this.touchControls.handleTouchMove(x, y, "mouse");
  }

  /**
   * Maneja la liberación del botón del mouse
   */
  handleMouseUp() {
    this.touchControls.handleTouchEnd("mouse");
  }

  /**
   * Maneja la presión de una tecla del teclado
   * @param {string} key - Nombre de la tecla
   */
  handleKeyDown(key) {
    if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowRight") {
      this.keys[key] = true;
    }

    if (key === "Escape") {
      console.log("Pausando juego");
      const pauseState = this.stateManager.states["pause"];
      if (pauseState) {
        pauseState.setBackgroundState(this, `level${this.levelNumber}`);
        this.stateManager.setState("pause");
      }
    }
  }

  /**
   * Maneja la liberación de una tecla del teclado
   * @param {string} key - Nombre de la tecla
   */
  handleKeyUp(key) {
    if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowRight") {
      this.keys[key] = false;
    }
  }

  /**
   * Reinicia el estado del nivel para comenzar de nuevo
   */
  restart() {
    console.log(`Reiniciando Nivel ${this.levelNumber}`);
    this.isLoading = true;
    this.assetsLoaded = false;

    this.levelProgress = 0;
    this.playerHealth = 100;
    this.levelCompleted = false;

    this.naveTerrestre.x = 100;
    this.naveTerrestre.y = 200;
    this.naveTerrestre.velocityY = 0;
    this.naveTerrestre.health = 100;
    this.naveTerrestre.isDestroyed = false;
    this.naveTerrestre.isFalling = false;
    this.naveTerrestre.fallSpeed = 0;

    this.entityManager.clearAll();
    this.physicsManager.clear();

    this.canShoot = true;
    this.shootTimer = 0;

    this.enemySpawnTimer = 0;
    this.enemiesSpawned = 0;
    this.enemiesDestroyed = 0;

    this.poisonState.isPoisoned = false;
    this.poisonState.duration = 0;
    this.poisonState.damageTimer = 0;

    this.keys.ArrowUp = false;
    this.keys.ArrowDown = false;
    this.keys.ArrowRight = false;

    const settingsState = this.stateManager.states["settings"];
    if (settingsState) {
      const difficulty = settingsState.getSettings().difficulty;
      this.configureDifficulty(difficulty);
    }

    this.loadLevelAssets();
  }
}

export default BaseLevel;

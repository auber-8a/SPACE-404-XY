/**
 * Gestor de física Box2D - Modulariza la lógica de física separándola de BaseLevel
 */
class PhysicsManager {
  /**
   * @param {number} scale - Escala de conversión pixel a metros (por defecto 30)
   */
  constructor(scale = 30) {
    this.world = null;
    this.physicsBodies = new Map();
    this.SCALE = scale;
    this.isInitialized = false;
    this.b2Classes = {};
  }

  /**
   * Inicializa el mundo de física Box2D
   * @returns {boolean} True si se inicializó correctamente
   */
  initialize() {
    try {
      if (typeof Box2D === "undefined") {
        console.warn(
          "Box2D no está disponible. Usando colisiones AABB simples."
        );
        this.isInitialized = false;
        return false;
      }

      this.b2Classes = {
        Vec2: Box2D.Common.Math.b2Vec2,
        World: Box2D.Dynamics.b2World,
        BodyDef: Box2D.Dynamics.b2BodyDef,
        Body: Box2D.Dynamics.b2Body,
        FixtureDef: Box2D.Dynamics.b2FixtureDef,
        PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
        ContactListener: Box2D.Dynamics.b2ContactListener,
      };

      const gravity = new this.b2Classes.Vec2(0, 20);
      this.world = new this.b2Classes.World(gravity, true);

      this.isInitialized = true;
      console.log("PhysicsManager: Box2D inicializado correctamente");
      return true;
    } catch (error) {
      console.error("PhysicsManager: Error al inicializar Box2D:", error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Configura el listener de contactos para detectar colisiones
   * @param {Function} onBeginContact - Callback ejecutado al iniciar un contacto
   */
  setContactListener(onBeginContact) {
    if (!this.isInitialized || !this.world) return;

    const contactListener = new this.b2Classes.ContactListener();
    contactListener.BeginContact = (contact) => {
      const bodyA = contact.GetFixtureA().GetBody();
      const bodyB = contact.GetFixtureB().GetBody();
      const dataA = bodyA.GetUserData();
      const dataB = bodyB.GetUserData();

      if (onBeginContact) {
        onBeginContact(dataA, dataB, bodyA, bodyB);
      }
    };

    this.world.SetContactListener(contactListener);
  }

  /**
   * Crea un cuerpo físico en el mundo Box2D
   * @param {number} x - Coordenada X en píxeles
   * @param {number} y - Coordenada Y en píxeles
   * @param {number} width - Ancho en píxeles
   * @param {number} height - Alto en píxeles
   * @param {string} type - Tipo de cuerpo ('dynamic', 'kinematic', 'static')
   * @param {*} userData - Datos del usuario asociados al cuerpo
   * @returns {Object|null} El cuerpo creado o null
   */
  createBody(x, y, width, height, type, userData) {
    if (!this.isInitialized) return null;

    const bodyDef = new this.b2Classes.BodyDef();

    switch (type) {
      case "dynamic":
        bodyDef.type = this.b2Classes.Body.b2_dynamicBody;
        break;
      case "kinematic":
        bodyDef.type = this.b2Classes.Body.b2_kinematicBody;
        break;
      default:
        bodyDef.type = this.b2Classes.Body.b2_staticBody;
    }

    bodyDef.position.Set(
      (x + width / 2) / this.SCALE,
      (y + height / 2) / this.SCALE
    );
    bodyDef.userData = userData;

    const body = this.world.CreateBody(bodyDef);

    const fixtureDef = new this.b2Classes.FixtureDef();
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.0;
    fixtureDef.restitution = 0.0;

    const shape = new this.b2Classes.PolygonShape();
    shape.SetAsBox(width / 2 / this.SCALE, height / 2 / this.SCALE);
    fixtureDef.shape = shape;

    body.CreateFixture(fixtureDef);

    return body;
  }

  /**
   * Destruye un cuerpo físico del mundo
   * @param {Object} body - Cuerpo a destruir
   */
  destroyBody(body) {
    if (!this.isInitialized || !this.world || !body) return;
    this.world.DestroyBody(body);
  }

  /**
   * Ejecuta un paso de simulación física
   * @param {number} dt - Delta time en segundos
   * @param {number} velocityIterations - Iteraciones de velocidad (por defecto 8)
   * @param {number} positionIterations - Iteraciones de posición (por defecto 3)
   */
  step(dt, velocityIterations = 8, positionIterations = 3) {
    if (!this.isInitialized || !this.world) return;
    this.world.Step(dt, velocityIterations, positionIterations);
    this.world.ClearForces();
  }

  /**
   * Obtiene la posición de un cuerpo en píxeles
   * @param {Object} body - Cuerpo del que obtener la posición
   * @returns {Object|null} Objeto con x e y o null
   */
  getBodyPosition(body) {
    if (!body) return null;
    const pos = body.GetPosition();
    return {
      x: pos.x * this.SCALE,
      y: pos.y * this.SCALE,
    };
  }

  /**
   * Cambia el tipo de un cuerpo físico
   * @param {Object} body - Cuerpo a modificar
   * @param {string} type - Nuevo tipo ('dynamic', 'kinematic', 'static')
   */
  setBodyType(body, type) {
    if (!this.isInitialized || !body) return;

    switch (type) {
      case "dynamic":
        body.SetType(this.b2Classes.Body.b2_dynamicBody);
        break;
      case "kinematic":
        body.SetType(this.b2Classes.Body.b2_kinematicBody);
        break;
      default:
        body.SetType(this.b2Classes.Body.b2_staticBody);
    }
  }

  /**
   * Almacena un cuerpo con una clave identificadora
   * @param {string} key - Clave identificadora
   * @param {Object} body - Cuerpo a almacenar
   */
  storeBody(key, body) {
    this.physicsBodies.set(key, body);
  }

  /**
   * Obtiene un cuerpo almacenado por su clave
   * @param {string} key - Clave identificadora
   * @returns {Object|undefined} El cuerpo almacenado
   */
  getBody(key) {
    return this.physicsBodies.get(key);
  }

  /**
   * Elimina y destruye un cuerpo almacenado
   * @param {string} key - Clave identificadora
   */
  removeBody(key) {
    const body = this.physicsBodies.get(key);
    if (body) {
      this.destroyBody(body);
      this.physicsBodies.delete(key);
    }
  }

  /**
   * Limpia y destruye todos los cuerpos almacenados
   */
  clear() {
    for (const body of this.physicsBodies.values()) {
      if (body) {
        this.destroyBody(body);
      }
    }
    this.physicsBodies.clear();
  }
}

export default PhysicsManager;

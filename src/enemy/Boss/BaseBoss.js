import StateMachine from '../../stateMachine/StateMachine.js';

export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame, player, config) {
        super(scene, x, y, texture, frame);

        // Configuración básica
        this.scene = scene;
        this.player = player;
        this.config = config || {};

        // Añadir a la escena y físicas
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Estado del boss
        this.isActivated = false;
        this.notdead = true;
        this.phase = 1;

        // Configuración por defecto
        this.health = this.config.health || 10;
        this.maxHealth = this.config.maxHealth || 10;
        this.damage = this.config.damage || 1;

        // Cooldowns
        this.startCooldown = this.config.startCooldown || 2000;
        this.attackCooldown = this.config.attackCooldown || 0;
        this.minCooldown = this.config.minCooldown || 1000;
        this.maxCooldown = this.config.maxCooldown || 1500;

        // Grupos de ataque
        this.attackGroups = {};

        // Estados disponibles
        this.availableStates = this.config.availableStates || [];

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'boss');

        // Para el PlayerDataManager (no revivir tras matarlo)
        this.bossName = this.config.bossName || '';

        // Puertas y pisos
        this.Bossdoors = null;
        this.floors = null;

        // Colisiones específicas (para poder limpiarlas y recrearlas)
        this.colliders = {};

        // Configuración física por defecto
        this.setupDefaultPhysics();

        // Estado inicial inactivo
        this.setupInactiveState();
        this.stateMachine.setState('inactive');

        // Configurar visualmente como inactivo
        this.setVisible(false);
        this.setActive(false);
    }

    setupDefaultPhysics() {
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;

        // Configuración por defecto del body (puede ser sobrescrita)
        this.body.setSize(spriteWidth / 35, spriteHeight / 35);
        this.body.setOffset(spriteWidth / 9.9, spriteHeight / 10.5);
        this.body.moves = false;
    }

    setupInactiveState() {
        this.stateMachine.addState('inactive', {
            enter: () => {
                console.log(`${this.constructor.name} inactivo`);
            },
            step: () => {
                // No ejecutar lógica de estado
            },
            exit: () => { }
        });
    }

    update(time, delta) {
        if (this.notdead && this.isActivated) {
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return;

        this.health -= damage;

        // Efecto visual de daño
        this.setTint(this.getDamageTintColor());

        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                this.setAlpha(1);
            }
        });

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    getDamageTintColor() {
        // Sobrescribir en clases hijas para diferentes colores
        return 0xff0000;
    }

    nextPhase() {
        // Método abstracto - debe ser implementado por clases hijas
        throw new Error('nextPhase() debe ser implementado por la clase hija');
    }

    startRandomState() {
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        if (!this.isActivated) {
            this.stateMachine.setState('inactive');
            return;
        }
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    die() {
        this.notdead = false;
        this.isActivated = false;

        // Limpiar warnings
        this.cleanupAllWarnings();

        // Desactivar estado actual
        if (this.stateMachine && this.stateMachine.currentState &&
            this.stateMachine.currentState.exit) {
            this.stateMachine.currentState.exit(this);
        }

        // Cambiar a estado inactivo
        if (this.stateMachine) {
            this.stateMachine.setState('inactive');
        }

        // Abrir puertas
        if (this.Bossdoors) {
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }

        if (this.floors) {
            this.floors.getChildren().forEach(floor => {
                if (floor.abrirPuerta) {
                    floor.abrirPuerta();
                }
            });
        }

        // Desactivar físicas
        this.setActive(false);
        this.setVisible(false);

        // Destruir objetos de ataque
        this.destroyAllAttackObjects();
    }

    getDoors(doors, floors = null) {
        this.Bossdoors = doors;
        this.floors = floors;
    }

    setLife() {
        // Verificar si el boss ya fue derrotado antes de activarlo
        if (this.bossName && PlayerDataManager.data.bossStatus[this.bossName]) {
            console.log(`${this.bossName} ya fue derrotado, no se activará`);
            this.setVisible(false);
            this.setActive(false);
            this.isActivated = false;
            return; // No activar el boss si ya fue derrotado
        }

        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;

        // Configurar colisiones
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    setupCollisions() {
        // Método abstracto - debe ser implementado por clases hijas
        throw new Error('setupCollisions() debe ser implementado por la clase hija');
    }

    // NUEVO MÉTODO: Resetear todas las colisiones
    resetAllCollisions() {
        this.removeAllColliders();
        this.setupCollisions();
    }

    cleanupAllWarnings() {
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;

            if (typeof currentState.destroyAllWarnings === 'function') {
                currentState.destroyAllWarnings();
            }

            // Limpiar elementos de advertencia comunes
            const warningElements = [
                'warningRect', 'warningBorder', 'warningText',
                'warningCircle', 'waterBall', 'leftWarning',
                'rightWarning', 'warningLine'
            ];

            warningElements.forEach(element => {
                if (currentState[element] && currentState[element].destroy) {
                    currentState[element].destroy();
                }
            });

            // Limpiar flechas si existen
            if (currentState.arrows) {
                currentState.arrows.forEach(arrow => {
                    if (arrow && arrow.destroy) arrow.destroy();
                });
            }
        }
    }

    destroyAllAttackObjects() {
        // Limpiar todos los grupos de ataque
        Object.values(this.attackGroups).forEach(group => {
            if (group && group.clear) {
                group.clear(true, true);
            }
        });

        // Limpiar colisiones específicas
        this.removeAllColliders();
    }

    removeAllColliders() {
        // Eliminar todas las colisiones registradas
        Object.values(this.colliders).forEach(collider => {
            if (collider) {
                this.scene.physics.world.removeCollider(collider);
            }
        });
        this.colliders = {};
    }

    // NUEVO MÉTODO: Registrar colisión para poder gestionarla
    registerCollider(name, collider) {
        this.colliders[name] = collider;
    }

    // Métodos de utilidad para clases hijas
    addAttackGroup(name, group) {
        this.attackGroups[name] = group;
    }

    getAttackGroup(name) {
        return this.attackGroups[name];
    }

    addState(name, state) {
        this.stateMachine.addState(name, state);
    }

    setScaleAndBody(scale, widthDivisor = 35, heightDivisor = 35,
        offsetXDivisor = 9.9, offsetYDivisor = 10.5) {
        this.setScale(scale);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / widthDivisor, spriteHeight / heightDivisor);
        this.body.setOffset(spriteWidth / offsetXDivisor, spriteHeight / offsetYDivisor);
    }
}
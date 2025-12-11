import StateMachine from '../../../stateMachine/StateMachine.js';
import PlayerDataManager from '../../../managers/PlayerDataManager.js';

/**
 * Clase base para todos los jefes del juego
 * @class BaseBoss
 * @extends Phaser.Physics.Arcade.Sprite
 */
export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
    /**
     * Constructor de la clase base del jefe
     * @param {Phaser.Scene} scene - Escena del juego
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Textura del jefe
     * @param {number} frame - Frame inicial de la textura
     * @param {Object} player - Referencia al jugador
     * @param {Object} config - Configuración específica del jefe
     */
    constructor(scene, x, y, texture, frame, player, config) {
        super(scene, x, y, texture, frame);

        this.scene = scene;
        this.player = player;
        this.config = config || {};

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isActivated = false;
        this.notdead = true;
        this.phase = 1;

        // Stats
        this.health = this.config.health || 10;
        this.maxHealth = this.config.maxHealth || 10;
        this.damage = this.config.damage || 1;

        // Cooldowns
        this.startCooldown = this.config.startCooldown || 2000;
        this.attackCooldown = this.config.attackCooldown || 0;
        this.minCooldown = this.config.minCooldown || 1000;
        this.maxCooldown = this.config.maxCooldown || 1500;

        // Grupo único para todos los ataques
        this.bossAttacks = scene.physics.add.group();
        
        // Estados y colisiones
        this.availableStates = this.config.availableStates || [];
        this.stateMachine = new StateMachine(this, 'boss');
        this.bossName = this.config.bossName || '';
        this.Bossdoors = null;
        this.floors = null;
        this.colliders = {};
        this.platforms = null;

        // Configuración inicial
        this.setupDefaultPhysics();
        this.setupInactiveState();
        this.stateMachine.setState('inactive');

        this.setVisible(false);
        this.setActive(false);
    }

    /**
     * Configura la física por defecto del jefe
     */
    setupDefaultPhysics() {
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.body.setSize(this.displayWidth / 35, this.displayHeight / 35);
        this.body.setOffset(this.displayWidth / 9.9, this.displayHeight / 10.5);
        this.body.moves = false;
    }

    /**
     * Configura el estado inactivo del jefe
     */
    setupInactiveState() {
        this.stateMachine.addState('inactive', {
            enter: () => console.log(`${this.constructor.name} inactivo`),
            step: () => {},
            exit: () => {}
        });
    }

    /**
     * Actualiza el jefe en cada frame
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        if (this.notdead && this.isActivated) {
            this.stateMachine.step(time, delta);
        }
    }

    /**
     * Aplica daño al jefe
     * @param {number} damage - Cantidad de daño
     */
    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return;

        this.health -= damage;
        this.applyDamageEffect();

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    /**
     * Aplica efecto visual de daño
     */
    applyDamageEffect() {
        // Aplicar tint a todos los elementos visuales del boss
        const visualElements = [this, this.bossMask, this.leftClaw, this.rightClaw]
            .filter(element => element && element.visible);
        
        visualElements.forEach(element => element.setTint(this.getDamageTintColor()));

        this.scene.tweens.add({
            targets: visualElements,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                visualElements.forEach(element => {
                    element.clearTint();
                    element.setAlpha(1);
                });
            }
        });
    }

    /**
     * Obtiene el color del tint al recibir daño
     * @returns {number} - Color del tint
     */
    getDamageTintColor() {
        return 0xff0000;
    }

    /**
     * Maneja la colisión de cualquier ataque con el jugador
     * @param {Object} player - Jugador
     * @param {Object} attack - Ataque que colisiona
     */
    attackCollisionWithPlayer(player, attack) {
        if (!attack.active || !player.active) return;
        
        const dir = player.x < attack.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        
        // Solo destruir proyectiles, no advertencias
        if (attack.isProjectile !== false && attack.destroy) {
            attack.destroy();
        }
    }

    /**
     * Maneja colisión de ataques con plataformas
     * @param {Object} attack - Ataque
     * @param {Object} platform - Plataforma
     */
    attackCollisionWithPlatform(attack, platform) {
        if (!attack.active || !platform.active) return;
        
        if (attack.isPlatformPunch || attack.destroyOnPlatform) {
            platform.deactivateByPunch?.();
            attack.destroy();
        }
    }

    /**
     * Avanza a la siguiente fase (método abstracto)
     */
    nextPhase() {
        // Debe ser implementado por clases hijas
    }

    /**
     * Inicia un estado aleatorio
     */
    startRandomState() {
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    /**
     * Selecciona el siguiente estado del jefe
     */
    selectNextState() {
        if (!this.isActivated) {
            this.stateMachine.setState('inactive');
            return;
        }
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    /**
     * Genera un nuevo tiempo de cooldown aleatorio
     */
    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    /**
     * Maneja la muerte del jefe
     */
    die() {
        this.notdead = false;
        this.isActivated = false;

        // Limpieza completa
        this.cleanupAllWarnings();
        this.destroyAllAttackObjects();

        if (this.stateMachine?.currentState?.exit) {
            this.stateMachine.currentState.exit(this);
        }

        if (this.stateMachine) {
            this.stateMachine.setState('inactive');
        }

        // Abrir puertas y plataformas
        [this.Bossdoors, this.floors].forEach(group => {
            group?.getChildren().forEach(obj => obj.openDoor?.());
        });

        // Marcar boss como derrotado en PlayerDataManager
        if (this.bossName) {
            PlayerDataManager.killBoss(this.bossName);
        }

        // Emitir evento para actualizar UI
        this.scene.events.emit('bossDefeated');

        // Ocultar todos los elementos visuales
        this.setVisible(false);
        this.setActive(false);
        
        // Limpiar máscara y garras si existen
        this.bossMask?.destroy();
        this.bossMask = null;
        this.destroyClaws();
    }

    /**
     * Asigna puertas y pisos al jefe
     * @param {Phaser.GameObjects.Group} doors - Grupo de puertas
     * @param {Phaser.GameObjects.Group} floors - Grupo de pisos
     */
    getDoors(doors, floors = null) {
        this.Bossdoors = doors;
        this.floors = floors;
    }

    /**
     * Asigna la puerta final
     * @param {Object} finaldoor - Puerta final
     */
    setFinalDoor(finaldoor) {
        this.finaldoor = finaldoor;
    }

    /**
     * Activa el jefe
     */
    setLife() {
        if (this.bossName && PlayerDataManager.data.bossStatus[this.bossName]) {
            console.log(`${this.bossName} ya fue derrotado`);
            this.handleAlreadyDefeated();
            return;
        }

        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;

        this.setupCollisions();
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    /**
     * Maneja el caso cuando el jefe ya fue derrotado
     */
    handleAlreadyDefeated() {
        this.setVisible(false);
        this.setActive(false);
        this.isActivated = false;
        this.bossMask?.setVisible(false);
        this.Bossdoors?.getChildren().forEach(door => door.openDoor?.());
    }

    /**
     * Configura las colisiones del jefe
     */
    setupCollisions() {
        // Colisión jugador-ataques
        if (!this.colliders.attackOverlap) {
            this.registerCollider('attackOverlap', this.scene.physics.add.overlap(
                this.bossAttacks,
                this.player,
                this.attackCollisionWithPlayer,
                null,
                this
            ));
        }

        // Colisión plataformas-ataques (si hay plataformas)
        if (this.platforms && !this.colliders.platformOverlap) {
            this.registerCollider('platformOverlap', this.scene.physics.add.overlap(
                this.bossAttacks,
                this.platforms,
                this.attackCollisionWithPlatform,
                null,
                this
            ));
        }
    }

    /**
     * Resetea todas las colisiones
     */
    resetAllCollisions() {
        this.removeAllColliders();
        this.setupCollisions();
    }

    /**
     * Limpia todas las advertencias visuales
     */
    cleanupAllWarnings() {
        // Limpiar elementos de advertencia del estado actual
        if (this.stateMachine?.currentState) {
            const state = this.stateMachine.currentState;
            state.destroyAllWarnings?.();
            
            // Lista de posibles elementos de advertencia
            const warningElements = [
                'warningRect', 'warningBorder', 'warningText', 'warningCircle',
                'waterBall', 'leftWarning', 'rightWarning', 'warningLine'
            ];
            
            warningElements.forEach(el => state[el]?.destroy?.());
            state.arrows?.forEach(arrow => arrow?.destroy?.());
        }
    }

    /**
     * Destruye todos los objetos de ataque
     */
    destroyAllAttackObjects() {
        this.bossAttacks?.clear(true, true);
        this.removeAllColliders();
    }

    /**
     * Elimina todos los colliders registrados
     */
    removeAllColliders() {
        Object.values(this.colliders).forEach(collider => 
            collider && this.scene.physics.world.removeCollider(collider));
        this.colliders = {};
    }

    /**
     * Registra un collider para gestión posterior
     * @param {string} name - Nombre del collider
     * @param {Phaser.Physics.Arcade.Collider} collider - Collider a registrar
     */
    registerCollider(name, collider) {
        this.colliders[name] = collider;
    }

    /**
     * Agrega un ataque al grupo de ataques
     * @param {Object} attack - Ataque a agregar
     */
    addAttack(attack) {
        this.bossAttacks.add(attack);
    }

    /**
     * Agrega un estado a la máquina de estados
     * @param {string} name - Nombre del estado
     * @param {Object} state - Objeto de estado
     */
    addState(name, state) {
        this.stateMachine.addState(name, state);
    }

    /**
     * Crea garras para el jefe
     * @param {string} texture - Textura de las garras
     * @param {number} scale - Escala de las garras
     * @param {number} offsetX - Offset en X desde la posición del jefe
     */
    createClaws(texture = 'garra', scale = 3.5, offsetX = 380) {
        this.leftClaw = this.scene.physics.add.sprite(this.x - offsetX, this.y - 50, texture);
        this.rightClaw = this.scene.physics.add.sprite(this.x + offsetX, this.y - 50, texture);

        [this.leftClaw, this.rightClaw].forEach(claw => {
            claw.setScale(scale).setDepth(5);
            claw.body.allowGravity = false;
            claw.body.setSize(claw.displayWidth / 3.5, claw.displayHeight / 5.5);
            claw.body.setOffset(0, claw.displayHeight / 20);
            this.addAttack(claw);
        });

        this.clawsActive = true;
    }

    /**
     * Destruye las garras del jefe
     */
    destroyClaws() {
        [this.leftClaw, this.rightClaw].forEach(claw => claw?.destroy());
        this.leftClaw = this.rightClaw = null;
        this.clawsActive = false;
    }

    /**
     * Establece escala y configuración del cuerpo
     * @param {number} scale - Escala del sprite
     * @param {number} widthDivisor - Divisor para el ancho
     * @param {number} heightDivisor - Divisor para el alto
     * @param {number} offsetXDivisor - Divisor para offset X
     * @param {number} offsetYDivisor - Divisor para offset Y
     */
    setScaleAndBody(scale, widthDivisor = 35, heightDivisor = 35,
        offsetXDivisor = 9.9, offsetYDivisor = 10.5) {
        this.setScale(scale);
        this.body.setSize(this.displayWidth / widthDivisor, this.displayHeight / heightDivisor);
        this.body.setOffset(this.displayWidth / offsetXDivisor, this.displayHeight / offsetYDivisor);
    }

    /**
     * Asigna plataformas al jefe
     * @param {Phaser.GameObjects.Group} platforms - Grupo de plataformas
     */
    setPlatforms(platforms) {
        this.platforms = platforms;
        this.setupCollisions();
    }
}
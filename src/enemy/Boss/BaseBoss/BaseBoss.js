import StateMachine from '../../../stateMachine/StateMachine.js';
import PlayerDataManager from '../../../managers/PlayerDataManager.js';

export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
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

    setupDefaultPhysics() {
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        this.body.setSize(this.displayWidth / 35, this.displayHeight / 35);
        this.body.setOffset(this.displayWidth / 9.9, this.displayHeight / 10.5);
        this.body.moves = false;
    }

    setupInactiveState() {
        this.stateMachine.addState('inactive', {
            enter: () => console.log(`${this.constructor.name} inactivo`),
            step: () => {},
            exit: () => {}
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
        this.applyDamageEffect();

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

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

    getDamageTintColor() {
        return 0xff0000;
    }

    // ÚNICO método para TODAS las colisiones de ataques
    attackCollisionWithPlayer(player, attack) {
        if (!attack.active || !player.active) return;
        
        const dir = player.x < attack.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        
        // Solo destruir proyectiles, no advertencias
        if (attack.isProjectile !== false && attack.destroy) {
            attack.destroy();
        }
    }

    // Colisión de ataques con plataformas (opcional)
    attackCollisionWithPlatform(attack, platform) {
        if (!attack.active || !platform.active) return;
        
        if (attack.isPlatformPunch || attack.destroyOnPlatform) {
            platform.deactivateByPunch?.();
            attack.destroy();
        }
    }

    nextPhase() {

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

    // Método base para morir que pueden sobrescribir las clases hijas
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
            group?.getChildren().forEach(obj => obj.abrirPuerta?.());
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

    getDoors(doors, floors = null) {
        this.Bossdoors = doors;
        this.floors = floors;
    }

    setFinalDoor(finaldoor) {
        this.finaldoor = finaldoor;
    }

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

    handleAlreadyDefeated() {
        this.setVisible(false);
        this.setActive(false);
        this.isActivated = false;
        this.bossMask?.setVisible(false);
        this.Bossdoors?.getChildren().forEach(door => door.abrirPuerta?.());
    }

    // Configuración SIMPLIFICADA de colisiones
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

    resetAllCollisions() {
        this.removeAllColliders();
        this.setupCollisions();
    }

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

    destroyAllAttackObjects() {
        this.bossAttacks?.clear(true, true);
        this.removeAllColliders();
    }

    removeAllColliders() {
        Object.values(this.colliders).forEach(collider => 
            collider && this.scene.physics.world.removeCollider(collider));
        this.colliders = {};
    }

    registerCollider(name, collider) {
        this.colliders[name] = collider;
    }

    addAttack(attack) {
        this.bossAttacks.add(attack);
    }

    addState(name, state) {
        this.stateMachine.addState(name, state);
    }

    // Método para crear garras (reutilizable)
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

    destroyClaws() {
        [this.leftClaw, this.rightClaw].forEach(claw => claw?.destroy());
        this.leftClaw = this.rightClaw = null;
        this.clawsActive = false;
    }

    setScaleAndBody(scale, widthDivisor = 35, heightDivisor = 35,
        offsetXDivisor = 9.9, offsetYDivisor = 10.5) {
        this.setScale(scale);
        this.body.setSize(this.displayWidth / widthDivisor, this.displayHeight / heightDivisor);
        this.body.setOffset(this.displayWidth / offsetXDivisor, this.displayHeight / offsetYDivisor);
    }

    setPlatforms(platforms) {
        this.platforms = platforms;
        this.setupCollisions();
    }
}
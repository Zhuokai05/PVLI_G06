import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossAngryCooldownState from './BossAngryState/BossAngryCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        // Cambiar la key inicial a uno de los frames
        super(scene, x, y, 'IraSheet', 0);
        this.scene = scene;
        this.player = player;
        this.x = x;
        this.y = y;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(4.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 35, spriteHeight / 35);
        this.body.setOffset(spriteWidth / 9.9, spriteHeight / 10.5);
        this.body.moves = false;

        this.distanceToFloor = 250;
        // Crear animaciones
        this.createAnimations();

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.fireballSpeed = 450;
        this.punchYSpeed = 1200;
        this.punchXSpeed = 600;

        // Cooldown entre ataques
        this.startCooldown = 2000;
        this.attackCooldown = 0;
        this.minCooldown = 1000;
        this.maxCooldown = 1500;

        // Grupos
        this.fireballs = scene.physics.add.group();
        this.punches = scene.physics.add.group();

        this.platforms = null;

        // Maquina de estados
        this.stateMachine = new StateMachine(this, 'boss');

        // Registrar todos los estados
        this.stateMachine.addState('punch', new BossAngryPunchState());
        this.stateMachine.addState('fireball', new BossAngryFireBallState());
        this.stateMachine.addState('punchPlatform', new BossAngryPunchPlatformState());

        // Estados disponibles por fase
        this.availableStates = ['punch', 'fireball'];

        // Estado especial para cooldown
        this.stateMachine.addState('cooldown', new BossAngryCooldownState());

        // Estado inicial: inactivo
        this.stateMachine.addState('inactive', {
            enter: () => {
                // No hacer nada mientras está inactivo
                console.log('Boss inactivo');
            },
            step: () => {
                // No ejecutar lógica de estado
            },
            exit: () => { }
        });

        // Iniciar en estado inactivo
        this.stateMachine.setState('inactive');

        this.attackCooldown = this.startCooldown;
        this.notdead = true;

        // Iniciar animación
        this.play('bossira_idle');


        this.setVisible(false);
        this.setActive(false);

        // Flag para controlar si está activado
        this.isActivated = false;
    }

    createAnimations() {
        // Animación IDLE
        this.scene.anims.create({
            key: 'bossira_idle',
            // Usamos la key que cargaste en el preload ('IraSheet')
            frames: this.scene.anims.generateFrameNumbers('IraSheet', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        // Animación ATAQUE (Ejemplo con frames específicos salteados)
        this.scene.anims.create({
            key: 'bossira_attack',
            frames: this.scene.anims.generateFrameNumbers('IraSheet', { frames: [3, 4, 5, 0] }),
            frameRate: 12,
            repeat: 0
        });
    }

    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.fireballOverlap) {
            this.fireballOverlap = this.scene.physics.add.overlap(
                this.fireballs,
                this.player,
                this.FireballCollisionWithPlayer,
                null,
                this
            );
        }

        if (!this.punchOverlap) {
            this.punchOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.player,
                this.PunchCollisionWithPlayer,
                null,
                this
            );
        }

        // Configurar colisión entre puños y plataformas de ira
        if (this.platforms && !this.punchPlatformOverlap) {
            this.punchPlatformOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.platforms,
                this.punchCollisionWithPlatform,
                null,
                this
            );
        }
    }

    startRandomState() {
        if (!this.isActivated) return; // No iniciar ataques si no está activado
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        if (!this.isActivated) {
            // Si no está activado, volver al estado inactivo
            this.stateMachine.setState('inactive');
            return;
        }
        // En lugar de cambiar inmediatamente el ataque, entrar en cooldown
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    FireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }

    PunchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }

    update(time, delta) {
        if (this.notdead && this.isActivated) { // Solo actualizar si está vivo y activado
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return; // No recibir daño si no está activado o ya está muerto

        this.health -= damage;
        this.setTint(0xff0000);

        // Parpadeo durante el daño
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

        if (this.health <= 0) this.nextPhase();
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('Boss entra en FASE 2');

            // LIMPIAR WARNINGS ANTES DE LA TRANSICIÓN
            this.cleanupAllWarnings();
            this.destroyAllAttackObjects();

            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Añadir el estado de plataforma a los disponibles
            this.availableStates.push('punchPlatform');

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);
                this.isActivated = true;

                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Reanudar animación
                this.play('bossira_idle');

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }

    die() {
        console.log('Boss derrotado definitivamente');

        // IMPORTANTE: Limpiar todos los warnings y estados activos
        this.cleanupAllWarnings();

        // Desactivar el estado actual si existe
        if (this.stateMachine && this.stateMachine.currentState &&
            this.stateMachine.currentState.exit) {
            this.stateMachine.currentState.exit(this);
        }

        // Cambiar a estado inactivo
        if (this.stateMachine) {
            this.stateMachine.setState('inactive');
        }

        // Código existente...
        this.Bossdoors.getChildren().forEach(door => {
            if (door.abrirPuerta) {
                door.abrirPuerta();
            }
        });

        this.floors.getChildren().forEach(floor => {
            if (floor.abrirPuerta) {
                floor.abrirPuerta();
            }
        });

        PlayerDataManager.killBoss('anger');
        this.scene.events.emit('bossDefeated');

        // Desactivar físicas
        this.setActive(false);
        this.setVisible(false);

        // IMPORTANTE: Destruir todos los objetos de ataque
        this.destroyAllAttackObjects();
    }
    getDoors(iraDoors, iraFloors) {
        this.Bossdoors = iraDoors;
        this.floors = iraFloors;
    }
    setLife() {
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true; // Activar el boss
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    // Método para configurar las plataformas (llamado desde la escena)
    setPlatforms(platforms) {
        this.platforms = platforms;
    }

    // Método para manejar colisión de puño con plataforma
    punchCollisionWithPlatform(punch, platform) {
        if (!punch.active || !platform.active) return;

        // SOLO los puños marcados como platformPunch pueden desactivar plataformas
        if (punch.isPlatformPunch) {
            console.log("Puño vertical detectado - desactivando plataforma");
            if (platform.deactivateByPunch) {
                platform.deactivateByPunch();
            }
            punch.destroy();
        } else {
            // Para puños laterales, solo destruir el puño pero NO desactivar la plataforma
            console.log("Puño lateral detectado - solo destruyendo puño");
        }
    }

    cleanupAllWarnings() {
        // Si hay un estado actual activo, llamar a su método de limpieza
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;

            // Llamar a métodos específicos de limpieza si existen
            if (typeof currentState.destroyAllWarnings === 'function') {
                currentState.destroyAllWarnings();
            }

            // También intentar limpiar warnings directamente
            if (currentState.warningRect && currentState.warningRect.destroy) {
                currentState.warningRect.destroy();
            }
            if (currentState.warningBorder && currentState.warningBorder.destroy) {
                currentState.warningBorder.destroy();
            }
            if (currentState.warningText && currentState.warningText.destroy) {
                currentState.warningText.destroy();
            }
            if (currentState.arrows) {
                currentState.arrows.forEach(arrow => {
                    if (arrow && arrow.destroy) arrow.destroy();
                });
            }
        }
    }

    destroyAllAttackObjects() {
        // Destruir todos los fireballs activos
        if (this.fireballs) {
            this.fireballs.clear(true, true);
        }

        // Destruir todos los punches activos
        if (this.punches) {
            this.punches.clear(true, true);
        }
    }
}
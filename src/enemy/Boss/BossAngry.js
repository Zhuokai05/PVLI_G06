import BaseBoss from './BaseBoss/BaseBoss.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossAngryCooldownState from './BossAngryState/BossAngryCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

/**
 * Jefe de la emoción Ira
 * @class BossAngry
 * @extends BaseBoss
 */
export default class BossAngry extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 1000,
            maxCooldown: 1500,
            availableStates: ['punch', 'fireball'],
            bossName: 'anger'
        };

        super(scene, x, y, 'IraSheet', 0, player, config);

        this.x = x;
        this.y = y;

        // Configuración específica de BossAngry
        this.setScaleAndBody(4.3);
        this.distanceToFloor = 250;

        // Velocidades de ataques
        this.fireballSpeed = 450;
        this.punchYSpeed = 1200;
        this.punchXSpeed = 600;

        // Plataformas
        this.platforms = null;

        // Inicializar grupos de ataque
        this.fireballs = scene.physics.add.group();
        this.punches = scene.physics.add.group();
        this.addAttackGroup('fireballs', this.fireballs);
        this.addAttackGroup('punches', this.punches);

        // Crear animaciones
        this.createAnimations();

        // Configurar estados específicos
        this.setupStates();

        // Iniciar animación
        this.play('bossira_idle');
    }

    /**
     * Crea las animaciones del jefe Ira
     */
    createAnimations() {
        // Animación IDLE
        if (!this.scene.anims.exists('bossira_idle')) {
            // Animación IDLE
            this.scene.anims.create({
                key: 'bossira_idle',
                // Usamos la key que cargaste en el preload ('IraSheet')
                frames: this.scene.anims.generateFrameNumbers('IraSheet', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('bossira_attack')) {
            // Animación ATAQUE (Ejemplo con frames específicos salteados)
            this.scene.anims.create({
                key: 'bossira_attack',
                frames: this.scene.anims.generateFrameNumbers('IraSheet', { frames: [3, 4, 5, 0] }),
                frameRate: 12,
                repeat: 0
            });
        }
        if (!this.scene.anims.exists('fireball_move')) {
            this.scene.anims.create({
                key: 'fireball_move',
                // Asegúrate que 'fireball_sheet' es el nombre que usaste en el PRELOAD
                frames: this.scene.anims.generateFrameNumbers('fireballsheet', { start: 0, end: 31 }),
                frameRate: 20,
                repeat: -1
            });
        }
    }

    /**
     * Configura los estados específicos del jefe Ira
     */
    setupStates() {
        // Registrar estados específicos
        this.addState('punch', new BossAngryPunchState());
        this.addState('fireball', new BossAngryFireBallState());
        this.addState('punchPlatform', new BossAngryPunchPlatformState());
        this.addState('cooldown', new BossAngryCooldownState());
    }

    /**
     * Configura las colisiones específicas del jefe Ira
     */
    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.colliders.fireballOverlap) {
            const fireballOverlap = this.scene.physics.add.overlap(
                this.fireballs,
                this.player,
                this.FireballCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('fireballOverlap', fireballOverlap);
        }

        if (!this.colliders.punchOverlap) {
            const punchOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.player,
                this.PunchCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('punchOverlap', punchOverlap);
        }

        // Configurar colisión entre puños y plataformas de ira
        if (this.platforms && !this.colliders.punchPlatformOverlap) {
            const punchPlatformOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.platforms,
                this.punchCollisionWithPlatform,
                null,
                this
            );
            this.registerCollider('punchPlatformOverlap', punchPlatformOverlap);
        }
    }

    /**
     * Maneja la colisión de fireball con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} fireball - Fireball
     */
    FireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }

    /**
     * Maneja la colisión de puño con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} punch - Puño
     */
    PunchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }

    /**
     * Avanza a la siguiente fase del jefe Ira
     */
    nextPhase() {
        if (this.phase === 1) {
            console.log('Boss entra en FASE 2');

            // Limpiar antes de la transición
            this.cleanupAllWarnings();
            this.destroyAllAttackObjects();

            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Añadir nuevo estado en fase 2
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

                // CORRECCIÓN: Restablecer las colisiones con las plataformas
                this.resetAllCollisions();

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

    /**
     * Maneja la muerte definitiva del jefe Ira
     */
    die() {
        console.log('Boss derrotado definitivamente');

        // Llama al método die de BaseBoss primero
        super.die();

        // Completar acciones específicas de BossAngry

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

        super.die();

        PlayerDataManager.killBoss('anger');
        this.scene.events.emit('bossDefeated');
    }

    /**
     * Asigna puertas y pisos específicos para Ira
     * @param {Phaser.GameObjects.Group} iraDoors - Puertas de ira
     * @param {Phaser.GameObjects.Group} iraFloors - Pisos de ira
     */
    getDoors(iraDoors, iraFloors) {
        this.Bossdoors = iraDoors;
        this.floors = iraFloors;
    }

    /**
     * Activa el jefe Ira y verifica si ya fue derrotado
     */
    setLife() {
        // Verificar si el boss ya fue derrotado
        if (PlayerDataManager.data.bossStatus.anger) {
            console.log('Boss Anger ya derrotado, no se activará');
            this.setVisible(false);
            this.setActive(false);
            this.isActivated = false;

            // Abrir puertas automáticamente si ya fue derrotado
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

            return;
        }

        // Si no ha sido derrotado, activar normalmente
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    /**
     * Asigna la puerta final
     * @param {Object} finaldoor - Puerta final
     */
    setFinalDoor(finaldoor) {
        this.finaldoor = finaldoor
    }

    /**
     * Configura las plataformas específicas para Ira
     * @param {Phaser.GameObjects.Group} platforms - Plataformas
     */
    setPlatforms(platforms) {
        this.platforms = platforms;
    }

    /**
     * Maneja la colisión de puño con plataforma
     * @param {Phaser.GameObjects.Sprite} punch - Puño
     * @param {Phaser.GameObjects.Sprite} platform - Plataforma
     */
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

    /**
     * Elimina todos los colliders específicos de Ira
     */
    removeAllColliders() {
        // Llama al método base para eliminar colisiones registradas
        super.removeAllColliders();

        // Resetear referencias específicas si es necesario
        this.colliders = {};
    }

    /**
     * Obtiene el color del tint para el daño de Ira
     * @returns {number} - Color rojo
     */
    getDamageTintColor() {
        return 0xff0000; // Rojo para Ira
    }
}
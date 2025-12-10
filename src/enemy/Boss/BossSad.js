import BaseBoss from './BaseBoss/BaseBoss.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import BossSadCooldownState from './BossSadState/BossSadCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

/**
 * Jefe de la emoción Tristeza
 * @class BossSad
 * @extends BaseBoss
 */
export default class BossSad extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 2000,
            maxCooldown: 2500,
            availableStates: ['radial', 'waterball'],
            bossName: 'sadness'
        };

        super(scene, x, y, 'tristeza', undefined, player, config);

        this.x = x;
        this.y = y;

        // Configuración específica de BossSad
        this.setScaleAndBody(3.8, 35, 35, 8.9, 12);
        this.distanceToFloor = 250;

        // Velocidades de ataques
        this.icicleSpeed = 900;
        this.waterBallSpeed = 200;
        this.radialSpeed = 400;

        // Inicializar grupos de ataque
        this.icicles = scene.physics.add.group();
        this.waterBalls = scene.physics.add.group();
        this.radialIcicles = scene.physics.add.group();

        this.addAttackGroup('icicles', this.icicles);
        this.addAttackGroup('waterBalls', this.waterBalls);
        this.addAttackGroup('radialIcicles', this.radialIcicles);

        // Configurar estados específicos
        this.setupStates();
    }

    playIntro() {
        this.setVisible(true);
        this.setActive(true);
        this.setLife();
        this.scene.events.emit('bossIntroFinished');
    }

    /**
     * Configura los estados específicos del jefe Tristeza
     */
    setupStates() {
        // Registrar estados específicos
        this.addState('icicle', new BossSadIcicleState());
        this.addState('radial', new BossSadRadialState());
        this.addState('waterball', new BossSadWaterBallState());
        this.addState('cooldown', new BossSadCooldownState());
    }

    /**
     * Configura las colisiones específicas del jefe Tristeza
     */
    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.colliders.icicleOverlap) {
            const icicleOverlap = this.scene.physics.add.overlap(
                this.icicles,
                this.player,
                this.icicleCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('icicleOverlap', icicleOverlap);
        }

        if (!this.colliders.waterBallOverlap) {
            const waterBallOverlap = this.scene.physics.add.overlap(
                this.waterBalls,
                this.player,
                this.waterBallCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('waterBallOverlap', waterBallOverlap);
        }

        if (!this.colliders.radialIcicleOverlap) {
            const radialIcicleOverlap = this.scene.physics.add.overlap(
                this.radialIcicles,
                this.player,
                this.radialIcicleCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('radialIcicleOverlap', radialIcicleOverlap);
        }
    }

    /**
     * Maneja la colisión de icicle con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} icicle - Icicle
     */
    icicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }

    /**
     * Maneja la colisión de water ball con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} waterBall - Water ball
     */
    waterBallCollisionWithPlayer(player, waterBall) {
        if (!waterBall.active || !player.active) return;
        const dir = player.x < waterBall.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        waterBall.destroy();
    }

    /**
     * Maneja la colisión de icicle radial con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} icicle - Icicle radial
     */
    radialIcicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }

    /**
     * Obtiene el color del tint para el daño de Tristeza
     * @returns {number} - Color azul
     */
    getDamageTintColor() {
        return 0x0000ff; // Azul para Tristeza
    }

    /**
     * Avanza a la siguiente fase del jefe Tristeza
     */
    nextPhase() {
        console.log(`BossSad fase actual: ${this.phase}, salud: ${this.health}`);

        if (this.phase === 1) {
            console.log('BossSad entra en FASE 2');

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
            this.availableStates.push('icicle');
            console.log('Estados disponibles en fase 2:', this.availableStates);

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 50, 50, 255); // Azul para tristeza

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossSad para fase 2');

                this.setActive(true);
                this.setVisible(true);
                this.isActivated = true;

                // CORRECCIÓN: Restablecer todas las colisiones
                this.resetAllCollisions();

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');

                console.log('BossSad fase 2 activado y listo para atacar');
            });
        } else {
            console.log('BossSad derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }

    /**
     * Maneja la muerte definitiva del jefe Tristeza
     */
    die() {
        console.log('BossSad muere');

        // Llama al método die de BaseBoss primero
        super.die();

        // Completar acciones específicas de BossSad
        if (this.scene.PlayerDataManager) {
            this.scene.PlayerDataManager.killBoss('sadness');
        }
        this.scene.events.emit('bossDefeated');

        console.log('BossSad eliminado del registro');
    }

    /**
     * Asigna puertas y pisos específicos para Tristeza
     * @param {Phaser.GameObjects.Group} iceDoors - Puertas de hielo
     * @param {Phaser.GameObjects.Group} iceFloors - Pisos de hielo
     */
    getDoors(iceDoors, iceFloors) {
        this.Bossdoors = iceDoors;
        this.floors = iceFloors;
        console.log('Puertas y pisos asignados a BossSad');
    }

    /**
     * Activa el jefe Tristeza y verifica si ya fue derrotado
     */
    setLife() {
        if (this.scene.PlayerDataManager.data.bossStatus && this.scene.PlayerDataManager.data.bossStatus.sadness) {
            this.setVisible(false);
            this.setActive(false);
            this.isActivated = false;

            if (this.Bossdoors) {
                this.Bossdoors.getChildren().forEach(door => {
                    if (door.abrirPuerta) {
                        door.abrirPuerta();
                    }
                });
            }

            return;
        }
        console
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;

        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');

        console.log('BossSad activado, vida:', this.health);
    }

    /**
     * Asigna la puerta final
     * @param {Object} finaldoor - Puerta final
     */
    setFinalDoor(finaldoor) {
        this.finaldoor = finaldoor
    }

    /**
     * Limpia todas las advertencias visuales específicas de Tristeza
     */
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
            if (currentState.warningCircle && currentState.warningCircle.destroy) {
                currentState.warningCircle.destroy();
            }
            if (currentState.warningBorder && currentState.warningBorder.destroy) {
                currentState.warningBorder.destroy();
            }
            if (currentState.waterBall && currentState.waterBall.destroy) {
                currentState.waterBall.destroy();
            }
        }
    }

    /**
     * Limpia los objetos de ataque activos de Tristeza
     */
    clearActiveAttackObjects() {
        // Solo limpiar objetos activos, mantener los grupos
        if (this.icicles) {
            this.icicles.clear(true, true);
        }

        if (this.waterBalls) {
            this.waterBalls.clear(true, true);
        }

        if (this.radialIcicles) {
            this.radialIcicles.clear(true, true);
        }
    }

    /**
     * Destruye todos los objetos de ataque específicos de Tristeza
     */
    destroyAllAttackObjects() {
        // Limpiar objetos activos primero
        this.clearActiveAttackObjects();

        // Luego llama al método base
        super.destroyAllAttackObjects();
    }

    /**
     * Elimina todos los colliders específicos de Tristeza
     */
    removeAllColliders() {
        // Llama al método base primero
        super.removeAllColliders();

        // Resetear referencias específicas si es necesario
        this.colliders = {};
    }

    /**
     * Destruye una water ball específica
     * @param {Phaser.GameObjects.Sprite} waterBall - Water ball a destruir
     */
    destroyWaterBall(waterBall) {
        if (waterBall && waterBall.active) {
            waterBall.destroy();
        }
    }
}
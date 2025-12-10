import BaseBoss from './BaseBoss/BaseBoss.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossFearCooldownState from './BossFearState/BossFearCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

/**
 * Jefe de la emoción Miedo
 * @class BossFear
 * @extends BaseBoss
 */
export default class BossFear extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 3000,
            minCooldown: 1500,
            maxCooldown: 2500,
            availableStates: ['xAttack'],
            bossName: 'fear'
        };

        super(scene, x, y, 'corazon', undefined, player, config);

        this.x = x;
        this.y = y;

        // Configuración específica de BossFear
        this.setCustomBodySize(4.3);

        // Velocidades de ataques
        this.cupSpeed = 450;

        // Estado de las garras
        this.clawsActive = false;
        this.leftClaw = null;
        this.rightClaw = null;

        // Inicializar grupos de ataque
        this.cups = scene.physics.add.group();
        this.addAttackGroup('cups', this.cups);

        // Crear partes del boss
        this.createBossParts();

        // Configurar estados específicos
        this.setupStates();
    }

    /**
     * Configura el tamaño personalizado del cuerpo para BossFear
     * @param {number} scale - Escala del sprite
     */
    setCustomBodySize(scale) {
        this.setScale(scale);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 6.5, spriteHeight / 5);
        this.body.setOffset(spriteWidth / 25, spriteHeight / 30);
        this.body.moves = false;
    }

    /**
     * Crea las partes adicionales del boss (máscara)
     */
    createBossParts() {
        // Crear máscara (sin colisión, arriba del corazón)
        this.bossMask = this.scene.add.image(this.x, this.y - 200, 'mascara');
        this.bossMask.setScale(4.3);
        this.bossMask.setDepth(6);
        this.bossMask.setVisible(false);
    }

    /**
     * Configura los estados específicos del jefe Miedo
     */
    setupStates() {
        // Registrar estados específicos
        this.addState('xAttack', new BossFearXAttackState());
        this.addState('cupAttack', new BossFearCupAttackState());
        this.addState('cooldown', new BossFearCooldownState());
    }

    /**
     * Configura las colisiones específicas del jefe Miedo
     */
    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.colliders.cupOverlap) {
            const cupOverlap = this.scene.physics.add.overlap(
                this.cups,
                this.player,
                this.cupCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('cupOverlap', cupOverlap);
        }
    }

    /**
     * Maneja la colisión de copa con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} cup - Copa
     */
    cupCollisionWithPlayer(player, cup) {
        if (!cup.active || !player.active) return;
        const dir = player.x < cup.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        cup.destroy();
    }

    /**
     * Actualiza la posición de las partes del boss
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        // Llama al update base
        super.update(time, delta);

        // Actualizar posición de la máscara para que siga al corazón
        if (this.bossMask && this.bossMask.visible) {
            this.bossMask.setPosition(this.x, this.y - 200);
        }
    }

    /**
     * Obtiene el color del tint para el daño de Miedo
     * @returns {number} - Color rojo
     */
    getDamageTintColor() {
        return 0xff0000; // Rojo para Miedo
    }

    /**
     * Aplica daño al jefe incluyendo la máscara
     * @param {number} damage - Cantidad de daño
     */
    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return;

        this.health -= damage;

        // Aplicar tint a ambos: el corazón y la máscara
        this.setTint(this.getDamageTintColor());
        if (this.bossMask) this.bossMask.setTint(this.getDamageTintColor());

        this.scene.tweens.add({
            targets: [this, this.bossMask],
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                if (this.bossMask) this.bossMask.clearTint();
                this.setAlpha(1);
                if (this.bossMask) this.bossMask.setAlpha(1);
            }
        });

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    /**
     * Avanza a la siguiente fase del jefe Miedo
     */
    nextPhase() {
        if (this.phase === 1) {
            console.log('BossFear entra en FASE 2');

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
            this.availableStates.push('cupAttack');

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            if (this.bossMask) this.bossMask.setVisible(false);

            // Ocultar garras si están activas
            this.destroyClaws();

            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);
                this.isActivated = true;
                if (this.bossMask) this.bossMask.setVisible(true);

                // CORRECCIÓN: Restablecer todas las colisiones
                this.resetAllCollisions();

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: [this, this.bossMask],
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            console.log('BossFear derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            if (this.bossMask) this.bossMask.setVisible(false);
            this.die();
        }
    }

    /**
     * Maneja la muerte definitiva del jefe Miedo
     */
    die() {
        console.log('BossFear derrotado definitivamente');

        // Llama al método die de BaseBoss primero
        super.die();

        // Completar acciones específicas de BossFear
        PlayerDataManager.killBoss('fear');
        this.scene.events.emit('bossDefeated');
    }

    /**
     * Crea las garras del jefe Miedo
     */
    createClaws() {
        // Crear garras izquierda y derecha usando coordenadas del mundo
        this.leftClaw = this.scene.physics.add.sprite(this.x - 380, this.y - 50, 'garra');
        this.rightClaw = this.scene.physics.add.sprite(this.x + 380, this.y - 50, 'garra');

        this.leftClaw.setScale(3.5);
        this.rightClaw.setScale(3.5);
        this.leftClaw.setDepth(5);
        this.rightClaw.setDepth(5);
        this.leftClaw.body.allowGravity = false;
        this.rightClaw.body.allowGravity = false;

        // Configurar colisiones para las garras
        this.leftClaw.body.setSize(this.leftClaw.displayWidth / 3.5, this.leftClaw.displayHeight / 5.5);
        this.leftClaw.body.setOffset(0, this.leftClaw.displayHeight / 20);

        this.rightClaw.body.setSize(this.rightClaw.displayWidth / 3.5, this.rightClaw.displayHeight / 5.5);
        this.rightClaw.body.setOffset(0, this.rightClaw.displayHeight / 20);

        this.clawsActive = true;

        console.log(`Garras creadas en: left(${this.leftClaw.x}, ${this.leftClaw.y}), right(${this.rightClaw.x}, ${this.rightClaw.y})`);
    }

    /**
     * Destruye las garras del jefe
     */
    destroyClaws() {
        if (this.leftClaw) {
            this.leftClaw.destroy();
            this.leftClaw = null;
        }
        if (this.rightClaw) {
            this.rightClaw.destroy();
            this.rightClaw = null;
        }
        this.clawsActive = false;
    }

    /**
     * Limpia todas las advertencias visuales específicas de Miedo
     */
    cleanupAllWarnings() {
        // Primero llama al método base
        super.cleanupAllWarnings();

        // Luego añade limpieza específica para estados de BossFear
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;

            // Limpiar elementos específicos de BossFear
            const bossFearElements = ['leftWarning', 'rightWarning'];

            bossFearElements.forEach(element => {
                if (currentState[element] && currentState[element].destroy) {
                    currentState[element].destroy();
                }
            });

            // Limpiar garras si existen
            this.destroyClaws();
        }
    }

    /**
     * Limpia los objetos de ataque activos de Miedo
     */
    clearActiveAttackObjects() {
        // Solo limpiar objetos activos, mantener los grupos
        if (this.cups) {
            this.cups.clear(true, true);
        }

        // Limpiar garras
        this.destroyClaws();
    }

    /**
     * Destruye todos los objetos de ataque específicos de Miedo
     */
    destroyAllAttackObjects() {
        // Limpiar objetos activos primero
        this.clearActiveAttackObjects();

        // Luego llama al método base
        super.destroyAllAttackObjects();
    }

    /**
     * Elimina todos los colliders específicos de Miedo
     */
    removeAllColliders() {
        // Llama al método base primero
        super.removeAllColliders();

        // Resetear referencias específicas si es necesario
        this.colliders = {};
    }

    /**
     * Asigna puertas específicas para Miedo
     * @param {Phaser.GameObjects.Group} doors - Puertas del boss
     */
    getDoors(doors) {
        this.Bossdoors = doors;
    }

    /**
     * Activa el jefe Miedo y maneja la máscara
     */
    setLife() {
        console.log('Activando BossFear');

        // Verificar si el boss ya fue derrotado
        if (PlayerDataManager.data.bossStatus.fear) {
            console.log('Boss Fear ya derrotado, no se activará');
            this.setVisible(false);
            this.setActive(false);
            this.isActivated = false;

            // Ocultar máscara también
            if (this.bossMask) {
                this.bossMask.setVisible(false);
                this.bossMask.setActive(false);
            }

            // Abrir puertas automáticamente si ya fue derrotado
            if (this.Bossdoors) {
                this.Bossdoors.getChildren().forEach(door => {
                    if (door.abrirPuerta) {
                        door.abrirPuerta();
                    }
                });
            }

            return;
        }

        // Si no ha sido derrotado, activar normalmente
        super.setLife();

        // Mostrar máscara
        if (this.bossMask) {
            this.bossMask.setVisible(true);
        }
    }

    /**
     * Establece la visibilidad del jefe y su máscara
     * @param {boolean} value - Valor de visibilidad
     */
    setVisible(value) {
        super.setVisible(value);
        if (this.bossMask) {
            this.bossMask.setVisible(value);
        }
    }

    /**
     * Establece la actividad del jefe y su máscara
     * @param {boolean} value - Valor de actividad
     */
    setActive(value) {
        super.setActive(value);
        if (this.bossMask) {
            this.bossMask.setActive(value);
        }
    }
}
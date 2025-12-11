import BaseBoss from './BaseBoss/BaseBoss.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossFearCooldownState from './BossFearState/BossFearCooldownState.js';

/**
 * Jefe de la emoción Miedo
 * @class BossFear
 * @extends BaseBoss
 */
export default class BossFear extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'corazon', undefined, player, {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 3000,
            minCooldown: 1500,
            maxCooldown: 2500,
            availableStates: ['xAttack'],
            bossName: 'fear'
        });

        this.setScaleAndBody(4.3, 6.5, 5, 25, 30);
        this.cupSpeed = 450;

        // Crear máscara
        this.bossMask = this.scene.add.image(x, y - 200, 'mascara')
            .setScale(4.3).setDepth(6).setVisible(false);

        this.setupStates();
    }

    /**
     * Configura los estados específicos del jefe Miedo
     */
    setupStates() {
        this.addState('xAttack', new BossFearXAttackState());
        this.addState('cupAttack', new BossFearCupAttackState());
        this.addState('cooldown', new BossFearCooldownState());
    }

    /**
     * Reproduce la intro del jefe Miedo
     */
    playIntro() {
        this.setVisible(true).setActive(true);
        this.bossMask?.setVisible(true);

        this.scene.cameras.main.shake(3000, 0.05);

        // sonido risa
        this?.fearLaughSound?.play();

        this.scene.time.delayedCall(1500, () => {
            this.setLife();
            this.scene.events.emit('bossIntroFinished');
        });
    }

    /**
     * Avanza a la siguiente fase del jefe Miedo
     */
    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth + 3;
            this.availableStates.push('cupAttack');

            this.handlePhaseTransition();
        } else {
            this.die();
        }
    }

    /**
     * Maneja la transición entre fases del jefe Miedo
     */
    handlePhaseTransition() {
        this.cleanupAllWarnings();
        this.destroyAllAttackObjects();
        this.stateMachine?.setState('inactive');

        this.setActive(false);
        this.setVisible(false);
        this.isActivated = false;
        this.bossMask?.setVisible(false);
        this.destroyClaws();

        this.scene.cameras.main.shake(800, 0.02).flash(500, 255, 50, 0);

        this.scene.time.delayedCall(2000, () => {
            this.setActive(true).setVisible(true);
            this.isActivated = true;
            this.bossMask?.setVisible(true);
            this.resetAllCollisions();

            const visualElements = [this];
            if (this.bossMask) visualElements.push(this.bossMask);

            // sonido risa
            this?.fearLaughSound?.play();

            visualElements.forEach(obj => {
                obj.setAlpha(0);
                this.scene.tweens.add({
                    targets: obj,
                    alpha: 1,
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });
            });

            this.generateNewCooldown();
            this.stateMachine.setState('cooldown');
        });
    }

    /**
     * Actualiza la posición de la máscara
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        super.update(time, delta);

        // Actualizar posición de la máscara
        if (this.bossMask?.visible) {
            this.bossMask.setPosition(this.x, this.y - 200);
        }
    }

    /**
     * Obtiene el color del tint para el daño de Miedo
     * @returns {number} - Color rojo
     */
    getDamageTintColor() {
        return 0xff0000;
    }
}
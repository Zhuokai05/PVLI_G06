import BaseBoss from './BaseBoss/BaseBoss.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import BossSadCooldownState from './BossSadState/BossSadCooldownState.js';

/**
 * Jefe de la emoción Tristeza
 * @class BossSad
 * @extends BaseBoss
 */
export default class BossSad extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tristeza', undefined, player, {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 2000,
            maxCooldown: 2500,
            availableStates: ['radial', 'waterball'],
            bossName: 'sadness'
        });

        this.setScaleAndBody(3.8, 35, 35, 8.9, 12);
        
        // Velocidades específicas
        this.icicleSpeed = 900;
        this.waterBallSpeed = 200;
        this.radialSpeed = 400;
        this.distanceToFloor = 250;

        this.setupStates();
    }

    /**
     * Reproduce la intro del jefe Tristeza
     */
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
        this.addState('icicle', new BossSadIcicleState());
        this.addState('radial', new BossSadRadialState());
        this.addState('waterball', new BossSadWaterBallState());
        this.addState('cooldown', new BossSadCooldownState());
    }

    /**
     * Obtiene el color del tint para el daño de Tristeza
     * @returns {number} - Color azul
     */
    getDamageTintColor() {
        return 0x0000ff;
    }

    /**
     * Avanza a la siguiente fase del jefe Tristeza
     */
    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth + 3;
            this.availableStates.push('icicle');
            
            this.handlePhaseTransition();
        } else {
            this.die();
        }
    }

    /**
     * Maneja la transición entre fases del jefe Tristeza
     */
    handlePhaseTransition() {
        this.cleanupAllWarnings();
        this.destroyAllAttackObjects();
        this.stateMachine?.setState('inactive');

        this.setActive(false).setVisible(false);
        this.isActivated = false;
        
        this.scene.cameras.main.shake(800, 0.02).flash(500, 50, 50, 255);

        this.scene.time.delayedCall(2000, () => {
            this.setActive(true).setVisible(true);
            this.isActivated = true;
            this.resetAllCollisions();

            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 800,
                ease: 'Sine.easeInOut'
            });

            this.generateNewCooldown();
            this.stateMachine.setState('cooldown');
        });
    }
}
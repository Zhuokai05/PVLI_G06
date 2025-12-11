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
        super(scene, x, y, 'SadnessSheet', 0, player, {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 2000,
            maxCooldown: 2500,
            availableStates: ['radial', 'waterball'],
            bossName: 'sadness'
        });

        this.setScaleAndBody(3.8, 30, 30, 10.5, 8);

        // Velocidades específicas
        this.icicleSpeed = 900;
        this.waterBallSpeed = 200;
        this.radialSpeed = 400;
        this.distanceToFloor = 250;

        this.createAnimations();
        this.setupStates();
        this.play('bosssadness_idle');
    }

    /**
     * Crea las animaciones del jefe Tristeza
     */
    createAnimations() {
        const anims = this.scene.anims;

        const animations = [
            { key: 'bosssadness_idle', texture: 'SadnessSheet', start: 0, end: 2, fps: 8, repeat: -1 },
            { key: 'bosssadness_attack', texture: 'SadnessSheet', start: 2, end: 9, fps: 8, repeat: 0 },
        ];

        animations.forEach(config => {
            if (!anims.exists(config.key)) {
                anims.create({
                    key: config.key,
                    frames: anims.generateFrameNumbers(config.texture, { start: config.start, end: config.end }),
                    frameRate: config.fps,
                    repeat: config.repeat
                });
            }
        });
    }

    /**
     * Reproduce la intro del jefe Tristeza
     */
    playIntro() {
        this.setVisible(true).setActive(true);
        this.play({ key: 'bosssadness_idle', repeat: 3 });

        this.once('animationcomplete', () => {
            this.play({ key: 'bosssadness_attack', repeat: 0 });
            this.scene.time.delayedCall(800, () => {
                this.scene.cameras.main.shake(2500, 0.05);
                this.once('animationcomplete', () => {
                    this.play({ key: 'bosssadness_attack', repeat: 1 });

                    // Risa en la intro
                    this?.sadLaughSound?.play();

                    this.once('animationcomplete', () => {
                        super.setLife();
                        this.scene.events.emit('bossIntroFinished');
                    });
                });
            });
        });
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
            this.isActivated = false;
            this.resetAllCollisions();

            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 800,
                ease: 'Sine.easeInOut'
            });

            // Risa en la intro
            this.play({ key: 'bosssadness_idle', repeat: 3 });
            this?.sadLaughSound?.play();

            this.once('animationcomplete', () => {
                this.play({ key: 'bosssadness_attack', repeat: 0 });
                this.scene.time.delayedCall(800, () => {
                    this.scene.cameras.main.shake(2500, 0.1);
                    this.once('animationcomplete', () => {
                        this.play({ key: 'bosssadness_attack', repeat: 1 });

                        this.once('animationcomplete', () => {
                            this.isActivated = true;
                            this.generateNewCooldown();
                            this.stateMachine.setState('cooldown');
                        });
                    });
                });
            });
        });
    }
}
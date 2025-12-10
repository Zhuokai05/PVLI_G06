import BaseBoss from './BaseBoss/BaseBoss.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossAngryCooldownState from './BossAngryState/BossAngryCooldownState.js';

export default class BossAngry extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'IraSheet', 0, player, {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 1000,
            maxCooldown: 1500,
            availableStates: ['punch', 'fireball'],
            bossName: 'anger'
        });

        this.setScaleAndBody(4.3);
        this.distanceToFloor = 250;
        this.fireballSpeed = 450;
        this.punchYSpeed = 1200;
        this.punchXSpeed = 600;

        this.createAnimations();
        this.setupStates();
        this.play('bossira_idle');
    }

    createAnimations() {
        const anims = this.scene.anims;
        
        const animations = [
            { key: 'bossira_idle', frames: { start: 0, end: 6 }, frameRate: 12, repeat: -1 },
            { key: 'bossira_attack', frames: { start: 7, end: 14 }, frameRate: 12, repeat: 0 },
            { key: 'fireball_move', frames: { start: 0, end: 31 }, frameRate: 20, repeat: -1 }
        ];

        animations.forEach(({ key, frames, frameRate, repeat }) => {
            if (!anims.exists(key)) {
                anims.create({
                    key,
                    frames: anims.generateFrameNumbers(key.includes('fireball') ? 'fireballsheet' : 'IraSheet', frames),
                    frameRate,
                    repeat
                });
            }
        });
    }

    playIntro() {
        this.setVisible(true).setActive(true);
        this.play({ key: 'bossira_idle', repeat: 3 });
        
        this.once('animationcomplete', () => {
            this.scene.cameras.main.shake(2500, 0.05);
            this.play({ key: 'bossira_attack', repeat: 3 });
            
            this.once('animationcomplete', () => {
                super.setLife();
                this.scene.events.emit('bossIntroFinished');
            });
        });
    }

    setupStates() {
        this.addState('punch', new BossAngryPunchState());
        this.addState('fireball', new BossAngryFireBallState());
        this.addState('punchPlatform', new BossAngryPunchPlatformState());
        this.addState('cooldown', new BossAngryCooldownState());
    }

    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth * 1.5;
            this.availableStates.push('punchPlatform');
            
            this.handlePhaseTransition();
        } else {
            this.die();
        }
    }

    handlePhaseTransition() {
        this.cleanupAllWarnings();
        this.destroyAllAttackObjects();
        this.stateMachine?.setState('inactive');

        this.setActive(false).setVisible(false);
        this.isActivated = false;
        
        this.scene.cameras.main.shake(800, 0.02).flash(500, 255, 50, 0);

        this.scene.time.delayedCall(2000, () => {
            this.setVisible(true).setActive(true);
            this.resetAllCollisions();

            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 800,
                ease: 'Sine.easeInOut'
            });

            this.play({ key: 'bossira_idle', repeat: 3 });
            this.once('animationcomplete', () => {
                this.scene.cameras.main.shake(3000, 0.1);
                this.play({ key: 'bossira_attack', repeat: 3 });
                this.once('animationcomplete', () => {
                    this.isActivated = true;
                    this.generateNewCooldown();
                    this.stateMachine.setState('cooldown');
                });
            });
        });
    }

    getDamageTintColor() {
        return 0xff0000;
    }
}
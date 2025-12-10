import BaseBoss from './BaseBoss/BaseBoss.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import FinalBossCooldownState from './BossFinalState/BossFinalCooldownState.js';

export default class FinalBoss extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'final', undefined, player, {
            health: 1,
            maxHealth: 1,
            damage: 1,
            startCooldown: 1500,
            minCooldown: 800,
            maxCooldown: 1000,
            availableStates: [],
            bossName: 'final'
        });
        
        this.setScaleAndBody(2.5, 18, 18, 6, 6.5);
        
        // Configuraciones de velocidad
        Object.assign(this, {
            fireballSpeed: 450,
            punchYSpeed: 1000,
            punchXSpeed: 600,
            cupSpeed: 450,
            icicleSpeed: 450,
            waterBallSpeed: 200,
            distanceToFloor: 250
        });
        
        this.allStates = [
            'fireball', 'punch', 'punchPlatform',
            'xAttack', 'cupAttack',
            'icicle', 'radial', 'waterball'
        ];
        
        this.availableStates = this.selectRandomStates(3);
        this.setupStates();
        this.play('Final');
    }

    playIntro() {
        this.setVisible(true).setActive(true);
        
        this.scene.cameras.main.shake(4000, 0.07);
        this.scene.cameras.main.flash(2000, 255, 0, 255);
        
        this.scene.time.delayedCall(2000, () => {
            this.setLife();
            this.scene.events.emit('bossIntroFinished');
        });
    }
    
    setupStates() {
        const stateConfigs = [
            ['fireball', new BossAngryFireBallState('ffire_ball')],
            ['punch', new BossAngryPunchState('fpunch')],
            ['punchPlatform', new BossAngryPunchPlatformState('fpunch')],
            ['xAttack', new BossFearXAttackState()],
            ['cupAttack', new BossFearCupAttackState('fvaso')],
            ['icicle', new BossSadIcicleState('ficicle')],
            ['radial', new BossSadRadialState('ficicle')],
            ['waterball', new BossSadWaterBallState('fwater_ball')],
            ['cooldown', new FinalBossCooldownState()]
        ];
        
        stateConfigs.forEach(([name, state]) => this.addState(name, state));
    }
    
    selectRandomStates(count) {
        return [...this.allStates]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
    }
    
    getDamageTintColor() {
        return 0xff00ff;
    }
    
    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth + 5;
            this.availableStates = [...this.allStates];
            this.minCooldown = 600;
            this.maxCooldown = 1000;
            
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
        this.destroyClaws();

        this.scene.cameras.main.shake(1200, 0.03).flash(800, 255, 0, 255);

        this.scene.time.delayedCall(2500, () => {
            this.setActive(true).setVisible(true);
            this.isActivated = true;
            this.resetAllCollisions();

            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 1000,
                ease: 'Sine.easeInOut'
            });

            this.generateNewCooldown();
            this.stateMachine.setState('cooldown');
        });
    }
    
    die() {
        this.scene.cameras.main.shake(2000, 0.05).flash(1500, 255, 215, 0);
        super.die();
        
        this.scene.time.delayedCall(5000, () => {
            this.scene.scene.stop();
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }
    
    // Usa el método createClaws heredado de BaseBoss
    createClaws() {
        super.createClaws('fgarra', 3.5, 380);
    }
}
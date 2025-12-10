import BaseBoss from './BaseBoss/BaseBoss.js';
import BossTutorialSideAttackState from './BossTutorialState/BossTutorialSideAttackState.js';
import BossTutorialJumpAttackState from './BossTutorialState/BossTutorialJumpAttackState.js';
import BossTutorialCooldownState from './BossTutorialState/BossTutorialCooldownState.js';

export default class BossTutorial extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tutorial', undefined, player, {
            health: 6,
            maxHealth: 6,
            damage: 1,
            startCooldown: 3000,
            minCooldown: 3000,
            maxCooldown: 3000,
            availableStates: ['sideAttack'],
            bossName: 'tutorial'
        });

        this.setScaleAndBody(2, 0.45, 0.4, 0, 0.05);
        this._hitPlayerThisSweep = false;
        this.setupStates();
    }

    setScaleAndBody(scale, widthRatio = 0.45, heightRatio = 0.4, offsetX = 0, offsetY = 0.05) {
        this.setScale(scale);
        this.body.setSize(this.displayWidth * widthRatio, this.displayHeight * heightRatio);
        this.body.setOffset(this.displayWidth * offsetX, this.displayHeight * offsetY);
    }

    setupStates() {
        this.addState('sideAttack', new BossTutorialSideAttackState());
        this.addState('jumpAttack', new BossTutorialJumpAttackState());
        this.addState('cooldown', new BossTutorialCooldownState());
    }

    playIntro() {
        this.setVisible(true).setActive(true);
        this.scene.cameras.main.shake(3000, 0.05);
        
        this.scene.time.delayedCall(1500, () => {
            this.setLife();
            this.scene.events.emit('bossIntroFinished');
        });
    }

    // Configurar colisiones adicionales (colisión directa con el boss)
    setupCollisions() {
        super.setupCollisions();
        
        if (!this.colliders.bossPlayerOverlap) {
            this.registerCollider('bossPlayerOverlap', this.scene.physics.add.overlap(
                this,
                this.player,
                this.onHitPlayer,
                null,
                this
            ));
        }
    }

    onHitPlayer(boss, player) {
        if (!boss.active || !player.active || player._recentlyHitByBoss) return;
        
        this._hitPlayerThisSweep = true;
        const dir = player.x < boss.x ? -1 : 1;
        player.takeDamage(this.damage, dir);

        player._recentlyHitByBoss = true;
        this.scene.time.delayedCall(300, () => {
            player._recentlyHitByBoss = false;
        });
    }

    getDamageTintColor() {
        return 0xff0000;
    }

    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth + 3;
            this.availableStates.push('jumpAttack');
            
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
        
        this.scene.cameras.main.shake(600, 0.02).flash(500, 255, 50, 50);

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

    die() {
        // Desactivar físicas antes de morir
        if (this.body) {
            this.body.enable = false;
            this.body.checkCollision.none = true;
        }
        super.die();
    }

    cleanupAllWarnings() {
        super.cleanupAllWarnings();
        this._hitPlayerThisSweep = false;
    }

    resetHitFlag() {
        this._hitPlayerThisSweep = false;
    }

    didHitPlayerThisSweep() {
        return this._hitPlayerThisSweep;
    }
}
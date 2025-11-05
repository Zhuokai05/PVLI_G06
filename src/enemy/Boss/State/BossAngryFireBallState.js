import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryFireBallState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        this.attackDuration = 1000;
        this.cooldownDuration = 500;
        
        this.spawnFireballs(3);
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'attack':
                if (this.stateTime >= this.attackDuration) {
                    this.startCooldownPhase();
                }
                break;
                
            case 'cooldown':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    spawnFireballs(count) {
        const { scene, fireballs } = this.boss;
        const camWidth = scene.cameras.main.width;

        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(100, camWidth - 100);
            const fireball = fireballs.create(x, 0, 'fire_ball');

            fireball.setScale(1.5);
            fireball.setVelocityY(this.boss.fireballSpeed);
            fireball.body.allowGravity = false;
            fireball.setCollideWorldBounds(false);

            this.cleanupFireball(fireball);
        }
    }

    cleanupFireball(fireball) {
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!fireball.active) return;
            const cam = scene.cameras.main;
            if (fireball.x < -200 || fireball.x > cam.width + 200 || fireball.y > cam.height + 200) {
                fireball.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        
    }
}
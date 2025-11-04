import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryFireBallState extends BaseState {
    enter(boss) {
        this.boss = boss;
        this.nextFireTime = 0;
    }

    execute(boss, time, delta) {
        if (time < this.nextFireTime) return;

        this.spawnFireball();
        this.nextFireTime = time + Phaser.Math.Between(2000, 4000);
    }

    spawnFireball() {
        const { scene, fireballs } = this.boss;
        const x = Phaser.Math.Between(0, scene.cameras.main.width);

        const fireball = fireballs.create(x, 0, 'fire_ball');
        fireball.setScale(1.5);
        fireball.setVelocityY(this.boss.fireballSpeed);
        fireball.body.allowGravity = false;
        
        // Destruir al salir de la camara
        fireball.body.world.on('worldbounds', (body) => {
            if (body.gameObject === fireball) {
                fireball.destroy();
            }
        });
    }
}

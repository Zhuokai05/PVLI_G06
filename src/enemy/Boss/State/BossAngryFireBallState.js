import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryFireBallState extends BaseState {
    enter(boss) {
        this.boss = boss;
        this.nextFireTime = 0;
    }

    execute(boss, time, delta) {
        if (time < this.nextFireTime) return;

        this.spawnFireballs(3); 
        this.nextFireTime = time + Phaser.Math.Between(2000, 4000);
    }

    spawnFireballs(count) {
        const { scene, fireballs } = this.boss;
        const camWidth = scene.cameras.main.width;

        // Separa las bolas equitativamente por la pantalla
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(100, camWidth - 100); // dentro del area visible
            const fireball = fireballs.create(x, 0, 'fire_ball');

            fireball.setScale(1.5);
            fireball.setVelocityY(this.boss.fireballSpeed);
            fireball.body.allowGravity = false;
            fireball.setCollideWorldBounds(false);

            //Destruir cuando sale del area de camara
            scene.events.on('update', () => {
                if (!fireball.active) return;
                const cam = scene.cameras.main;
                if (
                    fireball.x < -200 ||
                    fireball.x > cam.width + 200 ||
                    fireball.y > cam.height + 200
                ) {
                    fireball.destroy();
                }
            });
        }
    }
}

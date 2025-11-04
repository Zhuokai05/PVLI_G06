import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryAttackState extends BaseState {
    enter(boss) {
        this.boss = boss;
        this.nextAttackTime = 0;
    }

    execute(boss, time, delta) {
        // Esperar hasta que llegue el momento del siguiente ataque
        if (time > this.nextAttackTime) {
            this.spawnFireball();

            // Esperar un tiempo aleatorio antes del proximo ataque
            const randomDelay = Phaser.Math.Between(1000, 2000); // entre 1 y 2 segundos
            this.nextAttackTime = time + randomDelay;
        }
    }

    spawnFireball() {
        const { scene, fireballs } = this.boss;

        const x = Phaser.Math.Between(0, scene.cameras.main.width);
        const y = 0; // desde arriba

        const fireball = fireballs.create(x, y, 'fire_ball');
        fireball.setScale(1.5);
        fireball.setVelocityY(this.boss.fireballSpeed);
        fireball.setCollideWorldBounds(false);
        fireball.body.allowGravity = false;

        // Destruir tras 5s por seguridad
        scene.time.delayedCall(5000, () => {
            if (fireball.active) fireball.destroy();
        });
    }
}

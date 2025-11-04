import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryPunchState extends BaseState {
    enter(boss) {
        this.boss = boss;
        this.nextAttackTime = 0;
        this.isAttacking = false;
    }

    execute(boss, time, delta) {
        if (this.isAttacking || time < this.nextAttackTime) return;

        this.isAttacking = true;
        this.nextAttackTime = time + Phaser.Math.Between(3000, 5000);

        // Fase 1 solo desde arriba; fase 2 puede venir desde los lados
        let direction = 'down';
        if (boss.phase === 2) {
            const rand = Phaser.Math.Between(0, 2);
            direction = rand === 0 ? 'down' : rand === 1 ? 'left' : 'right';
        }

        this.showWarning(direction);
    }

    showWarning(direction) {
        const { scene } = this.boss;
        const player = this.boss.player;
        const cam = scene.cameras.main;

        let warning;
        let spawnX, spawnY;

        if (direction === 'down') {
            // Rectangulo vertical que cubre toda la altura
            const warningWidth = 120;
            spawnX = player.x;
            spawnY = 0;
            warning = scene.add.rectangle(
                spawnX,
                cam.height / 2,
                warningWidth,
                cam.height,
                0xff0000,
                0.5
            );
        } else {
            // Rectangulo horizontal que cubre todo el ancho
            const warningHeight = 120;
            spawnY = player.y;
            spawnX = direction === 'left' ? 0 : cam.width; // guardamos origen

            warning = scene.add.rectangle(
                cam.width / 2,   
                spawnY,            
                cam.width,          
                warningHeight,       
                0xff0000,
                0.5
            );
        }

        // Mostrar aviso 1 s antes de ataque
        scene.time.delayedCall(1000, () => {
            warning.destroy();
            this.spawnPunch(direction, spawnX, spawnY);
            this.isAttacking = false;
        });
    }

    spawnPunch(direction, spawnX, spawnY) {
        const { scene, punches } = this.boss;
        const Yspeed = this.boss.punchYSpeed;
        const Xspeed = this.boss.punchXSpeed;
        let punch;

        if (direction === 'down') {
            punch = punches.create(spawnX, 0, 'punch');
            punch.setVelocityY(Yspeed);
        } else if (direction === 'left') {
            punch = punches.create(0, spawnY, 'punch');
            punch.setVelocityX(Xspeed);
            punch.setAngle(-90);
        } else if (direction === 'right') {
            punch = punches.create(scene.cameras.main.width, spawnY, 'punch');
            punch.setVelocityX(-Xspeed);
            punch.setAngle(90);
        }

        punch.setScale(2.5);
        punch.body.allowGravity = false;

        // Destruccion cuando sale de camara
        scene.events.on('update', () => {
            if (!punch.active) return;
            const cam = scene.cameras.main;
            if (
                punch.x < -200 ||
                punch.x > cam.width + 200 ||
                punch.y > cam.height + 200
            ) {
                punch.destroy();
            }
        });
    }
}

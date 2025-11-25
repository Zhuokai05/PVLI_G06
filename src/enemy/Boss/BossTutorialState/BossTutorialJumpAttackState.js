import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialJumpAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> lift -> fall -> finish

        this.warningDuration = 900;
        this.liftDuration = 400;
        this.fallDuration = 600;
        this.cooldownDuration = 300;

        // Crear rectángulo vertical de advertencia en la posición actual del jugador
        const cam = this.scene.cameras.main;
        this.spawnX = Phaser.Math.Clamp(this.boss.player.x, 50, cam.width - 50);

        this.warningRect = this.scene.add.rectangle(
            this.spawnX,
            cam.height / 2,
            120,
            cam.height,
            0xff0000,
            0.45
        );

        // Guardar la y "suelo" del boss para aterrizar
        this.groundY = this.boss.y;
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.startLift();
                }
                break;
            case 'lift':
                // waiting for lift tween to complete
                break;
            case 'fall':
                // waiting for fall tween to complete
                break;
            case 'finish':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startLift() {
        this.currentPhase = 'lift';
        this.stateTime = 0;

        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();

        // Subir al cielo (fuera de cámara)
        const liftY = -200;

        this.scene.tweens.add({
            targets: this.boss,
            y: liftY,
            duration: this.liftDuration,
            ease: 'Quad.easeOut',
            onComplete: () => {
                // Al llegar arriba, preparar caída hacia la posición actual del player
                this.startFall();
            }
        });
    }

    startFall() {
        this.currentPhase = 'fall';
        this.stateTime = 0;

        // Decidir destino X = posicion actual del player (clamp dentro camara)
        const cam = this.scene.cameras.main;
        const targetX = Phaser.Math.Clamp(this.boss.player.x, 50, cam.width - 50);
        const targetY = this.groundY;

        // Alinear flip si hace falta
        this.boss.flipX = (targetX > this.boss.x);

        // Tween para caer al target (simula salto y caída)
        this.scene.tweens.add({
            targets: this.boss,
            x: targetX,
            y: targetY,
            duration: this.fallDuration,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // Al aterrizar, si está tocando al player, inflige daño (collision manejada por overlap)
                // Forzamos una comprobación inmediata
                if (this.scene.physics.overlap(this.boss, this.boss.player)) {
                    // Si overlap, aplicar daño (onHitPlayer ya marcará y dañará)
                    // Asegurar que se dañe al player (por si no se detectó overlap)
                    this.boss.onHitPlayer(this.boss, this.boss.player);
                }

                // Ir al finish
                this.currentPhase = 'finish';
                this.stateTime = 0;
            }
        });
    }

    exit(context) {
        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();
    }
}
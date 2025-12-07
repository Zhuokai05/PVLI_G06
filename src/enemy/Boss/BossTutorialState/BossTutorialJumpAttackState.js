import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialJumpAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'lift';

        // Duraciones en ms 
        this.liftDuration = 800;
        this.fallDuration = 800;
        this.warningDuration = 1400;
        this.cooldownDuration = 1000;

        // Guardar la y "suelo" del boss
        this.groundY = this.boss.y;
        
        // Iniciar el levantamiento
        this.startLift();
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'lift':
                break;
            case 'fall':
                break;
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.currentPhase = 'finish';
                    this.stateTime = 0;
                }
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

        // Subir al cielo (fuera de cámara)
        const liftY = this.boss.y - 500; // Usar posición relativa al boss

        this.scene.tweens.add({
            targets: this.boss,
            y: liftY,
            duration: this.liftDuration,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.startFall();
            }
        });
    }

    startFall() {
        this.currentPhase = 'fall';
        this.stateTime = 0;

        // Obtener límites de la cámara en coordenadas del mundo
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView;
        
        // Limitar targetX dentro del área visible de la cámara
        const minX = worldView.x + 50;
        const maxX = worldView.x + worldView.width - 50;
        const targetX = Phaser.Math.Clamp(this.boss.player.x, minX, maxX);
        const targetY = this.groundY;

        // Alinear flip
        this.boss.flipX = (targetX > this.boss.x);

        // Crear rectángulo de advertencia en la posición de destino
        this.warningRect = this.scene.add.rectangle(
            targetX,
            this.groundY,
            120,
            120,
            0xff0000,
            0.45
        );

        // Tween para caer al target
        this.scene.tweens.add({
            targets: this.boss,
            x: targetX,
            y: targetY,
            duration: this.fallDuration,
            ease: 'Quad.easeIn',
            onComplete: () => {
                if (this.warningRect && this.warningRect.active) {
                    this.warningRect.destroy();
                }

                // Comprobar overlap al aterrizar
                if (this.scene.physics.overlap(this.boss, this.boss.player)) {
                    this.boss.onHitPlayer(this.boss, this.boss.player);
                }

                this.currentPhase = 'warning';
                this.stateTime = 0;
            }
        });
    }

    exit(context) {
        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();
    }
}
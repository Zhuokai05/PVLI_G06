import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialJumpAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'lift'; // MODIFICADO: lift -> fall -> warning -> finish

        // Duraciones en ms 
        this.liftDuration = 800;
        this.fallDuration = 800;
        this.warningDuration = 1400; // Aumentado para total de ~3 segundos
        this.cooldownDuration = 1000;

        // Guardar la y "suelo" del boss para aterrizar
        this.groundY = this.boss.y;
        
        // Iniciar el levantamiento inmediatamente
        this.startLift();
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'lift':
                // waiting for lift tween to complete
                break;
            case 'fall':
                // waiting for fall tween to complete
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

        // MODIFICACIÓN: Crear rectángulo de advertencia cuando está en el aire
        this.warningRect = this.scene.add.rectangle(
            targetX,
            this.groundY,
            120,
            120,
            0xff0000,
            0.45
        );

        // Tween para caer al target (simula salto y caída)
        this.scene.tweens.add({
            targets: this.boss,
            x: targetX,
            y: targetY,
            duration: this.fallDuration,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // Destruir el rectángulo de advertencia al aterrizar
                if (this.warningRect && this.warningRect.active) {
                    this.warningRect.destroy();
                }

                // Al aterrizar, si está tocando al player, inflige daño (collision manejada por overlap)
                // Forzamos una comprobación inmediata
                if (this.scene.physics.overlap(this.boss, this.boss.player)) {
                    // Si overlap, aplicar daño (onHitPlayer ya marcará y dañará)
                    // Asegurar que se dañe al player (por si no se detectó overlap)
                    this.boss.onHitPlayer(this.boss, this.boss.player);
                }

                // Ir al warning (que ahora es después del aterrizaje)
                this.currentPhase = 'warning';
                this.stateTime = 0;
            }
        });
    }

    exit(context) {
        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();
    }
}
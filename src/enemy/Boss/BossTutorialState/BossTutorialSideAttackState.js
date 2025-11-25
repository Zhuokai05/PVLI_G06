import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialSideAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> finish

        // Duraciones en ms
        this.warningDuration = 900;
        this.attackDuration = 700; // duración del sweep tween
        this.cooldownDuration = 300;

        // Reseteo flag
        this.boss._hitPlayerThisSweep = false;

        // Decidir dirección: si está más cerca de la izquierda, ir a la derecha, etc. O azar
        this.direction = Phaser.Math.Between(0,1) === 0 ? 'right' : 'left';

        // Crear rectángulo de advertencia horizontal (barrido)
        const cam = this.scene.cameras.main;
        const warningHeight = 120;
        this.warningRect = this.scene.add.rectangle(
            cam.width / 2,
            this.boss.y,
            cam.width,
            warningHeight,
            0xff0000,
            0.4
        );

        // Aseguramos que el boss no se mueva hasta comenzar
        if (this.boss.body) this.boss.body.moves = false;
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.startAttack();
                }
                break;
            case 'attack':
                // El movimiento lo maneja el tween; solo esperar
                break;
            case 'finish':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startAttack() {
        this.currentPhase = 'attack';
        this.stateTime = 0;

        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();

        // Determinar extremos en X según cámara
        const cam = this.scene.cameras.main;
        const leftX = 50; // margen (ajusta según tu layout)
        const rightX = cam.width - 50;

        const fromX = (this.direction === 'right') ? leftX : rightX;
        const toX = (this.direction === 'right') ? rightX : leftX;

        // Colocar boss en el extremo inicial
        this.boss.x = fromX;
        this.boss.y = this.boss.y; // mantener Y

        // Orientar sprite: por defecto textura orientada a la izquierda
        // Si se mueve a la derecha: flipX = true
        this.boss.flipX = (this.direction === 'right');

        // Permitir movimiento físico para detectar overlap continuo
        if (this.boss.body) this.boss.body.moves = true;

        // Tween para mover de extremo a extremo
        this.tween = this.scene.tweens.add({
            targets: this.boss,
            x: toX,
            ease: 'Sine.easeInOut',
            duration: this.attackDuration,
            onComplete: () => {
                // Al completar el barrido, si no golpeó al player, auto-daño
                if (!this.boss._hitPlayerThisSweep) {
                    this.boss.takeDamage(1);
                }

                // Parar movimiento físico
                if (this.boss.body) {
                    this.boss.body.setVelocity(0,0);
                    this.boss.body.moves = false;
                }

                // Pasar a fase finish y temporizador corto
                this.currentPhase = 'finish';
                this.stateTime = 0;
            }
        });
    }

    exit(context) {
        // Limpieza
        if (this.warningRect && this.warningRect.active) this.warningRect.destroy();
        if (this.tween) this.tween.stop();

        // Reset flag
        this.boss._hitPlayerThisSweep = false;
    }
}
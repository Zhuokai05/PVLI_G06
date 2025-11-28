import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialSideAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> finish

        // Duraciones en ms 
        this.warningDuration = 1000;
        this.attackDuration = 1000; // duración del sweep tween
        this.cooldownDuration = 1000; // Aumentado para total de ~3segundos

        // Reseteo flag
        this.boss._hitPlayerThisSweep = false;

        // GUARDAR LA POSICIÓN Y INICIAL para mantenerla fija
        this.initialY = this.boss.y;

        // MODIFICACIÓN: La dirección siempre es del lado en el que está hacia el otro extremo
        const cam = this.scene.cameras.main;
        const leftX = 50;
        const rightX = cam.width - 50;
        
        // Determinar dirección basada en la posición actual
        const bossCenterX = this.boss.x;
        const camCenterX = cam.width / 2;
        
        // Si está en la izquierda, va a la derecha, y viceversa
        this.direction = (bossCenterX < camCenterX) ? 'right' : 'left';

        // Crear rectángulo de advertencia horizontal (barrido) - USAR initialY
        const warningHeight = 120;
        this.warningRect = this.scene.add.rectangle(
            cam.width / 2,
            this.initialY, // Usar la Y inicial guardada
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
                // FORZAR POSICIÓN Y FIJA durante el ataque
                if (this.boss.body) {
                    this.boss.y = this.initialY;
                }
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

        // Colocar boss en el extremo inicial - MANTENER Y INICIAL
        this.boss.x = fromX;
        this.boss.y = this.initialY; // Usar la Y inicial guardada

        // Orientar sprite: por defecto textura orientada a la izquierda
        // Si se mueve a la derecha: flipX = true
        this.boss.flipX = (this.direction === 'right');

        // Permitir movimiento físico para detectar overlap continuo
        if (this.boss.body) this.boss.body.moves = true;

        // Tween para mover SOLO en el eje X
        this.tween = this.scene.tweens.add({
            targets: this.boss,
            x: toX,
            y: this.initialY, // FORZAR Y constante en el tween
            ease: 'Sine.easeInOut',
            duration: this.attackDuration,
            onUpdate: () => {
                // Garantizar que Y no cambie durante el tween
                this.boss.y = this.initialY;
            },
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
import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialSideAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> finish

        // Duraciones en ms 
        this.warningDuration = 1000;
        this.attackDuration = 2000;
        this.cooldownDuration = 1000;

        // Reseteo flag
        this.boss._hitPlayerThisSweep = false;

        // Guardar posición inicial
        this.initialY = this.boss.y;
        this.initialX = this.boss.x;

        // Obtener los límites visibles de la cámara en coordenadas del mundo
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView; // Esto da el rectángulo visible en coordenadas del mundo
        
        // Calcular márgenes dentro del área visible
        const margin = 50;
        this.leftBoundary = worldView.x + margin;
        this.rightBoundary = worldView.x + worldView.width - margin;
        this.centerX = worldView.x + worldView.width / 2;

        // Determinar dirección basada en la posición actual del boss
        this.direction = (this.boss.x < this.centerX) ? 'right' : 'left';

        // Crear rectángulo de advertencia en coordenadas del mundo
        const warningHeight = 120;
        this.warningRect = this.scene.add.rectangle(
            this.centerX, // Usar centro de la cámara en coordenadas del mundo
            this.initialY,
            worldView.width, // Ancho del área visible
            warningHeight,
            0xff0000,
            0.4
        );

        // Asegurar que el boss no se mueva hasta comenzar
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
                // Forzar posición Y fija durante el ataque
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

        // Destruir advertencia
        this.destroyAllWarnings();

        // Obtener límites actualizados (por si la cámara se movió)
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView;
        const margin = 50;
        const leftBoundary = worldView.x + margin;
        const rightBoundary = worldView.x + worldView.width - margin;

        const fromX = (this.direction === 'right') ? leftBoundary : rightBoundary;
        const toX = (this.direction === 'right') ? rightBoundary : leftBoundary;

        // Colocar boss en el extremo inicial
        this.boss.x = fromX;
        this.boss.y = this.initialY;

        // Orientar sprite
        this.boss.flipX = (this.direction === 'right');

        // Permitir movimiento físico para detectar overlap
        if (this.boss.body) this.boss.body.moves = true;

        // Tween para mover SOLO en el eje X
        this.tween = this.scene.tweens.add({
            targets: this.boss,
            x: toX,
            y: this.initialY,
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

                // Pasar a fase finish
                this.currentPhase = 'finish';
                this.stateTime = 0;
            }
        });
    }
    
    destroyAllWarnings() {
        if (this.warningRect) {
            this.warningRect.destroy();
            this.warningRect = null;
        }
        
        // Detener tween si existe
        if (this.tween && this.tween.stop) {
            this.tween.stop();
            this.tween = null;
        }
    }

    exit(context) {
        this.destroyAllWarnings();
        
        // Reset flag
        this.boss._hitPlayerThisSweep = false;
    }
}
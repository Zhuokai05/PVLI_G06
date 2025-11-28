import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearXAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1000;
        this.attackDuration = 1500;
        this.cooldownDuration = 500;
        
        // Crear garras para el ataque
        this.boss.createClaws();
        
        this.startWarningPhase();
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;

        // Crear indicadores de trayectoria usando rectángulos en lugar de líneas
        this.leftWarning = scene.add.rectangle(
            cam.width / 2 - 300, 
            cam.height / 2 + 100,
            300, 
            60, 
            0xff0000, 
            0.5
        );
        this.leftWarning.setAngle(45);
        
        this.rightWarning = scene.add.rectangle(
            cam.width / 2 + 300, 
            cam.height / 2 + 100,
            300, 
            60, 
            0xff0000, 
            0.5
        );
        this.rightWarning.setAngle(-45);
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                // Parpadeo de advertencia
                if (Math.floor(this.stateTime / 200) % 2 === 0) {
                    this.leftWarning.setAlpha(0.3);
                    this.rightWarning.setAlpha(0.3);
                } else {
                    this.leftWarning.setAlpha(0.7);
                    this.rightWarning.setAlpha(0.7);
                }

                if (this.stateTime >= this.warningDuration) {
                    this.startAttackPhase();
                }
                break;
                
            case 'attack':
                if (this.stateTime >= this.attackDuration) {
                    this.startCooldownPhase();
                }
                break;
                
            case 'cooldown':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;
        
        // Destruir advertencias
        this.leftWarning.destroy();
        this.rightWarning.destroy();
        
        // Mover garras en forma de X
        this.moveClawsInXPattern();
    }

    moveClawsInXPattern() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;
        
        // Posiciones iniciales y finales
        const startLeftX = cam.width / 2 - 380;
        const startRightX = cam.width / 2 + 380;
        const startY = cam.height / 2 - 100;
        const endLeftX = cam.width / 2 + 300;
        const endRightX = cam.width / 2 - 300;
        const endY = cam.height / 2 + 200;
        
        // Garra izquierda: va hacia abajo-derecha
        scene.tweens.add({
            targets: this.boss.leftClaw,
            x: endLeftX,
            y: endY,
            duration: this.attackDuration,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                // Añadir movimiento sinusoidal ligero para curvatura
                const progress = tween.progress;
                target.y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 2) * 20;
            }
        });
        
        // Garra derecha: va hacia abajo-izquierda
        scene.tweens.add({
            targets: this.boss.rightClaw,
            x: endRightX,
            y: endY,
            duration: this.attackDuration,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                // Añadir movimiento sinusoidal ligero para curvatura
                const progress = tween.progress;
                target.y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 2) * 20;
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
        
        // Destruir garras al terminar el ataque
        this.boss.destroyClaws();
    }

    exit(context) {
        // Limpiar advertencias si aún existen
        if (this.leftWarning && this.leftWarning.active) {
            this.leftWarning.destroy();
        }
        if (this.rightWarning && this.rightWarning.active) {
            this.rightWarning.destroy();
        }
        
        // Asegurarse de que las garras se destruyan
        this.boss.destroyClaws();
    }
}
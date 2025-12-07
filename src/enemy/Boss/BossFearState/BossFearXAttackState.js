import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearXAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1000;
        this.attackDuration = 2000;
        this.cooldownDuration = 1000;
        
        // Crear garras para el ataque
        this.boss.createClaws();
        
        this.startWarningPhase();
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const bossX = this.boss.x;
        const bossY = this.boss.y;

        // Crear indicadores de trayectoria usando coordenadas del mundo
        this.leftWarning = scene.add.rectangle(
            bossX - 300, 
            bossY + 100,
            300, 
            60, 
            0xff0000, 
            0.5
        );
        this.leftWarning.setAngle(45);
        
        this.rightWarning = scene.add.rectangle(
            bossX + 300, 
            bossY + 100,
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
        this.destroyAllWarnings();
        
        // Mover garras en forma de X
        this.moveClawsInXPattern();
    }

    moveClawsInXPattern() {
        const { scene } = this.boss;
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        
        // Posiciones iniciales y finales (coordenadas del mundo)
        const startLeftX = bossX - 380;
        const startRightX = bossX + 380;
        const startY = bossY - 100;
        const endLeftX = bossX + 300;
        const endRightX = bossX - 300;
        const endY = bossY + 400;
        
        // Garra izquierda: va hacia abajo-derecha
        scene.tweens.add({
            targets: this.boss.leftClaw,
            x: endLeftX,
            y: endY,
            duration: this.attackDuration,
            ease: 'Power2',
            onUpdate: (tween, target) => {
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
    
    // NUEVO MÉTODO
    destroyAllWarnings() {
        if (this.leftWarning) {
            this.leftWarning.destroy();
            this.leftWarning = null;
        }
        if (this.rightWarning) {
            this.rightWarning.destroy();
            this.rightWarning = null;
        }
    }

    exit(context) {
        this.destroyAllWarnings();
        
        // Asegurarse de que las garras se destruyan
        this.boss.destroyClaws();
    }
}
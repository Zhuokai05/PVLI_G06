import BaseBossAttackState from '../BaseBossAttackState.js';

export default class BossFearXAttackState extends BaseBossAttackState {
    constructor(texture = 'garra') {
        super({
            texture: texture,
            attackName: 'Ataque en X',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 1000,
            attackDuration: 2000,
            cooldownDuration: 1000,
            logOnEnter: true
        });
    }
    
    enter(context) {
        super.enter(context);
        
        // Crear garras para el ataque
        this.boss.createClaws();
    }
    
    createWarning() {
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        
        // Crear indicadores de trayectoria en forma de X
        this.createXPatternWarning(bossX, bossY);
        
        // Iniciar efecto de parpadeo
        this.startWarningFlash();
    }
    
    createXPatternWarning(x, y) {
        // Rectángulo izquierdo (45 grados)
        const leftWarning = this.scene.add.rectangle(
            x - 300,
            y + 100,
            300,
            60,
            0xff0000,
            0.5
        );
        leftWarning.setAngle(45);
        
        // Rectángulo derecho (-45 grados)
        const rightWarning = this.scene.add.rectangle(
            x + 300,
            y + 100,
            300,
            60,
            0xff0000,
            0.5
        );
        rightWarning.setAngle(-45);
        
        // Registrar elementos para limpieza
        this.registerWarningElement('leftWarning', leftWarning);
        this.registerWarningElement('rightWarning', rightWarning);
    }
    
    startWarningFlash() {
        // Crear efecto de parpadeo
        this.flashTween = this.scene.tweens.add({
            targets: [this.getWarningElement('leftWarning'), this.getWarningElement('rightWarning')],
            alpha: { from: 0.3, to: 0.7 },
            duration: 200,
            yoyo: true,
            repeat: -1
        });
        
        this.registerWarningElement('flashTween', this.flashTween);
    }
    
    executeAttack() {
        // Mover garras en forma de X
        this.moveClawsInXPattern();
    }
    
    moveClawsInXPattern() {
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        
        if (!this.boss.leftClaw || !this.boss.rightClaw) {
            console.error('Garras no creadas correctamente');
            return;
        }
        
        // Posiciones iniciales y finales
        const startLeftX = bossX - 380;
        const startRightX = bossX + 380;
        const startY = bossY - 100;
        const endLeftX = bossX + 300;
        const endRightX = bossX - 300;
        const endY = bossY + 400;
        
        // Animación de la garra izquierda (hacia abajo-derecha)
        this.leftClawTween = this.scene.tweens.add({
            targets: this.boss.leftClaw,
            x: endLeftX,
            y: endY,
            duration: this.config.attackDuration,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                target.y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 2) * 20;
            }
        });
        
        // Animación de la garra derecha (hacia abajo-izquierda)
        this.rightClawTween = this.scene.tweens.add({
            targets: this.boss.rightClaw,
            x: endRightX,
            y: endY,
            duration: this.config.attackDuration,
            ease: 'Power2',
            onUpdate: (tween, target) => {
                const progress = tween.progress;
                target.y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 2) * 20;
            }
        });
        
        // Registrar tweens para limpieza
        this.registerWarningElement('leftClawTween', this.leftClawTween);
        this.registerWarningElement('rightClawTween', this.rightClawTween);
    }
    
    destroyAllWarnings() {
        super.destroyAllWarnings();
        
        // Detener efecto de parpadeo si existe
        if (this.flashTween && this.flashTween.stop) {
            this.flashTween.stop();
        }
    }
    
    exit(context) {
        this.destroyAllWarnings();
        
        // Asegurarse de que las garras se destruyan
        if (this.boss && this.boss.destroyClaws) {
            this.boss.destroyClaws();
        }
    }
}
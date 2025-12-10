import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de salto para el jefe Tutorial
 * @class BossTutorialJumpAttackState
 * @extends BaseBossAttackState
 */
export default class BossTutorialJumpAttackState extends BaseBossAttackState {
    constructor() {
        super({
            texture: 'tutorial',
            attackName: 'Ataque de Salto',
            phases: ['lift', 'fall', 'warning', 'finish'],
            warningDuration: 1400,
            attackDuration: 800,
            cooldownDuration: 1000,
            logOnEnter: true
        });
        
        // Variables específicas
        this.groundY = 0;
        this.liftTween = null;
        this.fallTween = null;
        this.targetX = 0;
    }
    
    /**
     * Entra al estado de ataque de salto
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        // Configurar primero
        this.boss = context;
        this.scene = this.boss.scene;
        this.player = this.boss.player;
        
        // Guardar posición Y del suelo
        this.groundY = this.boss.y;
        
        // Asegurar físicas activas
        if (this.boss.body) {
            this.boss.body.enable = true;
            this.boss.body.moves = true;
        }
        
        // Iniciar directamente la fase lift (este ataque no tiene warning tradicional)
        this.currentPhase = 'lift';
        this.stateTime = 0;
        this.startLift();
    }
    
    // Sobrescribir métodos base ya que este ataque tiene fases personalizadas
    
    /**
     * Crea advertencias (este ataque tiene fases personalizadas)
     */
    createWarning() {
        // Este ataque no tiene warning tradicional
        // El warning es el rectángulo en el suelo durante la caída
    }
    
    /**
     * Ejecuta el ataque (se maneja en las fases específicas)
     */
    executeAttack() {
        // El ataque se ejecuta en las fases específicas
    }
    
    /**
     * Ejecuta la lógica del estado de salto
     * @param {Object} context - Contexto del boss
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    execute(context, time, delta) {
        this.stateTime += delta;
        
        switch (this.currentPhase) {
            case 'lift':
                if (this.stateTime >= this.config.warningDuration) {
                    this.startFall();
                }
                break;
                
            case 'fall':
                if (this.stateTime >= this.config.attackDuration) {
                    this.onLand();
                }
                break;
                
            case 'warning':
                if (this.stateTime >= this.config.warningDuration) {
                    this.startFinish();
                }
                break;
                
            case 'finish':
                if (this.stateTime >= this.config.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }
    
    // Métodos específicos del ataque de salto
    
    /**
     * Inicia la fase de ascenso
     */
    startLift() {
        this.currentPhase = 'lift';
        this.stateTime = 0;
        
        const liftY = this.boss.y - 500;
        
        this.liftTween = this.scene.tweens.add({
            targets: this.boss,
            y: liftY,
            duration: this.config.warningDuration, // Usar warningDuration para el ascenso
            ease: 'Quad.easeOut',
            onComplete: () => {
                // El ascenso está completo, pero la transición se maneja en execute()
            }
        });
        
        this.registerWarningElement('liftTween', this.liftTween);
    }
    
    /**
     * Inicia la fase de caída
     */
    startFall() {
        this.currentPhase = 'fall';
        this.stateTime = 0;
        
        // Calcular posición objetivo
        this.calculateTargetPosition();
        
        // Crear advertencia en el suelo
        this.createGroundWarning();
        
        // Iniciar caída
        this.performFall();
    }
    
    /**
     * Calcula la posición objetivo para la caída
     */
    calculateTargetPosition() {
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView || this.getDefaultWorldView();
        
        const minX = worldView.x + 50;
        const maxX = worldView.x + worldView.width - 50;
        this.targetX = Phaser.Math.Clamp(this.player.x, minX, maxX);
        
        // Orientar sprite
        this.boss.flipX = (this.targetX > this.boss.x);
    }
    
    /**
     * Obtiene un worldView por defecto
     * @returns {Object} - WorldView por defecto
     */
    getDefaultWorldView() {
        return {
            x: this.boss.x - 400,
            width: 800,
            height: 600
        };
    }
    
    /**
     * Crea advertencia en el suelo donde caerá el boss
     */
    createGroundWarning() {
        const warningRect = this.createWarningRectangle(
            this.targetX,
            this.groundY,
            120,
            120,
            0xff0000,
            0.45
        );
        
        // Efecto de pulso
        this.createPulseEffect([warningRect], 400, 0.3, 0.6);
    }
    
    /**
     * Realiza la caída del boss
     */
    performFall() {
        this.fallTween = this.scene.tweens.add({
            targets: this.boss,
            x: this.targetX,
            y: this.groundY,
            duration: this.config.attackDuration,
            ease: 'Quad.easeIn',
            onComplete: () => {
                // La caída está completa, pero la transición se maneja en execute()
            }
        });
        
        this.registerWarningElement('fallTween', this.fallTween);
    }
    
    /**
     * Maneja el aterrizaje del boss
     */
    onLand() {
        this.currentPhase = 'warning';
        this.stateTime = 0;
        
        // Asegurar posición exacta en el suelo
        this.boss.y = this.groundY;
        
        // Verificar colisión con el jugador
        if (this.scene.physics.overlap(this.boss, this.player)) {
            this.boss.onHitPlayer(this.boss, this.player);
        }
        
        // Crear efecto de impacto
        this.createLandingEffect();
    }
    
    /**
     * Crea efecto visual de impacto al aterrizar
     */
    createLandingEffect() {
        // Círculo de impacto
        const impactCircle = this.scene.add.circle(
            this.targetX,
            this.groundY,
            80,
            0xff0000,
            0.3
        );
        
        // Ondas de impacto
        for (let i = 0; i < 3; i++) {
            const wave = this.scene.add.circle(
                this.targetX,
                this.groundY,
                40,
                0xff4444,
                0.4 - (i * 0.1)
            );
            
            this.scene.tweens.add({
                targets: wave,
                scale: 2 + (i * 0.5),
                alpha: 0,
                duration: 300,
                delay: i * 100,
                onComplete: () => {
                    if (wave && wave.active) wave.destroy();
                }
            });
        }
        
        // Shake de cámara
        this.scene.cameras.main.shake(200, 0.01);
        
        // Destruir círculo después
        this.scene.time.delayedCall(500, () => {
            if (impactCircle && impactCircle.active) {
                impactCircle.destroy();
            }
        });
    }
    
    /**
     * Inicia la fase final del ataque
     */
    startFinish() {
        this.currentPhase = 'finish';
        this.stateTime = 0;
    }
    
    /**
     * Sale del estado de ataque de salto
     * @param {Object} context - Contexto del boss
     */
    exit(context) {
        super.exit(context);
        
        // Asegurar que el boss esté en el suelo
        if (this.boss) {
            this.boss.y = this.groundY;
        }
    }
}
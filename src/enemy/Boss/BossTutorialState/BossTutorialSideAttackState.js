import BaseBossAttackState from '../BaseBossAttackState.js';

export default class BossTutorialSideAttackState extends BaseBossAttackState {
    constructor() {
        super({
            texture: 'tutorial',
            attackName: 'Ataque Lateral',
            phases: ['warning', 'attack', 'finish'],
            warningDuration: 1000,
            attackDuration: 2000,
            cooldownDuration: 2000,
            logOnEnter: true
        });
        
        // Variables específicas
        this.initialY = 0;
        this.initialX = 0;
        this.leftBoundary = 0;
        this.rightBoundary = 0;
        this.centerX = 0;
        this.direction = '';
        this.tween = null;
    }
    
    enter(context) {
        // Configurar primero las variables específicas
        this.boss = context;
        this.scene = this.boss.scene;
        this.player = this.boss.player;
        
        // Resetear flag de golpe
        this.boss._hitPlayerThisSweep = false;
        
        // Guardar posición inicial
        this.initialY = this.boss.y;
        this.initialX = this.boss.x;
        
        // Bloquear movimiento físico inicialmente
        if (this.boss.body) {
            this.boss.body.moves = false;
        }
        
        // Ahora llamar al método del padre para inicializar el sistema de fases
        super.enter(context);
    }
    
    createWarning() {
        // Obtener límites de la cámara de forma segura
        this.calculateCameraBoundaries();
        
        // Determinar dirección basada en la posición actual del boss
        this.direction = (this.boss.x < this.centerX) ? 'right' : 'left';
        
        // Crear rectángulo de advertencia
        const warningHeight = 120;
        const warningRect = this.createWarningRectangle(
            this.centerX,
            this.initialY,
            this.getWorldViewWidth(),
            warningHeight,
            0xff0000,
            0.4
        );
        
        // Añadir flechas direccionales
        this.createDirectionArrows();
        
        // Añadir texto de advertencia
        this.createFloatingText(
            this.centerX,
            this.initialY - warningHeight / 2 - 30,
            '¡ATENCIÓN!',
            { fill: '#ff4444', fontSize: '28px' }
        );
    }
    
    calculateCameraBoundaries() {
        const cam = this.scene.cameras.main;
        
        // Obtener worldView de forma segura
        const worldView = cam.worldView || this.getDefaultWorldView();
        
        // Calcular márgenes dentro del área visible
        const margin = 50;
        this.leftBoundary = worldView.x + margin;
        this.rightBoundary = worldView.x + worldView.width - margin;
        this.centerX = worldView.x + worldView.width / 2;
        
        // Guardar worldView como propiedad si es necesario para otros métodos
        this.worldView = worldView;
    }
    
    getWorldViewWidth() {
        if (this.worldView && this.worldView.width) {
            return this.worldView.width;
        }
        
        // Fallback: usar el ancho del juego
        return this.scene.sys.game.config.width || 800;
    }
    
    getDefaultWorldView() {
        return {
            x: this.boss.x - 400,
            y: this.boss.y - 300,
            width: 800,
            height: 600
        };
    }
    
    createDirectionArrows() {
        const arrowCount = 3;
        const arrowSpacing = 80;
        const worldWidth = this.getWorldViewWidth();
        
        for (let i = 0; i < arrowCount; i++) {
            let arrowX, arrowY = this.initialY;
            
            if (this.direction === 'right') {
                arrowX = this.centerX - (worldWidth / 4) + (i * arrowSpacing);
            } else {
                arrowX = this.centerX + (worldWidth / 4) - (i * arrowSpacing);
            }
            
            this.createArrow(arrowX, arrowY, this.direction);
        }
    }
    
    createArrow(x, y, direction) {
        const arrowSize = 30;
        const arrow = this.scene.add.graphics();
        arrow.fillStyle(0xff4444, 0.8);
        
        arrow.beginPath();
        arrow.moveTo(x, y);
        
        if (direction === 'right') {
            arrow.lineTo(x - arrowSize, y - arrowSize / 2);
            arrow.lineTo(x - arrowSize, y + arrowSize / 2);
        } else {
            arrow.lineTo(x + arrowSize, y - arrowSize / 2);
            arrow.lineTo(x + arrowSize, y + arrowSize / 2);
        }
        
        arrow.closePath();
        arrow.fillPath();
        
        // Efecto de movimiento
        const arrowTween = this.scene.tweens.add({
            targets: arrow,
            x: direction === 'right' ? x + 20 : x - 20,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Registrar para limpieza
        this.registerWarningElement(`arrow_${x}_${y}`, arrow);
        this.registerWarningElement(`arrowTween_${x}_${y}`, arrowTween);
    }
    
    executeAttack() {
        this.startSideSweep();
    }
    
    startSideSweep() {
        // Recalcular límites por si la cámara se movió
        this.calculateCameraBoundaries();
        
        // Determinar posiciones de inicio y fin
        const fromX = (this.direction === 'right') ? this.leftBoundary : this.rightBoundary;
        const toX = (this.direction === 'right') ? this.rightBoundary : this.leftBoundary;
        
        // Posicionar al boss
        this.boss.x = fromX;
        this.boss.y = this.initialY;
        this.boss.flipX = (this.direction === 'right');
        
        // Activar movimiento físico para colisiones
        if (this.boss.body) {
            this.boss.body.moves = true;
        }
        
        // Crear tween para el movimiento lateral
        this.tween = this.scene.tweens.add({
            targets: this.boss,
            x: toX,
            y: this.initialY,
            ease: 'Sine.easeInOut',
            duration: this.config.attackDuration,
            onUpdate: () => {
                // Mantener posición Y fija
                this.boss.y = this.initialY;
            },
            onComplete: () => {
                this.onSweepComplete();
            }
        });
        
        // Registrar tween para limpieza
        this.registerWarningElement('sweepTween', this.tween);
    }
    
    onSweepComplete() {
        // Si no golpeó al jugador, auto-daño
        if (!this.boss._hitPlayerThisSweep) {
            this.boss.takeDamage(1);
        }
        
        // Detener movimiento físico
        if (this.boss.body) {
            this.boss.body.setVelocity(0, 0);
            this.boss.body.moves = false;
        }
        
        // Transicionar a fase finish
        this.currentPhase = 'finish';
        this.stateTime = 0;
    }
    
    // Sobrescribir el método execute para manejar la fase finish
    execute(context, time, delta) {
        // Llamar al método base primero
        super.execute(context, time, delta);
        
        // Manejo adicional para la fase finish
        if (this.currentPhase === 'finish') {
            this.stateTime += delta;
            
            if (this.stateTime >= this.config.cooldownDuration) {
                this.boss.selectNextState();
            }
        }
    }
    
    exit(context) {
        super.exit(context);
        
        // Resetear flag
        context._hitPlayerThisSweep = false;
    }
}
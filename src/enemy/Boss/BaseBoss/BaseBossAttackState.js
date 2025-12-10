import BaseState from '../../../stateMachine/BaseState.js';

export default class BaseBossAttackState extends BaseState {
    constructor(config = {}) {
        super();
        this.config = {
            texture: config.texture || 'default',
            attackName: config.attackName || 'Attack',
            phases: config.phases || ['warning', 'attack', 'cooldown'],
            warningDuration: config.warningDuration || 2000,
            attackDuration: config.attackDuration || 500,
            cooldownDuration: config.cooldownDuration || 500,
            logOnEnter: config.logOnEnter !== undefined ? config.logOnEnter : true
        };
        
        this.boss = null;
        this.scene = null;
        this.player = null;
        this.stateTime = 0;
        this.currentPhase = this.config.phases[0];
        
        // Elementos de advertencia
        this.warningElements = {};
    }
    
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.player = this.boss.player;
        this.stateTime = 0;
        this.currentPhase = this.config.phases[0];
        
        if (this.config.logOnEnter) {
            console.log(`${this.boss.constructor.name}: ${this.config.attackName}`);
        }
        
        // Iniciar fase según configuración
        if (this.currentPhase === 'warning') {
            this.startWarningPhase();
        } else if (this.currentPhase === 'attack') {
            this.startAttackPhase();
        }
    }
    
    execute(context, time, delta) {
        this.stateTime += delta;
        
        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.config.warningDuration) {
                    this.startAttackPhase();
                }
                break;
                
            case 'attack':
                if (this.stateTime >= this.config.attackDuration) {
                    this.startCooldownPhase();
                }
                break;
                
            case 'cooldown':
                if (this.stateTime >= this.config.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }
    
    startWarningPhase() {
        this.currentPhase = 'warning';
        this.stateTime = 0;
        
        // Método abstracto - implementar en clases hijas
        this.createWarning();
    }
    
    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;
        
        // Limpiar advertencias
        this.destroyAllWarnings();
        
        // Método abstracto - implementar en clases hijas
        this.executeAttack();
    }
    
    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }
    
    // Métodos abstractos (deben ser implementados por clases hijas)
    createWarning() {
        throw new Error('createWarning() debe ser implementado por la clase hija');
    }
    
    executeAttack() {
        throw new Error('executeAttack() debe ser implementado por la clase hija');
    }
    
    // Métodos de utilidad
    destroyAllWarnings() {
        // Destruir todos los elementos de advertencia
        Object.values(this.warningElements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.warningElements = {};
    }
    
    registerWarningElement(name, element) {
        this.warningElements[name] = element;
    }
    
    getWarningElement(name) {
        return this.warningElements[name];
    }
    
    exit(context) {
        // Limpiar advertencias al salir del estado
        this.destroyAllWarnings();
        this.stateTime = 0;
    }
    
    // Métodos de utilidad para efectos visuales
    createPulseEffect(targets, duration = 300, alphaFrom = 0.5, alphaTo = 0.8) {
        this.scene.tweens.add({
            targets: targets,
            alpha: { from: alphaFrom, to: alphaTo },
            duration: duration,
            yoyo: true,
            repeat: -1
        });
    }
    
    createFloatingText(x, y, text, style = {}) {
        const defaultStyle = {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        };
        
        const textObject = this.scene.add.text(x, y, text, { ...defaultStyle, ...style })
            .setOrigin(0.5);
        
        this.registerWarningElement('warningText', textObject);
        return textObject;
    }
    
    createWarningRectangle(x, y, width, height, color = 0xff0000, alpha = 0.3) {
        const rect = this.scene.add.rectangle(x, y, width, height, color, alpha);
        this.registerWarningElement('warningRect', rect);
        return rect;
    }
    
    createWarningBorder(x, y, width, height, lineStyle = { width: 4, color: 0xff4444, alpha: 0.8 }) {
        const border = this.scene.add.graphics();
        border.lineStyle(lineStyle.width, lineStyle.color, lineStyle.alpha);
        border.strokeRect(x - width / 2, y - height / 2, width, height);
        this.registerWarningElement('warningBorder', border);
        return border;
    }
}
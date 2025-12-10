import BaseState from '../../../stateMachine/BaseState.js';

export default class BaseCooldownState extends BaseState {
    constructor(config = {}) {
        super();
        this.config = {
            idleAnimation: config.idleAnimation || null,
            logPrefix: config.logPrefix || 'Boss',
            resetVelocity: config.resetVelocity !== undefined ? config.resetVelocity : false,
            disableMovement: config.disableMovement !== undefined ? config.disableMovement : false // NUEVA opción
        };
    }

    enter(context) {
        this.boss = context;
        this.cooldownTime = 0;
        
        // Reproducir animación idle si está configurada
        if (this.config.idleAnimation && this.boss.play) {
            this.boss.play(this.config.idleAnimation);
        }
        
        // Resetear velocidad si está configurado
        if (this.config.resetVelocity && this.boss.body) {
            this.boss.body.setVelocity(0, 0);
        }
        
        // Desactivar movimiento si está configurado (SOLO para bosses que no necesitan movimiento)
        if (this.config.disableMovement && this.boss.body) {
            this.boss.body.moves = false;
        }
        
        // Log del cooldown
        console.log(`${this.config.logPrefix} en cooldown: ${this.boss.attackCooldown}ms${this.boss.phase ? ` - Fase ${this.boss.phase}` : ''}`);
    }

    execute(context, time, delta) {
        this.cooldownTime += delta;
        
        if (this.cooldownTime >= this.boss.attackCooldown) {
            this.boss.startRandomState();
        }
    }

    exit(context) {
        this.cooldownTime = 0;
        
        // Restaurar movimiento si fue desactivado
        if (this.config.disableMovement && this.boss.body) {
            this.boss.body.moves = true;
        }
    }
}
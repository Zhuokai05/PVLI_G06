import BaseCooldownState from '../BaseCooldownState.js';

export default class FinalBossCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // FinalBoss no tiene animación idle
            logPrefix: 'FinalBoss',
            resetVelocity: false
        });
    }
    
    // Sobrescribir enter para logging específico de fase
    enter(context) {
        super.enter(context);
        
        // Log adicional para FinalBoss
        console.log(`FinalBoss Fase ${this.boss.phase} - Próximo ataque en: ${this.boss.attackCooldown}ms`);
    }
}
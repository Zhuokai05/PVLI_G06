import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

/**
 * Estado de cooldown específico para el jefe Final
 * @class FinalBossCooldownState
 * @extends BaseCooldownState
 */
export default class FinalBossCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // FinalBoss no tiene animación idle
            logPrefix: 'FinalBoss',
            resetVelocity: false
        });
    }
    
    /**
     * Entra al estado de cooldown con logging específico de fase
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        super.enter(context);
        
        // Log adicional para FinalBoss
        console.log(`FinalBoss Fase ${this.boss.phase} - Próximo ataque en: ${this.boss.attackCooldown}ms`);
    }
}
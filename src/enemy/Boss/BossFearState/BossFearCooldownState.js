import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

/**
 * Estado de cooldown específico para el jefe Miedo
 * @class BossFearCooldownState
 * @extends BaseCooldownState
 */
export default class BossFearCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // BossFear no tiene animación idle
            logPrefix: 'BossFear',
            resetVelocity: false
        });
    }
}
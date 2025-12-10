import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

/**
 * Estado de cooldown específico para el jefe Tristeza
 * @class BossSadCooldownState
 * @extends BaseCooldownState
 */
export default class BossSadCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // BossSad no tiene animación idle definida
            logPrefix: 'BossSad',
            resetVelocity: false
        });
    }
}
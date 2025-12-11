import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

/**
 * Estado de cooldown específico para el jefe Tutorial
 * @class BossTutorialCooldownState
 * @extends BaseCooldownState
 */
export default class BossTutorialCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null,
            logPrefix: 'BossTutorial',
            resetVelocity: true,     // Resetear velocidad a 0
            disableMovement: false   // NO desactivar movimiento - ¡IMPORTANTE!
        });
    }
}
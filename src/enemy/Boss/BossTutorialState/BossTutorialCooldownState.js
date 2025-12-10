import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

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
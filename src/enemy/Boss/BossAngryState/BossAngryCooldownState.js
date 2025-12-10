import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

/**
 * Estado de cooldown específico para el jefe Ira
 * @class BossAngryCooldownState
 * @extends BaseCooldownState
 */
export default class BossAngryCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: 'bossira_idle',
            logPrefix: 'BossAngry',
            resetVelocity: false
        });
    }
}
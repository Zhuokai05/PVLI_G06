import BaseCooldownState from '../BaseCooldownState.js';

export default class BossFearCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // BossFear no tiene animación idle
            logPrefix: 'BossFear',
            resetVelocity: false
        });
    }
}
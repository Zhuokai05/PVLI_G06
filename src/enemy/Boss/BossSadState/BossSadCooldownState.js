import BaseCooldownState from '../BaseBoss/BaseCooldownState.js';

export default class BossSadCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: null, // BossSad no tiene animación idle definida
            logPrefix: 'BossSad',
            resetVelocity: false
        });
    }
}
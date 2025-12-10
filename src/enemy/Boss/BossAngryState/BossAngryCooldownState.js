import BaseCooldownState from '../BaseCooldownState.js';

export default class BossAngryCooldownState extends BaseCooldownState {
    constructor() {
        super({
            idleAnimation: 'bossira_idle',
            logPrefix: 'BossAngry',
            resetVelocity: false
        });
    }
}
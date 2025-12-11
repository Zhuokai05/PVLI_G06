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

    enter(context) {
        super.enter(context);

        const currentAnim = context.anims.currentAnim ? context.anims.currentAnim.key : '';

        if (currentAnim === 'bossira_attack') {
            context.once('animationcomplete', () => {
                if (context.stateMachine.currentState === this) {
                    context.play('bossira_idle', true);
                }
            });
        }
        else {
            context.play('bossira_idle', true);
        }
    }
}
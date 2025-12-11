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

    enter(context) {
        super.enter(context);

        const currentAnim = context.anims.currentAnim ? context.anims.currentAnim.key : '';

        if (currentAnim === 'bosssadness_attack') {
            context.once('animationcomplete', () => {
                if (context.stateMachine.currentState === this) {
                    context.play('bosssadness_idle', true);
                }
            });
        }
        else {
            context.play('bosssadness_idle', true);
        }
    }
}
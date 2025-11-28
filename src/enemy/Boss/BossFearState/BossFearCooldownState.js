import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearCooldownState extends BaseState {
    enter(context) {
        this.boss = context;
        this.cooldownTime = 0;
        this.boss.attackCooldown = Phaser.Math.Between(1000, 2000);
    }

    execute(context, time, delta) {
        this.cooldownTime += delta;
        
        if (this.cooldownTime >= this.boss.attackCooldown) {
            // En fase 2, alternar entre cupGame y cooldown
            if (this.boss.phase === 2) {
                this.boss.stateMachine.setState('cupGame');
            }
        }
    }

    exit(context) {
        this.cooldownTime = 0;
    }
}
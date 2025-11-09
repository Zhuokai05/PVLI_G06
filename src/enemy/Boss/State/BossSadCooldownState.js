import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadCooldownState extends BaseState {
    enter(context) {
        this.boss = context;
        this.cooldownTime = 0;
        console.log(`BossSad en cooldown: ${this.boss.attackCooldown}ms`);
    }

    execute(context, time, delta) {
        this.cooldownTime += delta;
        
        if (this.cooldownTime >= this.boss.attackCooldown) {
            this.boss.startRandomState();
        }
    }

    exit(context) {
        this.cooldownTime = 0;
    }
}
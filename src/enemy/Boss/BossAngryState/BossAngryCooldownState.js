import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryCooldownState extends BaseState {
    enter(context) {
        this.boss = context;
        this.cooldownTime = 0;
        console.log(`Boss en cooldown: ${this.boss.attackCooldown}ms`);
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
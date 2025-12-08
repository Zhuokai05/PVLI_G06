import BaseState from '../../../stateMachine/BaseState.js';

export default class FinalBossCooldownState extends BaseState {
    enter(context) {
        this.boss = context;
        this.cooldownTime = 0;
        console.log(`FinalBoss en cooldown: ${this.boss.attackCooldown}ms - Fase ${this.boss.phase}`);
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
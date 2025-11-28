import BaseState from '../../../stateMachine/BaseState.js';

export default class BossTutorialCooldownState extends BaseState {
    enter(context) {
        this.boss = context;
        this.elapsed = 0;
        // asegurar que no se mueva en cooldown
        if (this.boss.body) {
            this.boss.body.setVelocity(0,0);
            this.boss.body.moves = false;
        }
    }

    execute(context, time, delta) {
        this.elapsed += delta;
        if (this.elapsed >= this.boss.attackCooldown) {
            this.boss.startRandomState();
        }
    }

    exit(context) {
        this.elapsed = 0;
    }
}
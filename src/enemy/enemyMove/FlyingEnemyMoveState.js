// FlyingEnemyMoveState.js
import BaseState from '../../stateMachine/BaseState.js';

export default class FlyingEnemyMoveState extends BaseState {
    enter(enemy) {
        this.startAttackTimer = 0;
    }

    execute(enemy, time, delta) {
        const player = enemy.player;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        const distance = Math.hypot(dx, dy);

        if(enemy.canSeePlayer()){

            if (distance < enemy.attackRange) {
                this.startAttackTimer += delta;
                enemy.stateMachine.setState('attack');
            }

            else {
                this.startAttackTimer = 0;
            }

            // Persigue al player
            if (distance > enemy.attackRange) {
                const nx = dx / distance;
                const ny = dy / distance;

                enemy.setVelocity(
                    nx * enemy.speed,
                    ny * enemy.verticalSpeed
                );

                enemy.setFlipX(nx < 0);
            }
             // Entran al ataque
            if (this.startAttackTimer > enemy.startAttackTime){
                enemy.setVelocityX(0);
                enemy.stateMachine.setState('attack');
                this.startAttackTimer = 0;
            }
        }

        else {enemy.setVelocity(0, 0);}

    }
    exit(enemy) {
        enemy.setVelocityX(0);
        enemy.setVelocityY(0);
    }

}

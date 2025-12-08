import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado de movimiento para enemigos voladores
 */
export default class FlyingEnemyMoveState extends BaseState {

    enter(enemy) {
        this.startAttackTimer = 0;                // tiempo acumulado para atacar
        enemy.playMoveAnimation();                // anim caminar
    }

    execute(enemy, time, delta) {
        const player = enemy.player;              // referencia jugador

        const dx = player.x - enemy.x;            // distancia x
        const dy = player.y - enemy.y;            // distancia y
        const distance = Math.hypot(dx, dy);      // distancia total

        if (enemy.canSeePlayer()) {

            // entrar en ataque si esta dentro del rango
            if (distance < enemy.attackRange) {
                this.startAttackTimer += delta;
                enemy.stateMachine.setState('attack');
            } else {
                this.startAttackTimer = 0;
            }

            // perseguir jugador mientras no este en rango
            if (distance > enemy.attackRange) {
                const nx = dx / distance;         // normalizar x
                const ny = dy / distance;         // normalizar y

                enemy.setVelocity(
                    nx * enemy.speed,             // velocidad horizontal
                    ny * enemy.verticalSpeed      // velocidad vertical
                );

                enemy.setFlipX(nx < 0);           // voltear sprite
            }

            // si cargo el ataque suficiente, atacar
            if (this.startAttackTimer > enemy.startAttackTime) {
                enemy.setVelocityX(0);
                enemy.stateMachine.setState('attack');
                this.startAttackTimer = 0;
            }
        } else {
            enemy.setVelocity(0, 0);               // si no ve al jugador, detenerse
        }
    }

    exit(enemy) {
        enemy.setVelocityX(0);                     // detener al salir del estado
        enemy.setVelocityY(0);
    }
}

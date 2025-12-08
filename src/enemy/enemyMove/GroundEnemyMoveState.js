import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado de movimiento para enemigos terrestres
 */
export default class GroundEnemyMoveState extends BaseState {

  enter(enemy) {
    this.startAttackTimer = 0;                    // tiempo para cargar ataque
    enemy.playMoveAnimation();                    // anim caminar
  }

  execute(enemy, time, delta) {

    let player = enemy.player;                    // referencia jugador
    let direction = player.x > enemy.x ? 1 : -1;  // direccion hacia jugador
    let distance = Math.abs(enemy.x - player.x);  // distancia horizontal

    // evitar juntarse con otros enemigos
    if (this.closeEnemy(enemy, direction)) {
      enemy.setVelocityX(0);
    }

    if (enemy.canSeePlayer()) {

      // perseguir jugador si no esta muy cerca y no esta en rango
      if (!this.closeEnemy(enemy, direction) && distance >= enemy.attackRange) {
        enemy.setVelocityX(direction * enemy.speed);
        enemy.setFlipX(direction < 0);
      } else {
        enemy.setVelocityX(0);
      }

      // cargar ataque cuando esta en rango
      if (distance < enemy.attackRange) {
        this.startAttackTimer += delta;
      } else {
        this.startAttackTimer = 0;
      }
    } else {
      enemy.setVelocityX(0);                      // no ve al jugador, detenerse
    }

    // lanzar ataque si ya cargo
    if (this.startAttackTimer > enemy.startAttackTime) {
      enemy.setVelocityX(0);
      enemy.stateMachine.setState('attack');
      this.startAttackTimer = 0;
    }
  }

  exit(enemy) {
    enemy.setVelocityX(0);                        // detener al salir
  }

  /**
   * detecta si hay enemigo demasiado cerca
   */
  closeEnemy(enemy, direction) {

    let closeEnemy = enemy.scene.enemies.getChildren().find(other => {
      if (other === enemy || other.dead) return false;
      let distX = other.x - enemy.x;
      return Math.sign(distX) === direction &&
             Math.abs(distX) < enemy.distanceBtwEnemies;
    });

    return closeEnemy;
  }
}

import BaseState from '../../stateMachine/BaseState.js';

export default class BaseEnemyMoveState extends BaseState {
  enter(enemy) {}

  execute(enemy, time, delta) {

    let player = enemy.player;
    let direction = player.x > enemy.x ? 1 : -1;
    let distance = Math.abs(enemy.x - player.x);

    //funcion que calcula la distancia minima
    let closeEnemy = enemy.scene.enemies.getChildren().find(other => {
      if (other === enemy || other.dead) return false;
      let distX = other.x - enemy.x;
      return Math.sign(distX) === direction && Math.abs(distX) < enemy.distanceBtwEnemies;
    });


    //fuerza mantener la distancia
    if (closeEnemy) {
      enemy.setVelocityX(0);
    }


    //persigue al jugador si esta en rango
    if (!closeEnemy && enemy.canSeePlayer() && distance > enemy.attackRange) {
      enemy.setVelocityX(direction * enemy.speed);
      enemy.setFlipX(direction < 0);
    }

    else {
      enemy.setVelocityX(0);
    }

  }

  exit(enemy) {
    enemy.setVelocityX(0);
  }
}
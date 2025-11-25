import BaseState from '../../stateMachine/BaseState.js';

export default class BaseEnemyMoveState extends BaseState {
  enter(enemy) {
    this.startAttackTimer = 0;
  }

  execute(enemy, time, delta) {

    let player = enemy.player;
    let direction = player.x > enemy.x ? 1 : -1;
    let distance = Math.abs(enemy.x - player.x);

    //fuerza mantener la distancia
    if (this.closeEnemy(enemy,direction)) {
      enemy.setVelocityX(0);
    }


    //persigue al jugador si esta en rango
    if (!this.closeEnemy(enemy,direction) && enemy.canSeePlayer() && distance > enemy.attackRange) {
      enemy.setVelocityX(direction * enemy.speed);
      enemy.setFlipX(direction < 0);
    }

    else {
      enemy.setVelocityX(0);
    }

    //si el jugador esta en rango empieza a cargar el ataque
    if (distance < enemy.attackRange && enemy.canSeePlayer()) {
      this.startAttackTimer += delta;
    }

    //si el jugador sale de rango deja de cargar
    else {
      this.startAttackTimer = 0;
    }

    //lanza el ataque
    if (this.startAttackTimer > enemy.startAttackTime){
      enemy.setVelocityX(0);
      enemy.stateMachine.setState('attack');
      this.startAttackTimer = 0;
    }
  }

  exit(enemy) {
    enemy.setVelocityX(0);
  }

  //funcion que calcula si hay enemigosd en la distancia minima
  closeEnemy(enemy,direction){
    let closeEnemy = enemy.scene.enemies.getChildren().find(other => {
      if (other === enemy || other.dead) return false;
      let distX = other.x - enemy.x;
      return Math.sign(distX) === direction && Math.abs(distX) < enemy.distanceBtwEnemies;
    });

    return closeEnemy;
  }
}
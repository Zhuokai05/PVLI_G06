import BaseEnemyMoveState from './BaseEnemyMoveState.js';

export default class BasicMeleeEnemyMoveState extends BaseEnemyMoveState {
  enter(enemy){
    super.enter(enemy)
    this.startAttackTimer = 0;
  }
  
  execute(enemy, time, delta) {
    super.execute(enemy, time, delta); 

    let player = enemy.player;
    let distance = Math.abs(enemy.x - player.x);

    //empieza a cargar el ataque
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
}
import EnemyMoveState from './EnemyMoveState.js';

export default class MeleeEnemyMoveState extends EnemyMoveState {
  execute(enemy, time, delta) {
    super.execute(enemy, time, delta); 

    let player = enemy.player;
    let distance = Math.abs(enemy.x - player.x);

    if (distance < enemy.attackRange && enemy.canSeePlayer()) {
      enemy.setVelocityX(0);
      return;
      //enemy.stateMachine.setState('attack');
    }
  }
}
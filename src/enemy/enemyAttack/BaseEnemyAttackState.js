import BaseState from '../../stateMachine/BaseState.js';

export default class BaseEnemyAttackState extends BaseState {
  enter(enemy) {
    this.enemy = enemy;
    enemy.isAttacking = true;
    
  }

  execute(enemy, time, delta) {

    if (!enemy.isAttacking) {
      enemy.stateMachine.setState('move');
    }
}

}
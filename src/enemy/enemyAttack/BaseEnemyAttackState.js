import BaseState from '../../stateMachine/BaseState.js';

export default class BaseEnemyAttackState extends BaseState {
  enter(enemy) {
    this.enemy = enemy;
    enemy.isAttacking = true;
    if(!enemy.dead) enemy.playAttackAnimation();
    
      //terminar el ataque despues de attackcooldown
      this.enemy.scene.time.delayedCall(this.enemy.attackDuration, () => {
        this.enemy.isAttacking = false;
      });
  }

  execute(enemy, time, delta) {

    //si no esta atacando. sale del estado
    if (!enemy.isAttacking) {
      enemy.stateMachine.setState('move');
    }
  }
}
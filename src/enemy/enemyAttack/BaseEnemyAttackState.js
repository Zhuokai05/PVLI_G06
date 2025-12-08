import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado base de ataque para enemigos
 */
export default class BaseEnemyAttackState extends BaseState {

  enter(enemy) {
    this.enemy = enemy;
    enemy.isAttacking = true;                  // entrando en modo atacar
    if (!enemy.dead) enemy.playAttackAnimation();

    // terminar ataque tras duracion
    this.enemy.scene.time.delayedCall(enemy.attackDuration, () => {
      enemy.isAttacking = false;
    });
  }

  execute(enemy, time, delta) {

    // si ya no esta atacando, volver a estado mover
    if (!enemy.isAttacking) {
      enemy.stateMachine.setState('move');
    }
  }
}

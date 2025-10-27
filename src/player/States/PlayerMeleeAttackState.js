import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerAttackState extends BaseState {
  enter(player) {
    player.isAttacking = true;

    player.meleeAttack(player.attackDir);
  }

  execute(player, time, delta) {

    if (!player.isAttacking) {
      player.stateMachine.setState('idle');
    }
  }
}
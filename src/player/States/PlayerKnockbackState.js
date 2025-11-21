import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerKnockbackState extends BaseState {
  enter(player,direction) {

    //aplicar velocidad knockback
    player.setVelocity(player.knockbackDistance * direction, -player.knockbackDistance);

    //cambiar de estado tras tiempo knockback
    player.safeDelay(player.knockbackTime, () => {
        player.stateMachine.setState('idle');
    });
  }

  execute(player, time, delta) {
  }

  exit(player){
  }
}

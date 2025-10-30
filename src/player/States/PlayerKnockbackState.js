import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerKnockbackState extends BaseState {
  enter(player,direction) {

    player.setVelocity(player.knockbackDistance * direction, -player.knockbackDistance);

    player.scene.time.delayedCall(player.knockbackTime, () => {
    player.stateMachine.setState('idle');
    
  });
  }

  execute(player, time, delta) {
  }

  exit(player){
  }
}

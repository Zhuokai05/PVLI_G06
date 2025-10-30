import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerKnockbackState extends BaseState {
  enter(player,direction) {

    const knockX = 250 * -direction;

    player.setVelocity(knockX, player.velocityY);

    player.scene.time.delayedCall(player.knockbackTime, () => {
    player.stateMachine.setState('idle');
    
  });
  }

  execute(player, time, delta) {
  }

  exit(player){
  }
}

import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerIdleState extends BaseState {
    enter(player) {
        player.play('idle', true);
        player.setVelocityX(0);
    }

    execute(player) {

        if (player.keys.left.isDown || player.keys.right.isDown) {
            player.stateMachine.setState('move');
        } else if (player.keys.jump.isDown && player.isGrounded()) {
            player.stateMachine.setState('jump');
        }

        if (player.attackDir && !player.isAttacking) {    
            player.stateMachine.setState('attack');
            return;
        }
    }
}
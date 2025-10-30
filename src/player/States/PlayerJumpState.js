import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerJumpState extends BaseState {
    enter(player) {
        player.setVelocityY(-player.jumpSpeed);
        player.play('jump', true);
    }

    execute(player) {

        if (player.keys.left.isDown) {
            player.setVelocityX(-player.movementSpeed * 0.8);
            player.setFlipX(true);
        } else if (player.keys.right.isDown) {
            player.setVelocityX(player.movementSpeed * 0.8);
            player.setFlipX(false);
        }

        if (player.isGrounded()) {
            if (Math.abs(player.body.velocity.x) > 10)
                player.stateMachine.setState('move');
            else
                player.stateMachine.setState('idle');
        }

        if (player.attackDir && !player.isAttacking) {
    
            player.stateMachine.setState('attack');
            return;
        }
    }
}

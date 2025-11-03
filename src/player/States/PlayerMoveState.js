import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerMoveState extends BaseState {
    enter(player) {
        player.play('walk', true);
    }

    execute(player) {

        if (!player.keys.left.isDown && !player.keys.right.isDown) {
            player.stateMachine.setState('idle');
            return;
        }

        if (player.keys.left.isDown) {
            player.setVelocityX(-player.movementSpeed*player.speedMultiplier);
            player.setFlipX(true);
        } else if (player.keys.right.isDown) {
            player.setVelocityX(player.movementSpeed*player.speedMultiplier);
            player.setFlipX(false);
        }

        if (player.keys.jump.isDown && player.isGrounded()) {
            player.stateMachine.setState('jump');
        }
        
        if (player.attackDir && !player.isAttacking) {      
            player.stateMachine.setState('attack');
            return;
        }
    }

    exit(player) {
        player.setVelocityX(0);
    }
}

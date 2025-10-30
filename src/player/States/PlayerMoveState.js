import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerMoveState extends BaseState {
    enter(player) {
        player.play('walk', true);
    }

    execute(player) {
        let { left, right, jump } = player.keys;

        if (!left.isDown && !right.isDown) {
            player.stateMachine.setState('idle');
            return;
        }

        if (left.isDown) {
            player.setVelocityX(-player.movementSpeed);
            player.setFlipX(true);
        } else if (right.isDown) {
            player.setVelocityX(player.movementSpeed);
            player.setFlipX(false);
        }

        if (jump.isDown && player.isGrounded()) {
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

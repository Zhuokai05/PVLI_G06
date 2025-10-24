export default class PlayerJumpState {
    enter(player) {
        player.setVelocityY(-player.jumpSpeed);
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
    }
}

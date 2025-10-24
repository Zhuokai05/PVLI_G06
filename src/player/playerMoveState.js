export default class PlayerMoveState {
    enter(player) {}

    execute(player) {
        const { left, right, jump } = player.keys;

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
    }

    exit(player) {
        player.setVelocityX(0);
    }
}

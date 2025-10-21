export default class PlayerIdleState {
    enter(player) {
        player.setVelocityX(0);
    }

    execute(player) {
        const { left, right, jump } = player.keys;

        if (left.isDown || right.isDown) {
            player.stateMachine.setState('move');
        } else if (jump.isDown && player.isGrounded()) {
            player.stateMachine.setState('jump');
        }
    }
}
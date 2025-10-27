import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerIdleState extends BaseState {
    enter(player) {
        player.setVelocityX(0);
    }

    execute(player) {
        let { left, right, jump } = player.keys;

        if (left.isDown || right.isDown) {
            player.stateMachine.setState('move');
        } else if (jump.isDown && player.isGrounded()) {
            player.stateMachine.setState('jump');
        }

        if (player.attackDir && !player.isAttacking) {    
            player.stateMachine.setState('attack');
            return;
        }
    }
}
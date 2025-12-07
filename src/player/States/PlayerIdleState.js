import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado idle del jugador
 */
export default class PlayerIdleState extends BaseState {

    /**
     * se ejecuta al entrar en idle
     */
    enter(player) {
        player.play('Player_idle', true);      // animacion idle
        player.setVelocityX(0);                // detener movimiento horizontal
    }

    /**
     * logica idle por frame
     */
    execute(player) {

        // si pulsa movimiento -> ir a move
        if (player.keys.left.isDown || player.keys.right.isDown) {
            player.stateMachine.setState('move');
            return;
        }

        // si puede saltar -> pasar a jump
        if (player.jumpBufferTimer > 0 && player.isGrounded()) {
            player.stateMachine.setState('jump');
            return;
        }
    }
}

import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado movimiento del jugador
 */
export default class PlayerMoveState extends BaseState {

    /**
     * entrar en movimiento
     */
    enter(player) {
        player.play('Player_walk', true);      // animacion caminar
    }

    /**
     * actualizar movimiento
     */
    execute(player) {

        // si deja de moverse -> idle
        if (!player.keys.left.isDown && !player.keys.right.isDown) {
            player.stateMachine.setState('idle');
            return;
        }

        // movimiento a la izquierda
        if (player.keys.left.isDown) {
            player.direction = -1;
            player.setFlipX(true);
        }

        // movimiento a la derecha
        else if (player.keys.right.isDown) {
            player.direction = 1;
            player.setFlipX(false);
        }

        // salto desde movimiento
        if (player.jumpBufferTimer > 0 && player.isGrounded()) {
            player.stateMachine.setState('jump');
            return;
        }

        // aplicar velocidad horizontal
        player.setVelocityX(player.direction * player.movementSpeed * player.speedMultiplier);
    }

    /**
     * salir del estado movimiento
     */
    exit(player) {
        player.setVelocityX(0);               // parar personaje
    }
}

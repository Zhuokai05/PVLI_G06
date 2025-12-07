import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado salto del jugador
 */
export default class PlayerJumpState extends BaseState {

    /**
     * se ejecuta al iniciar el salto
     */
    enter(player) {
        player?.jumpSound?.play();                                 // sonido salto
        player.setVelocityY(-player.jumpSpeed * player.jumpSpeedModifier); // aplicar salto
    }

    /**
     * logica del salto
     */
    execute(player) {

        // movimiento en el aire a la izquierda
        if (player.keys.left.isDown) {
            player.setFlipX(true);
            player.direction = -1;
            player.setVelocityX(player.direction * player.movementSpeed * player.speedMultiplier);
        }

        // movimiento en el aire a la derecha
        else if (player.keys.right.isDown) {
            player.setFlipX(false);
            player.direction = 1;
            player.setVelocityX(player.direction * player.movementSpeed * player.speedMultiplier);
        }

        // si toca el suelo -> volver a idle o move
        if (player.isGrounded()) {
            if (Math.abs(player.body.velocity.x) > 10)
                player.stateMachine.setState('move');
            else
                player.stateMachine.setState('idle');
        }

        // pogo jump
        if (player.canPogoJump && player.jumpBufferTimer > 0) {
            player.canPogoJump = false;
            player.setVelocityY(-player.pogoJumpSpeed * player.jumpSpeedModifier);
            player.play('jump', true);
        }
    }

    /**
     * al salir del estado salto
     */
    exit(player) {
        player?.jumpEndSound?.play();     // sonido de finalizar salto
        player.canPogoJump = false;       // quitar pogo jump
    }
}

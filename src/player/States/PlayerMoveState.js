import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerMoveState extends BaseState {
    enter(player) {
        player.play('Player_walk', true);
    }

    execute(player) {

        //si el jugador no mueve
        if (!player.keys.left.isDown && !player.keys.right.isDown) {
            player.stateMachine.setState('idle');
            return;
        }

          //si el jugador pulsa A
        if (player.keys.left.isDown) {
            player.direction = -1;
            player.setFlipX(true);
        } 
          //si el jugador pulsa D
        else if (player.keys.right.isDown) {
            player.direction = 1;
            player.setFlipX(false);
        }
 
        //si el jugador pulsa salto
        if (player.jumpBufferTimer > 0 && player.isGrounded()) {
            player.stateMachine.setState('jump');
            return;
        }
        
        player.setVelocityX(player.direction * player.movementSpeed*player.speedMultiplier)

        /*
        //ataque del jugador
        if (player.attackDir && !player.isAttacking) {
    
            player.stateMachine.setState('attack');
            return;
        } */
    }

    exit(player) {
        player.setVelocityX(0);
    }
}

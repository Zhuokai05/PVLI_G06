import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerJumpState extends BaseState {
    enter(player) {
        //aplicar velocidad salto
        

        player?.jumpSound?.play();
        player.setVelocityY(-player.jumpSpeed*player.jumpSpeedModifier);
    }

    execute(player) {

        //si el jugador ha pulsado A 
        if (player.keys.left.isDown) {
            player.setFlipX(true);
            player.direction = -1;
            player.setVelocityX(player.direction * player.movementSpeed*player.speedMultiplier)
        }
         //si el jugador ha pulsado D 
        else if (player.keys.right.isDown) {
            player.setFlipX(false);
            player.direction = 1;
            player.setVelocityX(player.direction * player.movementSpeed*player.speedMultiplier)
        }

        //si esta en el suelo cambia de estado
        if (player.isGrounded()) {
            if (Math.abs(player.body.velocity.x) > 10)
                player.stateMachine.setState('move');
            else
                player.stateMachine.setState('idle');
        }

        if (player.canPogoJump && player.jumpBufferTimer >0){
            player.canPogoJump = false;
            player.setVelocityY(-player.pogoJumpSpeed*player.jumpSpeedModifier);
            player.play('jump', true);            
        }
        /*
        //ataque del jugador
        if (player.attackDir && !player.isAttacking) {
    
            player.stateMachine.setState('attack');
            return;
        } */
    }

    exit(player){
        player?.jumpEndSound?.play();
        player.canPogoJump = false;
    }
}

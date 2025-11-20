import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerDashState extends BaseState {
    enter(player) {
        player.isDashing = true;

        player.invulnerable = true;

        //guardamos su estado anterior
        this.previousGravity = player.body.gravity.y;
        this.previousVelX = player.body.velocity.x;

        player.setGravityY(0); 
        player.setVelocityY(0);
        //player.play('dash', true);

        let direction = player.direction ; // 1 o -1 según donde mire
        player.setVelocityX(player.dashSpeed * direction);

        this.collisionHandler = () => {
            if (player.isDashing) {
                player.isDashing = false;
            }
        };

        //cuando choca con algo, llama a collisionHandler
        player.scene.physics.world.on('worldbounds', this.collisionHandler);
        player.body.onWorldBounds = true;

        //acabar el dash
        player.scene.time.delayedCall(player.dashDuration, () => {
            player.isDashing = false;
        }); 

        player.alpha = 0.5;

    }

    execute(player) {
        if (!player.isDashing) {
            player.dashCooldownTimer = player.dashCooldown;
            player.stateMachine.setState('idle');
            return;
        }
    }

    exit(player){
        player.isDashing = false;
        player.setGravityY(this.previousGravity);
        player.setVelocityY(0);
        player.setVelocityX(this.previousVelX);
        player.scene.physics.world.off('worldbounds', this.collisionHandler);
        player.isDashing = false;
        player.invulnerable = false;

        player.alpha = 1;
    }
}
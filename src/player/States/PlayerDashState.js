import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerDashState extends BaseState {
   
    enter(player) {

        this?.dashSound?.play();
        this.dashSpawnShadowFrequency = 40; //frecuencia en la que invoca sombras que siguen al jugador cuando dashea
        this.dashShadowDuration = 250; //duracion de cada sombra

   
        this.player = player;
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

        //evento de cuando choca con worldbounds, llama a collisionHandler
        player.scene.physics.world.on('worldbounds', this.collisionHandler);
        player.body.onWorldBounds = true;

        //acabar el dash
        player.safeDelay(player.dashDuration, () => {
            player.isDashing = false;
        });

        player.alpha = 0.5;

        //timer para invocar sombras detras del jugador
        this.ghostTimer = player.scene.time.addEvent({
            delay: this.dashSpawnShadowFrequency,
            loop: true,
            callback: () => {
                if (player.isDashing) {
                    this.spawnDashGhost();
                }
            }
        });

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
        //quitamos el evento
        player.scene.physics.world.off('worldbounds', this.collisionHandler);
        player.isDashing = false;
        player.invulnerable = false;

        player.alpha = 1;

        if (this.ghostTimer) {
            this.ghostTimer.remove();
        }
    }

    //pina sombras que sigue al jugador
    spawnDashGhost() {
        let ghost = this.player.scene.add.sprite(this.player.x, this.player.y, this.player.texture.key);
        ghost.setFlipX(this.player.flipX);
        ghost.setScale(this.player.scaleX); 
        ghost.setDepth(this.player.depth - 1); // para que este pintado detras del jugador
        ghost.alpha = 0.6;

        // Tween de desaparicion
        this.player.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: this.dashShadowDuration,
            ease: 'Linear',
            onComplete: () => ghost.destroy()
        });
    }
}
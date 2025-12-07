import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado dash del jugador
 * controla el movimiento rapido e invulnerable
 */
export default class PlayerDashState extends BaseState {
   
    /**
     * se ejecuta al entrar en el estado dash
     */
    enter(player) {

        this?.dashSound?.play();                               // reproducir sonido dash
        this.dashSpawnShadowFrequency = 40;                    // frecuencia de sombras
        this.dashShadowDuration = 250;                         // duracion sombras

        this.player = player;                                  // referencia al jugador
        player.isDashing = true;                               // activar estado dash
        player.invulnerable = true;                            // invulnerable mientras dash

        // guardar estado previo
        this.previousGravity = player.body.gravity.y;          // gravedad previa
        this.previousVelX = player.body.velocity.x;            // velocidad previa

        // quitar gravedad temporalmente
        player.setGravityY(0);
        player.setVelocityY(0);

        let direction = player.direction;                      // direccion horizontal
        player.setVelocityX(player.dashSpeed * direction);     // velocidad final del dash

        // handler de colision con bordes del mundo
        this.collisionHandler = () => {
            if (player.isDashing) player.isDashing = false;     // parar dash si choca
        };

        // registrar evento
        player.scene.physics.world.on('worldbounds', this.collisionHandler);
        player.body.onWorldBounds = true;

        // temporizador para terminar dash
        player.safeDelay(player.dashDuration, () => {
            player.isDashing = false;
        });

        player.alpha = 0.5;                                    // semitransparente mientras dash

        // timer que genera sombras
        this.ghostTimer = player.scene.time.addEvent({
            delay: this.dashSpawnShadowFrequency,
            loop: true,
            callback: () => {
                if (player.isDashing) this.spawnDashGhost();    // crear sombra si aun dasheando
            }
        });

    }

    /**
     * se ejecuta cada frame mientras el jugador este en dash
     */
    execute(player) {
        if (!player.isDashing) {                                // si el dash termina
            player.dashCooldownTimer = player.dashCooldown;     // iniciar cooldown
            player.stateMachine.setState('idle');               // volver a idle
        }
    }

    /**
     * se ejecuta al salir del estado dash
     */
    exit(player){
        player.isDashing = false;                               // quitar estado dash
        player.setGravityY(this.previousGravity);               // restaurar gravedad
        player.setVelocityY(0);                                 // reset vertical
        player.setVelocityX(this.previousVelX);                 // restaurar velocidad anterior

        player.scene.physics.world.off('worldbounds', this.collisionHandler);
        player.invulnerable = false;                            // ya no invulnerable
        player.alpha = 1;                                       // recuperar opacidad

        if (this.ghostTimer) this.ghostTimer.remove();          // cancelar sombras
    }

    /**
     * genera sombras del jugador mientras hace dash
     */
    spawnDashGhost() {
        let ghost = this.player.scene.add.sprite(this.player.x, this.player.y, this.player.texture.key);
        ghost.setFlipX(this.player.flipX);                      // misma orientacion
        ghost.setScale(this.player.scaleX);                     // misma escala
        ghost.setDepth(this.player.depth - 1);                  // dibujar detras
        ghost.alpha = 0.6;                                      // semitransparente

        // tween de desaparicion
        this.player.scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: this.dashShadowDuration,
            ease: 'Linear',
            onComplete: () => ghost.destroy()
        });
    }
}

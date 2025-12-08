import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado knockback del jugador
 * cuando recibe dano y es empujado
 */
export default class PlayerKnockbackState extends BaseState {

  /**
   * entrar al estado knockback
   */
  enter(player, direction) {

    player.setVelocity(
        player.knockbackDistance * direction,   // empuje horizontal
       -player.knockbackDistance                // empuje vertical
    );

    // tras tiempo de knockback -> volver a idle
    player.safeDelay(player.knockbackTime, () => {
        player.stateMachine.setState('idle');
    });
  }

  /**
   * logica por frame
   */
  execute(player, time, delta) {}

  /**
   * al salir del estado knockback
   */
  exit(player) {}
}

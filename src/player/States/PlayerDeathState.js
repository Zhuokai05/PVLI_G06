import BaseState from '../../stateMachine/BaseState.js';

/**
 * estado muerte del jugador
 */
export default class PlayerDeathState extends BaseState {

    /**
     * se ejecuta al entrar en el estado muerte
     */
    enter(player) {
        player.setVelocityX(0);                // parar movimiento
        player.destroy();                      // destruir sprite
    }

    /**
     * estado muerte no necesita logica de execute
     */
    execute(player) {}
}

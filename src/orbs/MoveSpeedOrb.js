import Orb from './BaseOrb.js';

/**
 * orbe que aumenta la velocidad de movimiento
 */
export default class MoveSpeedOrb extends Orb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbMoveSpeed', 'Orb MoveSpeed', '(Efecto: Aumenta la velocidad un 50%)');
 }

 onActivate(player) {
    this.player.speedMultiplier = 1.5;        // mas velocidad
    this.player.orbTint = 0x9fc5e8;           // color azul claro
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.speedMultiplier = 1.0;        // velocidad normal
 }
}

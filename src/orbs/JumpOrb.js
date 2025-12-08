import BaseOrb from './BaseOrb.js';

/**
 * orbe que aumenta la altura de salto
 */
export default class JumpOrb extends BaseOrb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbJump', 'Orb Jump', 'Saltas mas alto de lo normal');
 }

 onActivate(player) {
    this.player.jumpSpeedModifier = 1.2;      // salto mas fuerte
    this.player.orbTint = 0x77DD77;           // color verde
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.jumpSpeedModifier = 1.0;      // salto normal
 }
}

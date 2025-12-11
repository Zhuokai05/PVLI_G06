import BaseOrb from './BaseOrb.js';

/**
 * orbe que aumenta el danio del jugador
 */
export default class DamageOrb extends BaseOrb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbDamage', 'Orb Damage', 'Haces mas daño de lo normal');
 }

 onActivate(player) {
    this.player.damageMultiplier = 1.5;      // mas danio
    this.player.orbTint = 0xff9900;          // color naranja
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.damageMultiplier = 1.0;      // volver al normal
    this.player.canDash = false;             // seguridad extra (no necesario)
 }
}

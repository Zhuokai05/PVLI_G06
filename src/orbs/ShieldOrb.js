import Orb from './BaseOrb.js';

/**
 * orbe que permite activar un escudo que bloquea el siguiente ataque
 */
export default class ShieldOrb extends Orb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbShield', 'Orb Shield', 'Te permite activar un escudo que bloquea el siguiente ataque recibido');
 }

 onActivate(player) {
    this.player.canShield = true;            // habilitar escudo
    this.player.orbTint = 0xE0FFFF;          // color azul claro
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.canShield = false;           // desactivar escudo
 }
}

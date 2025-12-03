import Orb from './BaseOrb.js';

export default class ShieldOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbShield', 'Orb Shield', 'Te permite activar un escudo que bloquea el siguiente ataque recibido');
  }

  onActivate(player) {
    this.player.canShield = true;
    this.player.orbTint = 0x008f39;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.canShield = false;
  }
}
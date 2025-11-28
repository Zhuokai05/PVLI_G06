import Orb from './BaseOrb.js';

export default class RangedOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbRanged', 'Orb Ranged', 'Te permite hacer ataque a distancia');
  }

  onActivate(player) {
    this.player.canRangeAttack = true;
    this.player.orbTint = 0x008f39;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.canRangeAttack = false;
  }
}
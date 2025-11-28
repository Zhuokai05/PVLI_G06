import Orb from './BaseOrb.js';

export default class TristezaOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbTristeza', 'Orb Tristeza', 'Aumenta la velocidad un 50%');
  }

  onActivate(player) {
    this.player.canRangeAttack = true;
    this.player.orbTint = 0x9fc5e8;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.canRangeAttack = false;
  }
}
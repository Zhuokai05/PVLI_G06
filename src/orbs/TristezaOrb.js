import Orb from './BaseOrb.js';

export default class TristezaOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbTristeza', 'Orb Tristeza', 'Aumenta la velocidad un 50%');
  }

  onActivate(player) {
    player.canRangeAttack = true;
    player.orbTint = 0x9fc5e8;
    player.setTint(player.orbTint);
  }

  onDeactivate(player) {
    player.canRangeAttack = false;
  }
}
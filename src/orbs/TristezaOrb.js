import Orb from './Orb.js';

export default class TristezaOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbTristeza', 'Orb Tristeza', 'Aumenta la mitad de velocidad');
  }

  onActivate(player) {
    player.speedMultiplier = 1.5;
    player.orbTint = 0x9fc5e8;
    player.setTint(player.orbTint);
  }

  onDeactivate(player) {
    player.speedMultiplier = 1.0;
  }
}
import Orb from './Orb.js';

export default class TristezaOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbTristeza', 'Orb Tristeza', 'Aumenta la mitad de velocidad');
  }

  onActivate(player) {
    player.speedMultiplier = 1.5;
  }

  onDeactivate(player) {
    player.speedMultiplier = 1.0;
  }
}
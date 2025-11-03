import Orb from './Orb.js';

export default class IraOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbIra', 'Orb Ira', 'Aumenta el daño un 50%');
  }

  onActivate(player) {
    player.damageMultiplier = 2;
  }

  onDeactivate(player) {
    player.damageMultiplier = 1;
  }
}
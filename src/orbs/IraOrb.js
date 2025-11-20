import BaseOrb from './BaseOrb.js';

export default class IraOrb extends BaseOrb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbIra', 'Orb Ira', 'Aumenta el daño un 50%');
  }

  onActivate(player) {
    player.canDash = true;
    player.orbTint = 0xff9900;
    player.setTint(player.orbTint);
  }

  onDeactivate(player) {
        player.canDash = false;
  }
}
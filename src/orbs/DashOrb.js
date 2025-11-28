import BaseOrb from './BaseOrb.js';

export default class DashOrb extends BaseOrb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbDash', 'Orb Dash', 'Te permite hacer dash');
  }

  onActivate(player) {
    this.player.canDash = true;
    this.player.orbTint = 0xA020F0;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.canDash = false;
  }
}
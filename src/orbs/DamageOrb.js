import BaseOrb from './BaseOrb.js';

export default class DamageOrb extends BaseOrb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbDamage', 'Orb Damage', '(Efecto: Aumenta el daño un 50%)');
  }

  onActivate(player) {
    this.player.damageMultiplier = 1.5;
    this.player.orbTint = 0xff9900;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.damageMultiplier = 1.0;
    this.player.canDash = false;
  }
}
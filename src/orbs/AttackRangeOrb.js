import Orb from './BaseOrb.js';

export default class AttackRangeOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbAttackRange', 'Orb AttackRange', 'Aumenta el rango de ataque un 50%');
  }

  onActivate(player) {
    this.player.attackRangeMultiplier = 1.5;
    this.player.orbTint = 0xffde21;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.attackRangeMultiplier = 1.0;
  }
}
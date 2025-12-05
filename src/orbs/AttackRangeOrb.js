import Orb from './BaseOrb.js';

export default class AttackRangeOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbAttackRange', 'Orb AttackRange', 'Realizas ataques melees más anchos');
  }

  onActivate(player) {
    this.player.attackRangeMultiplier = 2;
    this.player.orbTint = 0xffde21;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.attackRangeMultiplier = 1.0;
  }
}
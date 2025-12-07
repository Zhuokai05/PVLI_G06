import Orb from './BaseOrb.js';

/**
 * orbe que aumenta el rango del ataque melee
 */
export default class AttackRangeOrb extends Orb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbAttackRange', 'Orb AttackRange', 'Realizas ataques melees mas anchos');
 }

 onActivate(player) {
    this.player.attackRangeMultiplier = 1.5;   // aumentar alcance
    this.player.orbTint = 0xffde21;            // color del orbe
    this.player.setTint(player.orbTint);       // aplicar color
 }

 onDesactivate(player) {
    this.player.attackRangeMultiplier = 1.0;   // volver a normal
 }
}

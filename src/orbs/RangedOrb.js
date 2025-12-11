import Orb from './BaseOrb.js';

/**
 * orbe que habilita el ataque a distancia del jugador
 */
export default class RangedOrb extends Orb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbRanged', 'Orb Ranged', 'Te permite hacer ataque a distancia con la tecla ‘C’');
 }

 onActivate(player) {
    this.player.canRangeAttack = true;        // habilitar ataque rango
    this.player.orbTint = 0x008f39;           // color verde oscuro
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.canRangeAttack = false;       // desactivar ataque rango
 }
}

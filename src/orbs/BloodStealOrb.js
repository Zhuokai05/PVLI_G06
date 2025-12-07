import Orb from './BaseOrb.js';

/**
 * orbe que cura al matar enemigos
 */
export default class BloodStealOrb extends Orb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbBloodSteal', 'Orb BloodSteal', 'Cuando matas a un enemigo, curas 1 de vida');
 }

 onActivate(player) {
    this.player.bloodStealAmount = 1;        // curar al matar
    this.player.orbTint = 0x8B0000;          // color rojo sangre
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.bloodStealAmount = 0;        // sin curacion
 }
}

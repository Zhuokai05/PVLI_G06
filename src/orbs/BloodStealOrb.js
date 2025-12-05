import Orb from './BaseOrb.js';

export default class BloodStealOrb extends Orb {
 constructor(scene, x, y) {
    super(scene, x, y, 'orbBloodSteal', 'Orb BloodSteal', 'Cuando matas a un enemigo, curas 1 de vida');
  }

  onActivate(player) {
    this.player.bloodStealAmount = 1;
    this.player.orbTint = 0x4c2882;
    this.player.setTint(player.orbTint);
  }

  onDesactivate(player) {
    this.player.bloodStealAmount = 0;
  }
}
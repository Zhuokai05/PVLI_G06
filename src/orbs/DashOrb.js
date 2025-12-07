import BaseOrb from './BaseOrb.js';

/**
 * orbe que permite hacer dash
 */
export default class DashOrb extends BaseOrb {

 constructor(scene, x, y) {
    super(scene, x, y, 'orbDash', 'Orb Dash', 'Efecto: Te permite hacer dash');
 }

 onActivate(player) {
    this.player.canDash = true;              // habilitar dash
    this.player.orbTint = 0xA020F0;          // color purpura
    this.player.setTint(player.orbTint);
 }

 onDesactivate(player) {
    this.player.canDash = false;             // desactivar dash
 }
}

/**
 * clase bossroom
 * zona invisible para detectar eventos en la sala del jefe
 */
export default class BossRoom extends Phaser.GameObjects.Zone {
 
    /**
     * constructor de la zona del jefe
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {number} width - ancho de la zona
     * @param {number} height - alto de la zona
     */
    constructor(scene, x, y, width, height) {
        super(scene, x + width / 2, y + height / 2, width, height); // centro de la zona

        this.scene = scene;                                         // referencia a la escena

        scene.add.existing(this);                                   // agregar a la escena
        scene.physics.add.existing(this);                           // activar fisicas

        this.body.setAllowGravity(false);                           // desactivar gravedad
        this.body.setImmovable(true);                               // hacer inmovil
        this.body.setSize(width, height);                           // establecer tamano fisico
    }
}
/**
 * clase showbutton
 * indicador visual que cambia de textura segun el estado (on/off)
 * se utiliza para mostrar el estado de un mecanismo, como un boton
 */
export default class ShowButton extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor del indicador visual
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} textureOff - clave de textura para estado apagado
     * @param {string} textureOn - clave de textura para estado encendido
     */
    constructor(scene, x, y, textureOff, textureOn) {
        super(scene, x, y, textureOff);

        this.scene = scene;                      // referencia a la escena
        this.textureOff = textureOff;            // textura off
        this.textureOn = textureOn;              // textura on

        this.isOn = false;                       // estado inicial (apagado)

        scene.add.existing(this);                // agregar a la escena
        scene.physics.add.existing(this);        // activar fisicas

        this.body.setAllowGravity(false);        // desactivar gravedad
        this.setImmovable(true);                 // hacer inmovil
    }

    /**
     * cambia la textura del sprite segun el estado 'ison'
     */
    changeTexture() {
        if (this.isOn) {
            this.setTexture(this.textureOn);     // establecer textura encendida
        } else {
            this.setTexture(this.textureOff);    // establecer textura apagada
        }
    }
}
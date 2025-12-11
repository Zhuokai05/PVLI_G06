import PlayerDataManager from "../managers/PlayerDataManager.js";

/**
 * clase button
 * representa un boton interactivo que activa puertas o mecanismos
 */
export default class Button extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor del boton
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} texture - clave de textura
     * @param {string} color - color del boton (rojo, azul, verde)
     */
    constructor(scene, x, y, texture, color) {
        super(scene, x, y, texture);

        this.scene = scene;                        // referencia a la escena
        this.color = color;                        // color del boton
        this.pressedText = 'closedbutton';         // textura al presionar
        this.door = null;                          // referencia a la puerta
        this.show = null;                          // indicador visual asociado

        scene.add.existing(this);                  // agregar a la escena
        scene.physics.add.existing(this);          // activar fisicas

        this.body.setAllowGravity(false);          // desactivar gravedad
        this.setImmovable(true);                   // hacer inmovil
        this.setInteractive();                     // hacer interactuable
    }

    /**
     * asigna la puerta que controla este boton
     * @param {object} door - objeto puerta
     */
    setDoor(door) {
        this.door = door;
    }

    /**
     * asigna el indicador visual asociado
     * @param {object} show - objeto indicador
     */
    setShow(show) {
        this.show = show;
    }

    /**
     * cambia la textura del boton
     */
    changeTexture() {
        this.setTexture(this.pressedText);
    }

    /**
     * accion al presionar el boton
     * actualiza estados globales y visuales
     */
    press() {

        this.show.isOn = true;                     // encender indicador
        
        // validar si tiene puerta asignada
        if (!this.door) {
            console.warn("Button: No tiene puerta asignada.");
            return;
        }

        this.changeTexture();                      // cambiar sprite
        
        // guardar estado segun color
        switch (this.color) {
            case 'rojo':
                PlayerDataManager.data.buttonStatus.red = true;
                break;

            case 'azul':
                PlayerDataManager.data.buttonStatus.blue = true;
                break;

            case 'verde':
                PlayerDataManager.data.buttonStatus.green = true;
                break;
        }

        this.show.changeTexture();                 // actualizar indicador
    }
}
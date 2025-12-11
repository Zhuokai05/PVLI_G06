import PlayerDataManager from '../managers/PlayerDataManager.js';
import DoorBoss from '../objects/BossDoor.js';

/**
 * clase sadnessbossdoor
 * puerta que lleva a la batalla contra el jefe tristeza
 * requiere que los tres botones de colores esten activos
 */
export default class SadnessBossDoor extends DoorBoss {

    /**
     * constructor de la puerta del jefe tristeza
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} texture - clave de textura
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

    }

    /**
     * intenta abrir la puerta
     * solo abre si todos los botones de colores estan activos
     */
    openDoor() {
        
        // comprobar el estado de los tres botones
        if (PlayerDataManager.data.buttonStatus.blue
            && PlayerDataManager.data.buttonStatus.green
            && PlayerDataManager.data.buttonStatus.red) {
            
            super.openDoor(); // si estan activos, llama al metodo de la clase base
        }
        else {
            console.log("No se puede abrir la puerta: faltan botones"); // si faltan, solo registra un mensaje
            this.showMessage("Activa todos los botones para poder pasar")
        }
    }

    
}
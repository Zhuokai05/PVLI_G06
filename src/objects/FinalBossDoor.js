import DoorBoss from '../objects/BossDoor.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

/**
 * clase finalbossdoor
 * representa la puerta que lleva a la batalla final
 * requiere bosses especificos derrotados para abrirse
 */
export default class FinalBossDoor extends DoorBoss {

    /**
     * constructor de la puerta del jefe final
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
     * la abre solo si los bosses requeridos han sido derrotados
     */
    openDoor() {
        // comprobar si los bosses tristeza e ira han sido derrotados
        if (!PlayerDataManager.data.bossStatus.sadness || !PlayerDataManager.data.bossStatus.anger) {
            console.log("No se puede abrir la puerta: te falta matar dos bosses");
            this.showMessage("Necesitas derrotar como minimo dos bosses, IRA y TRISTEZA");
            return;
        }

        // si los requisitos se cumplen, ejecutar la logica de apertura de la clase base (doorboss)
        super.openDoor();
    }
}
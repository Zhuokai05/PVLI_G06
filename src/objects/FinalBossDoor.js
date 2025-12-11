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

    /**
     * muestra un mensaje temporal en la pantalla
     * @param {string} text - texto a mostrar
     */
    showMessage(text) {
        // estilo del texto temporal
        const textStyle = {
            font: '24px arial',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        };

        // crear texto en la posicion de la puerta
        const message = this.scene.add.text(
            this.x,
            this.y - 100,
            text,
            textStyle
        ).setOrigin(0.5).setDepth(1000);

        // hacer que el texto desaparezca despues de 3 segundos (2000ms de delay + 1000ms de duracion)
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => {
                message.destroy(); // destruir el objeto de texto
            }
        });
    }
}
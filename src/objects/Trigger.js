import PlayerDataManager from "../managers/PlayerDataManager.js";

/**
 * clase invisibletrigger
 * zona invisible que, al ser activada por el jugador, inicia un evento
 * tipicamente se usa para cerrar puertas e iniciar una secuencia de jefe
 */
export default class InvisibleTrigger extends Phaser.GameObjects.Zone {

    /**
     * constructor del trigger invisible
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     */
    constructor(scene, x, y) {
        super(scene, x, y, 256, 256); // dimension por defecto 256x256

        this.scene = scene;                          // referencia a la escena
        this.doors = [];                             // lista de puertas a cerrar

        scene.add.existing(this);                    // agregar a la escena
        scene.physics.add.existing(this);            // activar fisicas

        this.body.setAllowGravity(false);            // sin gravedad
        this.body.setImmovable(true);                // inmovible

        this.setVisible(false);                      // invisible real
        this.boss = null;                            // referencia al jefe asociado
    }

    /**
     * asigna el jefe que debe activarse
     * @param {object} boss - objeto jefe
     */
    getBoss(boss) {
        this.boss = boss;
    }

    /**
     * asigna el grupo de puertas a cerrar
     * @param {object} doorsArray - grupo de puertas
     */
    getDoors(doorsArray) {
        this.doors = doorsArray;
    }

    /**
     * inicia la secuencia del jefe si este no ha sido derrotado
     */
    llamar() {
        // comprobar si hay jefe y si no ha sido derrotado
        if (this.boss && !PlayerDataManager.data.bossStatus[this.boss.bossName]) {
            console.log("el boss de la puerta registrado es", this.boss);
            this.scene.startBossSequence(this.boss); // iniciar secuencia del jefe

            // cerrar todas las puertas asociadas
            this.doors.getChildren().forEach(door => {
                door.closeDoor();
            });
            
            this.destroy(); // destruir el trigger para que no se repita
        }
    }
}
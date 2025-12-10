import PlayerDataManager from '../managers/PlayerDataManager.js';
import DoorBoss from '../objects/BossDoor.js';

export default class SadnessBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

    }

    abrirPuerta() {
       
        if (PlayerDataManager.data.buttonStatus.blue
            && PlayerDataManager.data.buttonStatus.green
            && PlayerDataManager.data.buttonStatus.red) {
            super.abrirPuerta();
        }
        else console.log("No se puede abrir la puerta: faltan botones");
    }
}

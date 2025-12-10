import DoorBoss from '../objects/BossDoor.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

export default class FinalBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }

    abrirPuerta() {
        if (!PlayerDataManager.data.bossStatus.sadness || !PlayerDataManager.data.bossStatus.anger) {
            console.log("No se puede abrir la puerta: faltan botones");
            return;
        }

        super.abrirPuerta();
    }
}

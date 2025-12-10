import DoorBoss from '../objects/BossDoor.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

export default class FinalBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        if (PlayerDataManager.data.bossStatus.anger) this.iraboss = PlayerDataManager.data.bossStatus.anger;
        else this.iraboss = false;
        if (PlayerDataManager.data.bossStatus.sadness) this.tristeboss = PlayerDataManager.data.bossStatus.sadness;
        else this.tristeboss = false;
    }

    activarIra() {
        this.iraboss = true;
    }

    activarTriste() {
        this.tristeboss = true;
    }


    abrirPuerta() {
        if (!this.tristeboss || !this.iraboss) {
            console.log("No se puede abrir la puerta: faltan botones");
            return;
        }

        super.abrirPuerta();
    }
}

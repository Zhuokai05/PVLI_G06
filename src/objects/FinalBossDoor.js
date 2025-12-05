import DoorBoss from '../objects/BossDoor.js';

export default class FinalBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

 this.iraboss = false;
 this.tristeboss = false;
    }

    activarIra() {
        this.iraboss = true;
    }

    activarTriste() {
        this.tristeboss = true;
    }

   
    abrirPuerta() {
        if (!this.tristeboss|| !this.iraboss) 
        {
            console.log("No se puede abrir la puerta: faltan botones");
            return;
        }

        super.abrirPuerta();
    }
}

import DoorBoss from './BossDoor.js';

export default class SadnessBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.bottonRojo = false;
        this.bottonAzul = false;
        this.bottonVerde = false;
    }

    activarRojo() {
        this.bottonRojo = true;
    }

    activarAzul() {
        this.bottonAzul = true;
    }

    activarVerde() {
        this.bottonVerde = true;
    }

    abrirPuerta() {
        if (!this.bottonRojo || !this.bottonAzul || !this.bottonVerde) {
            console.log("No se puede abrir la puerta: faltan botones");
            return;
        }

        super.abrirPuerta();
    }
}

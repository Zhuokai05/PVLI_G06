import BasePlatform from "./Platform.js";

export default class IcePlatform extends BasePlatform {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.congelado = false;
    }

    congelar() {
        this.congelado = true;
    }

    descongelar() {
        this.congelado = false;
        this._activarPlataforma();
    }

    _activarPlataforma() {
        this.setActive(true);
        this.setVisible(true);

        if (this.body) {
            this.body.enable = true;
            this.body.setAllowGravity(false);
            this.body.moves = false;
            this.setImmovable(true);
        }
    }

    _desactivarPlataforma() {
        this.setActive(false);
        this.setVisible(false);

        if (this.body) {
            this.body.enable = false;
        }
    }

    action() {
        if (this.congelado) {
            this._desactivarPlataforma();
        } else {
            this._activarPlataforma();
        }
    }
}

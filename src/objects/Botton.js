export default class Button extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, color) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.color = color;

        this.door = null;
        this.show = null;   // <-- Nuevo

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.setInteractive();
    }

    setDoor(door) {
        this.door = door;
    }

    setShow(show) {
        this.show = show;
    }

    press() {
        if (this.show) {
            this.show.cambio();
        }

        if (!this.door) {
            console.warn("Button: No tiene puerta asignada.");
            return;
        }

        switch (this.color) {
            case 'rojo':
                this.door.activarRojo();
                break;

            case 'azul':
                this.door.activarAzul();
                break;

            case 'verde':
                this.door.activarVerde();
                break;
        }
    }
}

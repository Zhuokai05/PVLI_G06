export default class Button extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, door, color) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.door = door;
        this.color = color;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.setInteractive();
    }


    press() {
        switch (this.color) {
            case 'rojo':
                this.door.activarRojo();
                console.log("Rojo");
                break;
            case 'azul':
                this.door.activarAzul();
                console.log("Azul");
                break;
            case 'verde':
                this.door.activarVerde();
                console.log("Verde");
                break;
        }
    }
}

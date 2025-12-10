import PlayerDataManager from "../managers/PlayerDataManager.js";

export default class Button extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, color) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.color = color;
        this.pressedText = 'closedbutton';
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

    changeTexture(){
        this.setTexture(this.pressedText);
    }
    press() {

        this.show.isOn = true;
        
        if (!this.door) {
            console.warn("Button: No tiene puerta asignada.");
            return;
        }

        this.changeTexture();
        
        switch (this.color) {
            case 'rojo':
                PlayerDataManager.data.buttonStatus.red = true;
                break;

            case 'azul':
                PlayerDataManager.data.buttonStatus.blue = true;
                break;

            case 'verde':
                PlayerDataManager.data.buttonStatus.green = true;
                break;
        }

        this.show.changeTexture();
    }
}

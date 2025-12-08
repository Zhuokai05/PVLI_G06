export default class ShowButton extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, textureOff, textureOn) {
        super(scene, x, y, textureOff);

        this.scene = scene;
        this.textureOff = textureOff;
        this.textureOn = textureOn;

        this.isOn = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
    }

    cambio() {
        this.isOn = !this.isOn;

        if (this.isOn) {
            this.setTexture(this.textureOn);
        } else {
            this.setTexture(this.textureOff);
        }
    }
}

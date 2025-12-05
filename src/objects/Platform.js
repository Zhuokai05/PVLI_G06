export default class BasePlatform extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.body.moves = false;

        this.active = true;
        this.visible = true;
    }

    
    accion() {
        if (!this.active) return; 

        this.setActive(false);
        this.setVisible(false);

        if (this.body) {
            this.body.enable = false;
        }

        this.scene.time.delayedCall(10000, () => {

            this.setActive(true);
            this.setVisible(true);

            if (this.body) {
                this.body.enable = true;
                this.body.setAllowGravity(false);
                this.setImmovable(true);
                this.body.moves = false;
            }

        });
    }
}

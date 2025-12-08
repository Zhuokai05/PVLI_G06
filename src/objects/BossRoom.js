export default class BossRoom extends Phaser.GameObjects.Zone {
 
    constructor(scene, x, y, width, height) {
        super(scene, x + width / 2, y + height / 2, width, height); // center del zone

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(width, height);
    }
}

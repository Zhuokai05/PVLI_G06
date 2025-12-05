export default class FloorIsLava extends Phaser.GameObjects.TileSprite {
    constructor(scene, y, speed = 20, playerReference) {

        const width = 2000;
        const height = 500;


        super(scene, 0, y, width, height, 'lava_tex');

        this.scene = scene;
        this.riseSpeed = speed;
        this.playerRef = playerReference;


        this.setOrigin(0.5, 0);
        this.setDepth(100); 

        this.setScrollFactor(1);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setImmovable(true);
        this.body.allowGravity = false;
        this.body.setSize(width, height - 20);

        if (playerReference) {
            scene.physics.add.overlap(this.playerRef, this, () => {
                this.playerRef.die();
            });
        }
    }

    preUpdate(time, delta) {
        this.y -= this.riseSpeed * (delta / 1000);

        const cam = this.scene.cameras.main;
        this.x = cam.midPoint.x;

        this.tilePositionX = cam.scrollX;


        this.tilePositionX += time * 0.05; 

        this.tilePositionY -= 0.5; 
    }
}
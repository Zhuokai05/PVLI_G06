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
        this.isRising = false;
        this.setVisible(false);
    }
    
    // Actualizar la posición de la lava
    preUpdate(time, delta) {
        const cam = this.scene.cameras.main;
        this.x = cam.midPoint.x;
        //Si no está activada, no hacer nada
        if (!this.isRising) return;

        // Subir la lava
        this.y -= this.riseSpeed * (delta / 1000);
        this.tilePositionX = cam.scrollX;
        this.tilePositionX += time * 0.05;
        this.tilePositionY -= 0.5;
    }

    // Iniciar la subida de la lava
    startLava() {
        this.isRising = true;
        this.setVisible(true);
    }
}
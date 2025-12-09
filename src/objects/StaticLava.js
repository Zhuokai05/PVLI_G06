export default class StaticLava extends Phaser.GameObjects.TileSprite {
    constructor(scene, x, y, width, height, texture) {
        super(scene, x, y, width, height, texture);

        this.scene = scene;

        // 1. Configuración Visual
        this.setOrigin(0, 0);
        this.setDepth(100);

        // 2. Física (Para matar al jugador si la toca)
        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        // Ajustar hitbox
        this.body.setSize(width, height - 10);
        this.body.setOffset(0, 10);

        // 3. Configuración de Flujo (Velocidad de movimiento de la textura)
        this.flowSpeedX = 0.5;   
        this.flowSpeedY = 0.5; 
    }

    // Este método se ejecuta automáticamente en cada frame
    preUpdate(time, delta) {
        //this.tilePositionX += this.flowSpeedX;
        this.tilePositionY -= this.flowSpeedY;
    }
}
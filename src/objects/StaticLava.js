/**
 * clase staticlava
 * representa un obstaculo de lava estatica que mata al jugador
 * usa tilesprite para simular el movimiento del flujo
 */
export default class StaticLava extends Phaser.GameObjects.TileSprite {

    /**
     * constructor de la lava estatica
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {number} width - ancho de la zona de lava
     * @param {number} height - alto de la zona de lava
     * @param {string} texture - clave de la textura (tilesprite)
     */
    constructor(scene, x, y, width, height, texture) {
        super(scene, x, y, width, height, texture);

        this.scene = scene; // referencia a la escena

        // 1. configuracion visual
        this.setOrigin(0, 0); // origen en la esquina superior izquierda
        this.setDepth(100);   // profundidad alta

        // 2. fisica (para matar al jugador si la toca)
        scene.add.existing(this);             // agregar a la escena
        scene.physics.add.existing(this, true); // activar fisicas (cuerpo estatico)

        // ajustar hitbox (dejando un pequeño margen en la parte superior)
        this.body.setSize(width, height - 10);
        this.body.setOffset(0, 10);

        // 3. configuracion de flujo (velocidad de movimiento de la textura)
        this.flowSpeedX = 0.5;  
        this.flowSpeedY = 0.5; 
    }

    /**
     * actualiza la posicion de la textura para simular el flujo de la lava
     * este metodo se ejecuta automaticamente en cada frame
     * @param {number} time - tiempo total
     * @param {number} delta - delta de tiempo
     */
    preUpdate(time, delta) {
        //this.tilePositionX += this.flowSpeedX; // (movimiento horizontal comentado)
        this.tilePositionY -= this.flowSpeedY; // movimiento vertical de la textura
    }
}
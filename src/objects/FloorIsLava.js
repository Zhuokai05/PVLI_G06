/**
 * clase floorislava
 * representa el peligro de lava que sube, forzando al jugador a avanzar
 */
export default class FloorIsLava extends Phaser.GameObjects.TileSprite {

    /**
     * constructor de la lava
     * @param {object} scene - escena actual
     * @param {number} y - posicion vertical inicial
     * @param {number} [speed=20] - velocidad de subida
     * @param {object} playerReference - referencia al objeto jugador
     */
    constructor(scene, y, speed = 20, playerReference) {

        const width = 2000;
        const height = 500;

        super(scene, 0, y, width, height, 'lava_tex');
        this.y = y;                                // posicion y
        this.scene = scene;                        // referencia a la escena
        this.riseSpeed = speed;                    // velocidad de subida
        this.playerRef = playerReference;          // referencia al jugador

        this.setOrigin(0.5, 0);                    // origen en el centro inferior
        this.setDepth(100);                        // profundidad alta

        this.setScrollFactor(1);                   // seguir camara horizontalmente

        scene.add.existing(this);                  // agregar a la escena
        scene.physics.add.existing(this);          // activar fisicas

        this.body.setImmovable(true);              // inmovible
        this.body.allowGravity = false;            // sin gravedad
        this.body.setSize(width, height - 20);     // ajustar cuerpo fisico

        // deteccion de colision con el jugador
        if (playerReference) {
            scene.physics.add.overlap(this.playerRef, this, () => {
                if (!this.isRising) return;        // solo mata si esta subiendo
                this.playerRef.die();              // matar jugador
            });
        }
        this.isRising = false;                     // estado de subida
        this.setVisible(false);                    // invisible al inicio
    }

    /**
     * update logico antes de la actualizacion de phaser
     * actualiza la posicion y el scroll de la textura
     * @param {number} time - tiempo total
     * @param {number} delta - delta de tiempo
     */
    preUpdate(time, delta) {
        const cam = this.scene.cameras.main;
        
        // centrar horizontalmente con la camara
        this.x = cam.midPoint.x;

        // hacer scroll de la textura
        this.tilePositionX = cam.scrollX;
        this.tilePositionX += time * 0;
        this.tilePositionY -= 1;

        // si no esta activada, no subir
        if (!this.isRising) return;

        // subir la lava (movimiento vertical)
        this.y -= this.riseSpeed * (delta / 1000);

    }

    /**
     * inicia la subida de la lava
     */
    startLava() {
        this.y = this.playerRef.y + 300;           // posicion inicial (debajo del jugador)
        this.isRising = true;                      // activar subida
        this.setVisible(true);                     // hacer visible
    }

    /**
     * detiene la subida de la lava
     */
    stopLava() {
        if (this.isRising) {
            this.isRising = false;                 // desactivar subida
            
            // opcional: animacion de descenso suave
            this.scene.tweens.add({
                targets: this,
                y: this.y + 50,                    // baja 50 pixeles suavemente
                duration: 1000,
                ease: 'Power2'
            });
        }
    }
}
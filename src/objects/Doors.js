/**
 * clase door
 * clase base para objetos de tipo puerta
 * gestiona fisicas basicas y estados de apertura
 */
export default class Door extends Phaser.Physics.Arcade.Sprite
{

    /**
     * constructor de la puerta
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} texture - clave de textura
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;                   // referencia a la escena
        this.abrir = false;                   // estado de apertura

        scene.add.existing(this);             // agregar a la escena
        scene.physics.add.existing(this);     // activar fisicas
        this.body.setAllowGravity(false);     // desactiva gravedad
        this.body.setGravity(0);              // asegura gravedad cero
    }


    /**
     * alterna el estado de apertura
     */
    changeOpen()
    {
        this.abrir = !this.abrir;             // invertir valor

    }

    /**
     * abre la puerta
     * pensado para ser sobreescrito por clases hijas
     */
    openDoor()
    {
        // se sobreescribira en clases hijas
        console.log("Puerta abierta");
    }

    /**
     * cierra la puerta
     * pensado para ser sobreescrito por clases hijas
     */
    closeDoor()
    {
        // se sobreescribira en clases hijas
        console.log("Puerta cerrada");
    }

      /**
     * muestra un mensaje temporal en la pantalla
     * @param {string} text - texto a mostrar
     */
    showMessage(text) {
        // estilo del texto temporal
        const textStyle = {
            font: '24px arial',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        };

        // crear texto en la posicion de la puerta
        const message = this.scene.add.text(
            this.x,
            this.y - 100,
            text,
            textStyle
        ).setOrigin(0.5).setDepth(1000);

        // hacer que el texto desaparezca despues de 3 segundos (2000ms de delay + 1000ms de duracion)
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => {
                message.destroy(); // destruir el objeto de texto
            }
        });
    }
}
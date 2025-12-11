import MusicManager from '../managers/MusicManager.js';

/**
 * clase pausescene
 * escena de pausa que se superpone a la escena de juego
 */
class PauseScene extends Phaser.Scene 
{
    /**
     * constructor de la escena de pausa
     */
    constructor() 
    {
        super('Pause'); // clave de la escena
        
    }

    /**
     * metodo init
     * recibe los datos pasados al iniciar la escena
     * @param {object} data - datos pasados, incluyendo la clave de la escena a pausar
     */
    init (data) 
    {
        this.file = data.file; // clave de la escena de juego pausada
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() 
    {
        // crear un fondo semitransparente para oscurecer la escena de juego
        this.add.rectangle(
            this.cameras.main.width /2, this.cameras.main.height / 2,     // posicion (centro)
            this.cameras.main.width, this.cameras.main.height,           // tamaño (toda la pantalla)
            0x000000, 0.5     // color negro + opacidad
        );

        // crear boton 'jugar' (reanudar)
        var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'jugar');
        play.setScale(0.3);                 // ajustar escala del boton
        play.setInteractive();              // hacerlo interactivo

        // evento al hacer click en el boton 'jugar'
        play.on('pointerdown', () => {
            this.scene.stop();              // detener la escena de pausa
            this.scene.resume(this.file);   // reanudar la escena de juego pausada
        });

        // input: tecla esc para reanudar
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();              // detener la escena de pausa
            this.scene.resume(this.file);   // reanudar la escena de juego pausada
        });
    }

    /**
     * metodo update
     * no se usa logica continua en la escena de pausa
     * @param {number} time - tiempo total
     * @param {number} delta - delta de tiempo
     */
    update(time, delta) 
    {
        
    }
}
export {PauseScene}
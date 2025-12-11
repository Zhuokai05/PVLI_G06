import MusicManager from '../managers/MusicManager.js';

/**
 * clase mainmenuscene
 * representa el menu principal del juego
 */
class MainMenuScene extends Phaser.Scene {

    /**
     * constructor de la escena de menu principal
     */
    constructor() {
        super('MainMenu'); // clave de la escena
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() {
        // imagen de fondo, centrada
        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.background.setScale(1, 0.75); // ajustar escala del fondo
        
        // imagen del titulo, centrada
        this.name = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 4, 'name');
        this.name.setScale(0.5, 0.45); // ajustar escala del titulo
        
        // boton 'jugar' (iniciar juego)
        var play = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 1.25, 'jugar');
        play.setScale(0.3); // ajustar escala del boton
        play.setInteractive(); // hacerlo interactivo

        // evento al hacer click en el boton 'jugar'
        play.on('pointerdown', () => {
            this.scene.stop();        // detener la escena actual
            //this.scene.start('loading'); // ir a la escena de carga/juego (opcion 1)
            this.scene.start('Narrative'); // ir a la escena de narrativa (opcion 2)
        });

        // iniciar musica de fondo
        MusicManager.play(this, 'bg_Music', 0.5);
    }

    /**
     * hook de phaser para la actualizacion logica
     * @param {number} time - tiempo total
     * @param {number} delta - delta de tiempo
     */
    update(time, delta) {
    }
}
export { MainMenuScene }
/**
 * clase winscene
 * representa la pantalla de victoria del juego
 */
class WinScene extends Phaser.Scene 
{
    /**
     * constructor de la escena de victoria
     */
    constructor() 
    {
        super('Win'); // clave de la escena
        
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() 
    {
        // agregar imagen de fondo, centrada
        this.background = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'win');
        this.background.setScale(1, 0.75); // ajustar escala del fondo

        // agregar imagen del titulo 'victoria', centrada
        this.name = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 4,'victoria');
        this.name.setScale(0.5, 0.45); // ajustar escala del titulo

        // agregar boton 'jugar' (reintentar o volver al inicio)
        var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 1.25,'jugar');
        play.setScale(0.3); // ajustar escala del boton
        play.setInteractive(); // hacerlo interactivo

        // evento al hacer click en el boton 'jugar'
        play.on('pointerdown', () => {
            this.scene.stop();      // detener la escena actual
            this.scene.start('Loading'); // iniciar la escena de carga/reinicio del juego
            
        });

             
    }
}
export {WinScene}
import PlayerDataManager from '../managers/PlayerDataManager.js';

/**
 * clase gameoverscene
 * representa la pantalla de derrota del juego, permitiendo al jugador reintentar
 */
class GameOverScene extends Phaser.Scene {

    /**
     * constructor de la escena de fin de juego
     */
    constructor() {
        super('GameOver'); // clave de la escena
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() {
        console.log('gameoverscene creada exitosamente');
        
        // fondo de derrota
        this.background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'defeat'
        );
        this.background.setScale(0.75, 1); // ajustar escala

        // boton reintentar
        var retryButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 1.6,
            "jugar" // reusa la textura 'jugar'
        );
        retryButton.setScale(0.3);
        retryButton.setTint(0xff4444); // tint rojo para distinguirlo de 'jugar' normal
        retryButton.setInteractive();

        // evento al hacer click: iniciar respawn
        retryButton.on("pointerdown", () => {
            this.respawnPlayer();
        });
    }

    /**
     * logica para reaparecer al jugador en el ultimo checkpoint guardado
     */
    respawnPlayer() {
        // obtenemos la escena del nivel, la cual deberia ser playscene o loading (si se usa para iniciar el nivel)
        // se asume que 'loading' es el contenedor/iniciador del nivel
        let level = this.scene.get("Loading");

        // restauramos la posicion del checkpoint (desde playerdatamanager)
        // nota: el respawnpoint se usa dentro de la playscene al crearse
        let pos = PlayerDataManager.data.respawnPoint; 

        // limpiamos escena gameover
        this.scene.stop();

        // reactivamos la escena del nivel (inicia de nuevo la playscene con el respawn point)
        // asumiendo que el nivel principal es 'playscene', el 'loading' solo carga assets
        // y la logica de respawn es manejada por el inicio de playscene.
        // si la escena del nivel es la que murio, debemos saber cual es su clave.
        // por simplicidad y segun el codigo anterior, se asume que inicia 'loading' para cargar el nivel de nuevo:
        this.scene.start('Loading'); // vuelve a la escena de carga que iniciara el nivel
        
        // playerdatamanager ya guarda el estado de vida, orbes y checkpoint
        console.log("jugador respawned en checkpoint", pos);
    }
}

export { GameOverScene };
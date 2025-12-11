import PlayerDataManager from '../managers/PlayerDataManager.js';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        console.log('GameOverScene creada exitosamente');
        // Fondo de derrota
        this.background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'defeat'
        );
        this.background.setScale(0.75, 1);



        /* Botón para volver al menú principal
        var backButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 1.25,
            'jugar'
        );
        backButton.setScale(0.3);
        backButton.setInteractive();

        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('MainMenu');
        })

        // Efecto de hover para el botón
        backButton.on('pointerover', () => {
            backButton.setTint(0xcccccc);
            backButton.setScale(0.32);
        });

        backButton.on('pointerout', () => {
            backButton.clearTint();
            backButton.setScale(0.3);
        });*/

        // Botón reintentar
        var retryButton = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 1.6,
            "jugar"
        );
        retryButton.setScale(0.3);
        retryButton.setTint(0xff4444); // para distinguirlo
        retryButton.setInteractive();

        retryButton.on("pointerdown", () => {
            this.respawnPlayer();
        });



    }

    respawnPlayer() {
        // volvemos al nivel donde murió (TestPlayerScene)
        let level = this.scene.get("Loading");

        // restauramos la posición del checkpoint
        let pos = level.respawnPoint;

        // limpiamos escena GameOver
        this.scene.stop();

        // reactivamos la escena del nivel
        level.scene.start();

        //PlayerDataManager.resetForRetry();
        console.log("Jugador respawned en checkpoint", pos);
    }


    update(time, delta) {

    }
}

export { GameOverScene };
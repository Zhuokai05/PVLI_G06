import PlayerDataManager from "../managers/PlayerDataManager.js";

export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Usamos la imagen 'checkpoint' (AltarCheckpoint.png) precargada
        super(scene, x, y, "checkpoint");

        // Mostrar sprite como altar: origen en la base para que "pise" el suelo
        this.setOrigin(0.5, 1);
        // Ajusta escala si hace falta (cambiar a gusto)
        this.setScale(1);
        this.setDepth(3);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Hacemos el body inmóvil y sin gravedad para que actúe como trigger
        this.setImmovable(true);
        this.body.allowGravity = false;

        // Ajustar el tamaño del cuerpo de colisión para que coincida con la base del altar
        if (this.body.setSize) {
            // width, height
            this.body.setSize(Math.floor(this.width * 0.6), Math.floor(this.height * 0.25));
            // centrar el body en la parte inferior
            this.body.setOffset(Math.floor((this.width - this.body.width) / 2), Math.floor(this.height - this.body.height));
        }

        this.activated = false;
        this.playerNearby = false;

        // prompt para indicar tecla de interacción (invisible por defecto)
        this.prompt = this.scene.add.text(this.x, this.y - this.height - 10, 'Presiona E', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 6, y: 4 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        // evento global de tecla E — intentará abrir el menú si el jugador está cerca
        this._keydownHandler = (event) => {
            // event.key debería ser 'e' o 'E'
            if ((event.key === 'e' || event.key === 'E') && this.playerNearby) {
                // activa checkpoint y abre menú de orbes
                const player = this.scene.player;
                if (player) this.activate(player);
                // pausar la escena actual y lanzar el menú de selección
                const fromKey = this.scene.sys.config.key || null;
                // asegurarnos de pausar la escena origen por su key (no pausa global)
                if (fromKey) this.scene.scene.pause(fromKey);
                else this.scene.scene.pause();
                this.scene.scene.launch('OrbSelect', { fromScene: fromKey });
            }
        };

        this.scene.input.keyboard.on('keydown', this._keydownHandler);
    }

    activate(player) {
        if (this.activated) return;

        this.activated = true;
        // efecto visual de activación: tint y pequeño pulso
        this.setTint(0x00ff00);
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.08,
            scaleY: this.scaleY * 1.08,
            yoyo: true,
            duration: 200,
            ease: 'Power1',
        });

        console.log("CHECKPOINT ACTIVADO en:", this.x, this.y);

        // recuperar vida
        player.health = player.maxHealth;
        player.emit("updateHearts", player.health);

        // guardar respawn en la escena
        player.respawnPoint = { x: this.x, y: this.y - 50};

        // guardar datos globales
        PlayerDataManager.saveFromPlayer(player);
    }
}

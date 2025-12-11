import PlayerDataManager from "../managers/PlayerDataManager.js";

/**
 * clase cheatmanager
 * provee un menu de trucos (teletransporte) para debug
 */
export default class CheatManager {

    /**
     * constructor del gestor de trucos
     * @param {object} scene - escena actual
     * @param {object} player - referencia al objeto jugador
     */
    constructor(scene, player) {
        this.scene = scene;                        // referencia a la escena
        this.player = player;                      // referencia al jugador
        this.visible = false;                      // estado de visibilidad del menu

        // definir las ubicaciones de teletransporte
        this.locations = [
            { name: "spawn inicial", x: 950, y: 900 },
            { name: "boss tutorial", x: 3700, y: 1554 },
            { name: "boss ira", x: 6000, y: 4500 },
            { name: "boss tristeza", x: 16800, y: 3750 },
            { name: "boss miedo", x: 3036, y: 2392 },
            { name: "floor is lava", x: 18111, y: 11876 },
            { name: "boss final izquierda", x: 17233, y: 8351 },
            { name: "boss final derecha", x: 18955, y: 8685 },
            { name: "subida de dos zonas", x: 1936, y: 5412 }
        ];

        // input (shift + t)
        this.keyTeleport = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // crear el menu
        this.createMenu();
    }

    /**
     * crea el menu visual de teletransporte
     */
    createMenu() {
        // contenedor para los elementos del menu
        this.menuContainer = this.scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);

        // fondo del menu
        const bg = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            400,
            500,
            0x000000,
            0.8
        );
        this.menuContainer.add(bg);

        // titulo
        const title = this.scene.add.text(this.scene.scale.width / 2, 100, " cheat menu: teleport ", {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.menuContainer.add(title);

        // generar botones dinamicamente segun la lista 'locations'
        this.locations.forEach((loc, index) => {
            const btnY = 160 + (index * 40);

            const btnText = this.scene.add.text(this.scene.scale.width / 2, btnY, `> ${loc.name}`, {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#222222',
                padding: { x: 10, y: 5 }
            })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true });

            // eventos del raton
            btnText.on('pointerover', () => btnText.setColor('#ffff00'));
            btnText.on('pointerout', () => btnText.setColor('#ffffff'));
            btnText.on('pointerdown', () => {
                this.teleportTo(loc); // teletransportar al hacer click
            });

            this.menuContainer.add(btnText);
        });

        // boton de cerrar (x) 
        const closeBtn = this.scene.add.text(this.scene.scale.width / 2, 450, "[ cerrar ]", {
            fontSize: '16px', color: '#aaaaaa'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.toggleMenu());
        this.menuContainer.add(closeBtn);
    }

    /**
     * metodo update para la deteccion de input de apertura del menu
     */
    update() {
        // detectar combinacion shift + t
        if (this.keyShift.isDown && Phaser.Input.Keyboard.JustDown(this.keyTeleport)) {
            this.toggleMenu();
        }
    }

    /**
     * muestra u oculta el menu y pausa/reanuda las fisicas
     */
    toggleMenu() {
        this.visible = !this.visible;
        this.menuContainer.setVisible(this.visible); // cambiar visibilidad

        if (this.visible) {
            // pausar fisica para que no te maten mientras eliges
            this.scene.physics.pause();
        } else {
            // reanudar fisica
            this.scene.physics.resume();
        }
    }

    /**
     * teletransporta al jugador a la ubicacion seleccionada y actualiza el respawn point
     * @param {object} location - objeto con las coordenadas x e y de destino
     */
    teleportTo(location) {

        this.player.setPosition(location.x, location.y); // mover jugador
        this.player.setVelocity(0, 0); // detener movimiento

        // actualizar punto de respawn en los datos persistentes
        PlayerDataManager.data.respawnPoint = { x: location.x, y: location.y };

        this.toggleMenu(); // cerrar menu despues de teletransportar
    }
}
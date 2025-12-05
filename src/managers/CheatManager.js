import PlayerDataManager from "../managers/PlayerDataManager.js";

export default class CheatManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.visible = false;

        // Definir las ubicaciones de teletransporte
        this.locations = [
            { name: "Spawn Inicial", x: 950, y: 900 },
            { name: "Boss Tristeza", x: 2500, y: 1400 },
            { name: "Boss Ira", x: 6000, y: 4500 },
            { name: "Final del Nivel", x: 10000, y: 500 }
        ];

        // Input (SHIFT + T)
        this.keyTeleport = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.keyShift = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // Crear el menú
        this.createMenu();
    }

    // Crear el menú de teletransporte
    createMenu() {
        this.menuContainer = this.scene.add.container(0, 0).setDepth(1000).setScrollFactor(0).setVisible(false);

        const bg = this.scene.add.rectangle(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2,
            400,
            500,
            0x000000,
            0.8
        );
        this.menuContainer.add(bg);

        // Título
        const title = this.scene.add.text(this.scene.scale.width / 2, 100, " CHEAT MENU: TELEPORT ", {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.menuContainer.add(title);

        // Generar botones dinámicamente según la lista 'locations'
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

            // Eventos del ratón
            btnText.on('pointerover', () => btnText.setColor('#ffff00'));
            btnText.on('pointerout', () => btnText.setColor('#ffffff'));
            btnText.on('pointerdown', () => {
                this.teleportTo(loc);
            });

            this.menuContainer.add(btnText);
        });

        // Botón de Cerrar (X) 
        const closeBtn = this.scene.add.text(this.scene.scale.width / 2, 450, "[ CERRAR ]", {
            fontSize: '16px', color: '#aaaaaa'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.toggleMenu());
        this.menuContainer.add(closeBtn);
    }

    update() {
        // Detectar combinación SHIFT + T
        if (this.keyShift.isDown && Phaser.Input.Keyboard.JustDown(this.keyTeleport)) {
            this.toggleMenu();
        }
    }

    // Mostrar u ocultar el menú
    toggleMenu() {
        this.visible = !this.visible;
        this.menuContainer.setVisible(this.visible);

        if (this.visible) {
            // Pausar física para que no te maten mientras eliges
            this.scene.physics.pause();
        } else {
            // Reanudar física
            this.scene.physics.resume();
        }
    }
    // Teletransportar al jugador a la ubicación seleccionada
    teleportTo(location) {

        this.player.setPosition(location.x, location.y);
        this.player.setVelocity(0, 0);

        PlayerDataManager.data.respawnPoint = { x: location.x, y: location.y };

        this.toggleMenu();
    }
}
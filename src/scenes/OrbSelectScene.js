import PlayerDataManager from '../managers/PlayerDataManager.js';

class OrbSelectScene extends Phaser.Scene {
    constructor() {
        super('OrbSelect');
    }

    create(data) {
        const fromScene = data.fromScene;

        // creamos fondo y panel
        this.createBackground();
        this.createPanel();

        this.player = data.tPlayer; //cogemos el player que nos ha pasado la escena anterior
        this.collectedOrbs =  this.player.orbs || []; 
        this.equipped =  this.player.equippedOrbs || [null, null];
        
        //pintamos todo el ui
        this.drawTitle();
        this.drawOrbList();
        this.drawSlots();
        this.drawCloseButton(fromScene);
    }

    //pintamos un fondo rectangular
    createBackground() {
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.6
        ).setDepth(5);
    }

    //pintamos un panel rectangular
    createPanel() {
        const w = 400, h = 320;
        this.panel = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            w, h,
            0x222222
        )
        .setStrokeStyle(2, 0xffffff)
        .setDepth(6);

        this.panelTop = this.panel.y - h / 2;
    }

    //titulo del menu de seleccion de orbes
    drawTitle() {
        this.add.text(
            this.cameras.main.centerX,
            this.panelTop + 25,
            "Seleccionar Orbe",
            { font: "20px Arial", fill: "#fff" }
        )
        .setOrigin(0.5)
        .setDepth(7);
    }

    //lista de orbes coleccionados
    drawOrbList() {
        this.orbButtons = [];
        let y = this.panelTop + 70;

        for (let orb of this.collectedOrbs) {
            const nameText = this.add.text(
                this.cameras.main.centerX - 120, y,
                orb.name,
                { font: "16px Arial", fill: "#fff" }
            )
            .setOrigin(0, 0.5)
            .setDepth(7);

            const actionText = this.add.text(
                this.cameras.main.centerX + 120, y,
                (orb?.equipped) ? "Desequipar" : "Equip",
                { font: "14px Arial", fill: "#fff", backgroundColor: "#444" }
            )

            .setOrigin(1, 0.5)
            .setDepth(7)
            .setInteractive({ useHandCursor: true });

            actionText.on("pointerdown", () => {
                this.toggleEquip(orb);
                this.refreshUI();
            });

            this.orbButtons.push({ nameText, actionText,orb });
            y += 36;
        }
    }

    //slots de orbes equipados
    drawSlots() {
        const slotY = this.panelTop + 230;
        this.slotTexts = [];

        for (let i = 0; i < 2; i++) {
            const text = this.add.text(
                this.cameras.main.centerX - 120 + i * 150,
                slotY,
                `Slot ${i+1}: ${this.equipped[i]?.name ?? "Empty"}`,
                { font: "14px Arial", fill: "#fff", backgroundColor: "#222" }
            )
            .setOrigin(0, 0.5)
            .setDepth(7);

            this.slotTexts.push(text);
        }
    }

    //boton para salir del menu
    drawCloseButton(fromScene) {
        const y = this.panel.y + this.panel.height / 2 - 35;

        const btn = this.add.text(
            this.cameras.main.centerX, y,
            "Cerrar",
            { font: "16px Arial", fill: "#fff", backgroundColor: "#444" }
        )
        .setOrigin(0.5)
        .setDepth(7)
        .setInteractive({ useHandCursor: true });

        btn.on("pointerdown", () => {

            // Reanudar escena original
            this.scene.resume(fromScene);

            this.scene.stop();
            
            PlayerDataManager.saveDataFromPlayer(this.player);
        });
    }

    //metodo para activar o desactivar un orbe
    toggleEquip(orb) {

        const i = this.equipped.indexOf(orb);

        //si esta equipado el orbe
        if (i !== -1) {
            this.player.desEquipOrb(i);
            return;
        }

        const empty = this.equipped.indexOf(null);

        //si no esta equipado el orbe y hay hueco libre
        if (empty !== -1)
        {
            this.player.equipOrb(empty,orb)
        }

        //si no esta equipado el orbe y hay hueco libre, lo dejamos en el 0
        else
        {
            this.player.desEquipOrb(0);
            this.player.equipOrb(0,orb)
        }
    }

    //actualizar ui tras haber hecho cambios
    refreshUI() {

        // actualizar el texto de los botones
        let index = 0;
        for (let { nameText, actionText,orb} of this.orbButtons) {
            actionText.setText(
               orb?.equipped ? "Desequipar" : "Equip"
            );
            index++; 
        }

        // acturalizar el texto de los slots
        for (let i = 0; i < 2; i++) {
            this.slotTexts[i].setText(
                `Slot ${i+1}: ${this.equipped[i]?.name ?? "Empty"}`
            );
        }
    }
}

export { OrbSelectScene };

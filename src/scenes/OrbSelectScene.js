import PlayerDataManager from '../managers/PlayerDataManager.js';

export class OrbSelectScene extends Phaser.Scene {
    constructor() {
        super('OrbSelect');
    }

    create(data) {

        this.fromScene = data.fromScene;

        this.player = data.tPlayer;

        //orbes recogidos
        this.collectedOrbs = this.player.orbs || [];
        
        //orbes equipados
        this.equipped = this.player.equippedOrbs || [null, null];

        //orbe seleccionado 
        this.selectedOrb = null;

        //creamos el fondo
        this.createBackground();

        //creamos el panel de inventario de orbes
        this.createInventoryPanel();

        //creamos el grid de orbes obtenidos
        this.createOrbGrid();

        //creamos el panel derecho
        this.createRightPanel();
        
        //creamos boton de cerrar el juego
        this.createCloseButton();

        //al abrir el panel salen los slots actualizados
        this.refreshSlots(); 
    }

    //fondo transparente
    createBackground() {
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.6 //transparencia del fondo
        ).setDepth(1);
    }

    // penel izquierdo, inventario
    createInventoryPanel() {
        let centerX = this.cameras.main.centerX - 240;
        let centerY = this.cameras.main.centerY;
        let width = 460;
        let height = 460;

        //creamos el panel
        this.inventoryPanel = this.add.rectangle(
            centerX, centerY,
            width, height,
            0x333333
        )

        //le ponemos un marco al panel
        .setStrokeStyle(2, 0xffffff)
        .setDepth(4);
    }

    // grid de orbes
    createOrbGrid() {

        this.orbIcons = []; //iconos de orbes
        this.orbBackgrounds = []; //fondo de orbes
        this.orbNames = []; // nombre de orbes 

        //posicion del primer orbe (izquierda arriba)
        let startX = this.inventoryPanel.x - 165;
        let startY = this.inventoryPanel.y - 140;

        //espacio entre orbes
        let spacingX = 110;
        let spacingY = 120;

        //orbes por fila
        let iconsPerRow = 4;

        // fondo detras del icono
        let bgWidth = 70;
        let bgHeight = 70;
        
        let col = 0;
        let row = 0;

        for (let orb of this.collectedOrbs) {

            let posX = startX + col * spacingX;
            let posY = startY + row * spacingY;

            //creamos el fondo detras del orbe para poder poner un marco 
            let bg = this.add.rectangle(
                posX, posY,
                bgWidth, bgHeight, 
                orb.equipped ? 0x00AA00 : 0x222222 //depende de si esta equipado cambia de color
            )
            .setStrokeStyle(2, 0xffffff) //ponemos el marco
            .setDepth(5);

            this.orbBackgrounds.push({ bg, orb });

            // icono del orbe
            let icon = this.add.image(posX, posY, orb.texture.key)
                .setScale(0.3)
                .setInteractive({ useHandCursor: true })
                .setDepth(6);

            icon.on("pointerdown", () => this.selectOrb(orb)); //el orbe seleccionado 

            this.orbIcons.push({ icon, orb });

            // ponemos el nombre de cada orbe
            let nameText = this.add.text(
                posX, posY + 50,
                orb.name,
                {
                    font: "14px Arial",
                    fill: "#ffffff"
                }
            )
            .setOrigin(0.5)
            .setDepth(6);

            this.orbNames.push({ nameText, orb });

            col++;

            //si hemos llenado una fila
            if (col >= iconsPerRow) {
                col = 0;
                row++;
            }
        }
    }

    // panel derecho donde incluye el orbe seleccionado y la informacion de los slots
    createRightPanel() {

        let centerX = this.cameras.main.centerX + 250;
        let centerY = this.cameras.main.centerY;

        //fondo
        this.panel = this.add.rectangle(centerX, centerY, 300, 400, 0x222222)
            .setStrokeStyle(2, 0xffffff)
            .setDepth(5);

        //icono del orbe seleccionado
        this.panelIcon = this.add.image(centerX, centerY - 120, '')
            .setScale(0.6)
            .setVisible(false)
            .setDepth(6);

        //nombre del orbe seleccionado
        this.panelName = this.add.text(centerX, centerY - 40, "", {
            font: "20px Arial",
            fill: "#ffffff"
        })
        .setOrigin(0.5)
        .setDepth(6);

        //descropcion del orbe seleccionado
        this.panelDesc = this.add.text(centerX, centerY, "", {
            font: "16px Arial",
            fill: "#cccccc",
            wordWrap: { width: 260 }
        })
        .setOrigin(0.5)
        .setDepth(6);

        //el boton de equipar
        this.btnEquip = this.add.text(centerX, centerY + 80, "Equip", {
            font: "18px Arial",
            fill: "#fff",
            backgroundColor: "#444",
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(6);

        this.btnEquip.on("pointerdown", () => {
            if (!this.selectedOrb) return; //si no has seleccionado

            if (!this.selectedOrb.equipped && this.noSlot()) { //si no queda slot libres
                this.screenShake();
            }

            this.toggleEquip(this.selectedOrb);
            this.updateRightPanel();
        });

        this.slotSprites = [];
        this.slotOrbSprites = [];

        let slotY = centerY + 160;
        let slotXStart = centerX - 40;
        let slotSpacing = 80;

        for (let i = 0; i < 2; i++) {

            // Fondo del slot
            let slotBg = this.add.image(
                slotXStart + i * slotSpacing, 
                slotY,
                "orbSlot"
            )
            .setScale(1)
            .setDepth(6)
            .setScale(0.3)
            .setInteractive({ useHandCursor: true });
            slotBg.on("pointerdown", () => {
                let orb = this.equipped[i];
                if (orb) {
                    this.selectOrb(orb);
                }
            });

            this.slotSprites.push(slotBg);

            // Icono del orbe equipado
            let orbIcon = this.add.image(
                slotBg.x,
                slotBg.y,
                ""
            )
            .setScale(0.3)
            .setVisible(false)
            .setDepth(7)
            .setInteractive({ useHandCursor: true }); 

            orbIcon.on("pointerdown", () => {
                let orb = this.equipped[i];
                if (orb) {
                    this.selectOrb(orb);
                }
            });

            this.slotOrbSprites.push(orbIcon);
        }
    }

    // Al seleccionar orbe
    selectOrb(orb) {
        this.selectedOrb = orb;
        this.updateRightPanel();
        this.refreshOrbGridColors();
    }

    // actualizar el panel derecho
    updateRightPanel() {

        if (!this.selectedOrb) return; //si no has seleccionado nada, el panel queda vacio

        this.panelIcon
            .setTexture(this.selectedOrb.texture.key)
            .setVisible(true);

        this.panelName.setText(this.selectedOrb.name);
        this.panelDesc.setText(this.selectedOrb.description);

        if (!this.selectedOrb.equipped && this.noSlot()) { //si no hay hueco libre
            this.btnEquip.setText("Slots lleno");
            this.btnEquip.setStyle({
                fill: "#FFFFFF",
                backgroundColor: "#AA0000"
            });
        } else {
            this.btnEquip.setText(this.selectedOrb.equipped ? "Desequipar" : "Equip");
            this.btnEquip.setStyle({
                fill: "#FFFFFF",
                backgroundColor: "#444444"
            });
        }
    }

    // equipar o desequipar orbes
    toggleEquip(orb) {

        let index = this.equipped.indexOf(orb);

        if (index !== -1) { // si esta equipado el orbe lo desequipamos
            this.player.desEquipOrb(index); 
        }
        else { // sino, buscamos el slot libre si lo hay
            let empty = this.equipped.indexOf(null);
            if (empty !== -1) {
                this.player.equipOrb(empty, orb);
            }
        }

        //actualizamos
        this.refreshSlots();
        this.refreshOrbGridColors();
    }

    // actualizar ui de los slots
    refreshSlots() {

        for (let i = 0; i < 2; i++) {
            let orb = this.equipped[i];
            let orbSprite = this.slotOrbSprites[i];

            if (orb) {
                orbSprite.setTexture(orb.texture.key);
                orbSprite.setVisible(true);
            } else {
                orbSprite.setVisible(false);
            }
        }
    }

    // actualizar color de los orbes equipados
    refreshOrbGridColors() {

        for (let entry of this.orbBackgrounds) {
            let { bg, orb } = entry;

            bg.setFillStyle(orb.equipped ? 0x00AA00 : 0x222222); //si esta equipado, se pone verde el relleno

            if (this.selectedOrb === orb) {
                bg.setStrokeStyle(3, 0xFFD700); // el borde del orbe seleccionado se pone amarillo
            } else {
                bg.setStrokeStyle(2, 0xffffff);
            }
        }
    }

    // si hay hueco libre
    noSlot() {
        let count = 0;
        for (let orb of this.equipped) {
            if (orb !== null) count++;
        }
        return count >= this.equipped.length;
    }

    //vibra la pantalla 
    screenShake() {
        this.cameras.main.shake(150, 0.015);
    }

    // boton de cerrar el panel de orbes
    createCloseButton() {
        let btn = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 50,
            "Cerrar",
            {
                font: "18px Arial",
                fill: "#fff",
                backgroundColor: "#444",
                padding: { x: 10, y: 5 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(10);

        btn.on("pointerdown", () => {
            this.scene.resume(this.fromScene); //carga la escena de la que venimos
            this.scene.stop();
            PlayerDataManager.saveDataFromPlayer(this.player); //guarda en el player los cambios aplicados
        });
    }
}

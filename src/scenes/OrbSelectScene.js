import PlayerDataManager from '../managers/PlayerDataManager.js';

class OrbSelectScene extends Phaser.Scene {
    constructor() {
        super('OrbSelect');
    }

    create(data) {
        console.log('OrbSelect creada, datos:', data);

        const from = data && data.fromScene ? data.fromScene : null;
        // fondo semi-transparente
        this.bg = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6).setDepth(50);

        // panel
        const panelW = 400, panelH = 300;
        const panelX = this.cameras.main.width/2 - panelW/2;
        const panelY = this.cameras.main.height/2 - panelH/2;
        this.panel = this.add.rectangle(this.cameras.main.width/2, this.cameras.main.height/2, panelW, panelH, 0x222222).setDepth(51).setStrokeStyle(2, 0xffffff);

        this.title = this.add.text(this.cameras.main.width/2, panelY + 20, 'Seleccionar Orbe', { font: '20px Arial', fill: '#fff' }).setOrigin(0.5).setDepth(52);

        // mostrar orbes recogidos y permitir equipar/ desequipar
        this.levelScene = from ? this.scene.get(from) : null;

        const collected = PlayerDataManager.data.collectedOrbNames || [];
        this.equipped = PlayerDataManager.data.equippedOrbNames || [null, null];

        const startY = panelY + 60;
        this.itemTexts = [];
        collected.forEach((orbName, idx) => {
            const y = startY + idx * 36;
            const t = this.add.text(this.cameras.main.width/2 - 80, y, orbName, { font: '16px Arial', fill: '#fff' }).setOrigin(0, 0.5).setDepth(52);
            const status = this.add.text(this.cameras.main.width/2 + 80, y, this._isEquipped(orbName) ? 'Equipped' : 'Equip', { font: '14px Arial', fill: '#fff', backgroundColor: '#444' }).setOrigin(0.5).setDepth(52);
            status.setInteractive({ useHandCursor: true });
            status.on('pointerdown', () => {
                this._toggleEquip(orbName);
                status.setText(this._isEquipped(orbName) ? 'Equipped' : 'Equip');
            });
            this.itemTexts.push({ nameText: t, actionText: status });
        });

        // mostrar slots equipados
        this.slotTexts = [];
        for (let i = 0; i < 2; i++) {
            const sx = this.cameras.main.width/2 - 80 + i*160;
            const sy = panelY + panelH - 70;
            const s = this.add.text(sx, sy, `Slot ${i+1}: ${this.equipped[i] || 'Empty'}`, { font: '14px Arial', fill: '#fff', backgroundColor: '#222' }).setOrigin(0,0.5).setDepth(52);
            this.slotTexts.push(s);
        }

        // botón cerrar / volver
        const close = this.add.text(this.cameras.main.width/2, panelY + panelH - 30, 'Cerrar', { font: '16px Arial', fill: '#fff', backgroundColor: '#444' }).setOrigin(0.5).setDepth(52);
        close.setInteractive({ useHandCursor: true });
        close.on('pointerdown', () => {
            // al cerrar, reanudar la escena que estaba pausada
            //if (from) this.scene.resume(from);
            let level = this.scene.get("TestPlayerScene");
            if (level) level.scene.resume();
            // guardar equipamientos seleccionados
            PlayerDataManager.data.equippedOrbNames = this.equipped;
            this.scene.stop();
        });
    }

    _isEquipped(name) {
        return this.equipped && this.equipped.includes(name);
    }

    _toggleEquip(name) {
        if (!this.equipped) this.equipped = [null, null];
        const idx = this.equipped.indexOf(name);
        if (idx !== -1) {
            this.equipped[idx] = null;
        } else {
            // equip in first empty slot
            const empty = this.equipped.indexOf(null);
            if (empty !== -1) this.equipped[empty] = name;
            else this.equipped[0] = name; // override first if none empty
        }
        // update slot texts
        if (this.slotTexts) {
            for (let i = 0; i < this.slotTexts.length; i++) {
                this.slotTexts[i].setText(`Slot ${i+1}: ${this.equipped[i] || 'Empty'}`);
            }
        }
    }
}

export { OrbSelectScene };

import PlayerDataManager from "../managers/PlayerDataManager.js";

export default class Checkpoint extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'checkpoint'); 
        
        this.x = x;
        this.y = y; 

        this.setOrigin(0.5, 1);
        this.setScale(5);
        this.setDepth(3);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setImmovable(true);
        this.body.allowGravity = false;

        // --- AJUSTE DEL CUERPO FÍSICO ---
        const width = this.width; 
        const height = this.height;
        const bodyW = Math.floor(width * 0.6);
        const bodyH = Math.floor(height * 0.25);
        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(
            (width - bodyW) / 2, 
            height - bodyH
        );

        // --- ESTADOS Y ANIMACIONES ---
        this.activated = false;
        this.playerNearby = false;

        const savedRespawn = PlayerDataManager.data.respawnPoint;
        const isCurrentRespawn = (Math.abs(savedRespawn.x - this.x) < 10 && Math.abs(savedRespawn.y - (this.y - 50)) < 10);

        if (isCurrentRespawn) {
            this.activated = true;
            this.play('cp_idle_on', true);
        } else {
            this.activated = false;
            this.play('cp_idle_off', true);
        }

        // --- EVENTOS ---
        this.scene.events.on('checkpoint_activated', (activeCheckpoint) => {
            if (activeCheckpoint !== this) {
                this.deactivate();
            }
        });

        this.on('destroy', () => {
            this.scene.events.off('checkpoint_activated');
        });

        // --- ZONA DE ACTIVACIÓN ---
        this.prompt = this.scene.add.text(this.x, this.y - this.displayHeight,this.activated?'Presiona E para inventario de orbes':'Presiona E para activar checkpoint', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 0, y: 4 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

        // --- INPUT ---
        this._keydownHandler = (event) => {
            if ((event.key === 'e' || event.key === 'E') && this.playerNearby) {
                let player = this.scene.player;
                if(this.activated){
                    let fromKey = this.scene.scene.key || null;
                    this.scene.scene.pause(fromKey);
                    this.scene.scene.launch('OrbSelect', { fromScene: fromKey, tPlayer: player });
                }
                else {
                    if (player) this.activate(player);
                }
            }
        };

        this.scene.input.keyboard.on('keydown', this._keydownHandler);
    }

    activate(player) {
        if (this.activated) return;

        this.play('cp_transition');
        this.once('animationcomplete', (anim) => {    
            if (this.prompt) {
                this.prompt.setText("Presiona E para inventario de orbes");
            }

            this.activated = true;
            this.scene.events.emit('checkpoint_activated', this);
            
            if (anim.key === 'cp_transition') {
                this.play('cp_idle_on');
            }
        });

        this.scene.tweens.add({
            targets: this,
            scaleX: 5.5,
            scaleY: 5.5,
            yoyo: true,
            duration: 200,
            ease: 'Power1',
            onComplete: () => { this.setScale(5); }
        });

        console.log("CHECKPOINT ACTIVADO en:", this.x, this.y);

        player.health = player.maxHealth;
        player.emit("updateHearts", player.health);
        
        PlayerDataManager.data.respawnPoint = { x: this.x, y: this.y - 50};
        PlayerDataManager.saveDataFromPlayer(player);
    }

    deactivate() {
        if (!this.activated) return;

        if (this.prompt) {
            this.prompt.setText("Presiona E para activar checkpoint");
        }
        
        this.activated = false;
        this.play('cp_idle_off');
        this.clearTint();
    }
}
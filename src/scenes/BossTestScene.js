import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import Boss from '../enemy/Boss/BossAngry.js';
import UiManager from '../ui/UiManager.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

class BossTestScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        this.orbRegistry = [
            { name: 'Orb Ira' },
            { name: 'Orb Tristeza' },
        ];

        // Crear suelo
        const ground = this.physics.add.staticGroup();
        ground.create(this.cameras.main.width/2, this.cameras.main.height, 'ground')
              .setScale(4, 3)
              .refreshBody();

        // Crear jugador
        this.player = new Player(this, 100, 400);
        this.uiManager = new UiManager(this, this.player);

        PlayerDataManager.applyToPlayer(this.player);

        this.physics.add.collider(this.player, ground);

        // Grupo de enemigos
        this.enemies = this.physics.add.group();

        // Crear boss 
        this.boss = new Boss(this, this.cameras.main.width / 2, 400, this.player);
        this.physics.add.collider(this.boss, ground);
        this.enemies.add(this.boss);

        // Configurar tecla ESC para pausa
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('BossScene'); 
            this.scene.launch('Pause' , { file: 'BossScene' });    
        });
    }

    update(time, delta) {
        this.player.update(time, delta);
        
        // Actualizar el boss si existe
        if (this.boss && this.boss.active) {
            this.boss.update(time, delta);
        }
    }
}

export { BossTestScene };
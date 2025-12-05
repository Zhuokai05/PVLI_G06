import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BossFear from '../enemy/Boss/BossFear.js';
import BossAngry from '../enemy/Boss/BossAngry.js';
import BossTutorial from '../enemy/Boss/BossTutorial.js';
import FinalBoss from '../enemy/Boss/BossFinal.js';
import UiManager from '../managers/UiManager.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

class BossTestScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        // Crear suelo
        const ground = this.physics.add.staticGroup();
        ground.create(this.cameras.main.width / 2, this.cameras.main.height, 'ground')
            .setScale(4, 3)
            .refreshBody();

        // Crear jugador
        this.player = new Player(this, 100, 400);

        PlayerDataManager.applyDataToPlayer(this.player);

        this.uiManager = new UiManager(this, this.player);
        this.uiManager.updateHearts(this.player.health);


        this.physics.add.collider(this.player, ground);

        // Grupo de enemigos
        this.enemies = this.physics.add.group();

        // Crear boss
        this.bossFear = new FinalBoss(this, this.cameras.main.width / 2, 400, this.player);
        this.physics.add.collider(this.bossFear, ground);
        this.enemies.add(this.bossFear);

        //this.bossAngry = new BossAngry(this, this.cameras.main.width / 2, 400, this.player);
        //this.physics.add.collider(this.bossAngry, ground);
        //this.enemies.add(this.bossAngry);

        //this.bossTutorial = new BossTutorial(this, this.cameras.main.width - 60, this.cameras.main.height - 150, this.player);
        //this.physics.add.collider(this.bossTutorial, ground);
        //this.enemies.add(this.bossTutorial);

        // Configurar tecla ESC para pausa
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('BossScene');
            this.scene.launch('Pause', { file: 'BossScene' });
        });
    }

    update(time, delta) {
        this.player.update(time, delta);
        
        /*if (this.bossTutorial && this.bossTutorial.active) {
            this.bossTutorial.update(time, delta);
        }*/

        /*if (this.bossAngry && this.bossAngry.active) {
            this.bossAngry.update(time, delta);
        }*/

        if (this.bossFear && this.bossFear.active) {
            this.bossFear.update(time, delta);
        }
    }
}

export { BossTestScene };
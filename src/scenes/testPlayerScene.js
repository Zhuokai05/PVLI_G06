import Player from '../player/player.js';
import InputManager from '../managers/inputManager.js';
import BasicMeleeEnemy from '../enemy/BasicMeleeEnemy.js';
import UiManager from '../ui/UiManager.js';

export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestPlayerScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        this.physics.world.setBounds(-200, 0, 1400, 1000);


        let ground = this.physics.add.staticGroup();
        ground.create(0, 500, 'ground').setScale(2).refreshBody();
        ground.create(500, 500, 'ground').setScale(2).refreshBody();
        ground.create(500, 400, 'ground').setScale(2).refreshBody();
        ground.create(1000, 500, 'ground').setScale(2).refreshBody();
        

        this.player = new Player(this, 100, 100);
        this.uiManager = new UiManager(this, this.player);

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'angel_sword_idle' }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({

            key: 'walk',
            frames: [
            { key: 'angel_sword_walk_1' },
            { key: 'angel_sword_walk_2' },
            { key: 'angel_sword_walk_3' }
            ],
            frameRate: 6, 
            repeat: -1
        });

        this.anims.create({

            key: 'jump',
            frames: [{ key: 'angel_sword_jump' }],
            frameRate: 1, 
            repeat: -1
        });

        this.anims.create({
            key: 'heartbreakAnimation',
            frames: this.anims.generateFrameNumbers('heartbreak', { start: 0, end: 15 }),
            frameRate: 12,
            repeat: 0
        });


        this.enemies = this.physics.add.group();
        this.enemies.add(new BasicMeleeEnemy(this, 200, 300, 'basicEnemyAngry'));
        this.enemies.add(new BasicMeleeEnemy(this, 600, 300, 'basicEnemySad'));
        this.enemies.add(new BasicMeleeEnemy(this, 900, 300, 'basicEnemyHappy'));
        this.enemies.add(new BasicMeleeEnemy(this, 1000, 300, 'basicEnemyFear'));
  
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(ground, this.enemies);


        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('TestPlayerScene'); 
            this.scene.launch('Pause');    
        });

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(-200, 0, 1400, 600);
        
    }

    update(time, delta) {
    
        this.player.update(time, delta);

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        if (this.player.x > 1100) {
             this.scene.stop(); 
            this.scene.launch('BossScene'); 
       }
      
    }
}
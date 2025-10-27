import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BasicMeleeEnemy from '../enemy/BasicMeleeEnemy.js';

export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestPlayerScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        const ground = this.physics.add.staticGroup();
        ground.create(300, 220, 'ground').setScale(2).refreshBody();
        ground.create(900, 600, 'ground').setScale(2).refreshBody();
        ground.create(220, 750, 'ground').setScale(2).refreshBody();
        

        this.player = new Player(this, 100, 100);


        this.enemies = this.physics.add.group();
        this.enemies.add(new BasicMeleeEnemy(this, 300, 100, 'basicEnemyAngry'));

        this.basicEnemySad = this.add.sprite(700, 480, 'basicEnemySad');
        this.basicEnemyHappy = this.add.sprite(900, 480, 'basicEnemyHappy');
        this.basicEnemyFear = this.add.sprite(100, 650, 'basicEnemyFear');

        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, this.enemies);
        this.physics.add.collider(ground, this.enemies);


        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('TestPlayerScene'); 
            this.scene.launch('Pause');    
        });
    }

    update(time, delta) {
        this.player.update(time, delta);

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });
    }
}
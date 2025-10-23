import Player from './player.js';
import InputManager from './inputManager.js';

export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        const ground = this.physics.add.staticGroup();
        ground.create(300, 220, 'ground').setScale(2).refreshBody();
        ground.create(900, 600, 'ground').setScale(2).refreshBody();
        ground.create(220, 750, 'ground').setScale(2).refreshBody();

        this.player = new Player(this, 100, 100);
        this.physics.add.collider(this.player, ground);

        this.basicEnemyAngry = this.add.sprite(300, 100, 'basicEnemyAngry');
        this.basicEnemySad = this.add.sprite(400, 100, 'basicEnemySad');
        this.basicEnemyHappy = this.add.sprite(900, 480, 'basicEnemyHappy');
        this.basicEnemyFear = this.add.sprite(100, 650, 'basicEnemyFear');
    }

    update(time, delta) {
        this.player.update(time, delta);
    }
}
import Player from './player.js';
import InputManager from './inputManager.js';

export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        const ground = this.physics.add.staticGroup();
        ground.create(192, 220, 'ground').setScale(2).refreshBody();

        this.player = new Player(this, 100, 100);
        this.physics.add.collider(this.player, ground);
    }

    update(time, delta) {
        this.player.update(time, delta);
    }
}
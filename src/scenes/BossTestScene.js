import Player from '../player/player.js';
import InputManager from '../managers/inputManager.js';

class BossTestScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        const ground = this.physics.add.staticGroup();
        ground.create(this.cameras.main.width/2 ,this.cameras.main.height , 'ground').setScale(2,3).refreshBody();
        this.ira = this.add.sprite(this.cameras.main.width /2 ,this.cameras.main.height / 2, 'ira');
        this.ira.setScale(4.3);
        this.player = new Player(this, 100, 100);
        this.physics.add.collider(this.player, ground);



  this.input.keyboard.on('keydown-ESC', () => {
  this.scene.pause('BossScene'); 
  this.scene.launch('Pause');    
});
    }

    update(time, delta) {
        this.player.update(time, delta);
    }
}
export {BossTestScene}
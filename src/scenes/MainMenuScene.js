import MapManager from "../managers/MapManager.js";
import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import UiManager from '../ui/UiManager.js'

class MainMenuScene extends Phaser.Scene 
{
    constructor() 
    {
        super('MainMenu'); 
        
    }

    create() 
    {
      /* this.background = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'background');
       this.background.setScale(1, 0.75);
       this.name = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 4,'name');
       this.name.setScale(0.5, 0.45);
       var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 1.25,'jugar');
       play.setScale(0.3);
       play.setInteractive();

        play.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('TestPlayerScene');
            //this.scene.start('BossScene');
        });*/

            /*const mapData = this.cache.text.get('map');*/
        this.inputManager = new InputManager(this);
        this.physics.world.setBounds(-200, 0, 140000, 100000);
    const map = this.make.tilemap({ key: 'mappy' });
    const tileset = map.addTilesetImage('Ira', 'tiles');
    let layer = map.createLayer('mapa', tileset,0,0);
    layer.setCollision(1,2,3,4,5,6,7,8,9,10,11,12);
   
        this.player = new Player(this, 300, 200);
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
                frames: this.anims.generateFrameNumbers('heartbreak', { start: 0, end: 10 }),
                frameRate: 12,
                repeat: 0
            });
    
        this.physics.add.collider(this.player, layer);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(-200, 0, 140000, 100000);




    }

    update(time, delta) 
    {
            this.player.update(time, delta);

    }
}
export {MainMenuScene}
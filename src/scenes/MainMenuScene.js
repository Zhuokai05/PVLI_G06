import MapManager from "../managers/mapManager.js";
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
       this.background = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'background');
       this.background.setScale(1, 0.75);
       this.name = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 4,'name');
       this.name.setScale(0.5, 0.45);
       var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 1.25,'jugar');
       play.setScale(0.3);
       play.setInteractive();

        play.on('pointerdown', () => {
            this.scene.stop();
            this.scene.start('TestPlayerScene');
            
        });

                /*const mapData = this.cache.text.get('map');
     
        this.map = new MapManager(this, mapData, 'tiles', 32, 32, 5); 
        //pantalla de 32 x 25

      this.inputManager = new InputManager(this);
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
               frames: this.anims.generateFrameNumbers('heartbreak', { start: 0, end: 10 }),
               frameRate: 12,
               repeat: 0
           });
   

        this.map.addCollisionWith(this.player);*/

    }

    update(time, delta) 
    {
            /*this.player.update(time, delta);

        if (this.player.x > 1100) {
             this.scene.stop(); 
            this.scene.launch('BossScene'); 
       }*/
    }
}
export {MainMenuScene}
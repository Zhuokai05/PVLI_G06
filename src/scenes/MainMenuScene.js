import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BasicMeleeEnemy from '../enemy/BasicMeleeEnemy.js';
import RangedEnemy from '../enemy/RangedEnemy.js';
import Trap from '../enemy/BaseTrap.js';
import MineEnemy from '../enemy/MineMeleeEnemy.js';
import UiManager from '../ui/UiManager.js';
import TristezaOrb from '../orbs/TristezaOrb.js';
import IraOrb from '../orbs/IraOrb.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import BossDoor from '../managers/BossDoor.js';
import SadnessBossDoor from '../managers/SadnessBossDoor.js';
import Checkpoint from '../objects/Checkpoint.js';
import Button from '../managers/Botton.js';
import BattleDoor from '../managers/BattleDoor.js';
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
    layer.setCollisionByProperty({colision : true});
   
    let obsj = map.getObjectLayer('objetos');
this.doors = this.physics.add.group({
    allowGravity: false,
    immovable: true
});
    let Iraboss1 = new SadnessBossDoor(this, 1120, 850,'basicEnemySad');
     let Iraboss2 = new BossDoor(this, 1620, 920, 'basicEnemySad');
        this.doors.add(Iraboss1);
        this.doors.add(Iraboss2);

     Iraboss1.setContrary(Iraboss2);
     Iraboss2.setContrary(Iraboss1);

let redButton = new Button(this, 1000, 900, 'basicEnemyHappy', Iraboss1, 'rojo');
let blueButton = new Button(this, 850, 900, 'basicEnemyFear', Iraboss1, 'azul');
let greenButton = new Button(this, 900, 900, 'basicEnemySad', Iraboss1, 'verde');

this.battleDoor = new BattleDoor(  this,1000,900,'basicEnemySad',  50,20);

    this.enemies = this.physics.add.group();
    obsj.objects.forEach((objeto) => 
        {
            
            switch (objeto.name) {

        case "player":
            this.player = new Player(this, objeto.x, objeto.y);
            break;

               case "tristeza":
            this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemySad'));
            break;

               case "alegria":
           this.enemies.add(new BasicMeleeEnemy(this,objeto.x, objeto.y, 'basicEnemyHappy'));
            break;

               case "miedo":
                this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
            break;
        
        }
        })
     
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
    this.physics.add.collider(layer, this.enemies);
        this.cameras.main.startFollow(this.player);
          this.cameras.main.setFollowOffset(0, 200); 
        this.cameras.main.setBounds(-200, 0, 140000, 100000);

  this.physics.add.overlap(this.player, this.doors, (player, door) => {
            this.currentDoor = door; 
        });

        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

this.physics.add.overlap(this.player, redButton, () => {
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) redButton.press();
});

this.physics.add.overlap(this.player, blueButton, () => {
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) blueButton.press();
});

this.physics.add.overlap(this.player, greenButton, () => {
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) greenButton.press();
});
    }

    update(time, delta) 
    {
            this.player.update(time, delta);
        
             this.enemies.getChildren().forEach(enemy => {
                enemy.update(time, delta);
              });
            
   if (this.currentDoor) {
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
                this.currentDoor.abrirPuerta();
            }
        } else {
            // Si no hay overlap, limpiar para evitar teleports fantasmas
            this.currentDoor = null;
        }
    }
}
export {MainMenuScene}
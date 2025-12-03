import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BasicMeleeEnemy from '../enemy/BasicMeleeEnemy.js';
import RangedEnemy from '../enemy/RangedEnemy.js';
import FlyingRangedEnemy from '../enemy/FlyingRangedEnemy.js';
import Trap from '../enemy/BaseTrap.js';
import MineEnemy from '../enemy/MineMeleeEnemy.js';
import UiManager from '../ui/UiManager.js';
import MoveSpeedOrb from '../orbs/MoveSpeedOrb.js';
import DamageOrb from '../orbs/DamageOrb.js';
import DashOrb from '../orbs/DashOrb.js';
import RangedOrb from '../orbs/RangedOrb.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import Checkpoint from '../objects/Checkpoint.js';
import DoorBoss from '../managers/BossDoor.js';
import SadnessBossDoor from '../managers/SadnessBossDoor.js';
import Button from '../managers/Botton.js';
import MapDoor from '../managers/MapDoor.js';
import FinalBossDoor from '../managers/FinalBossDoor.js';


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
            //this.scene.start('BossScene');
        });

      


    }



    update(time, delta) 
    {


    }


    
}
export {MainMenuScene}
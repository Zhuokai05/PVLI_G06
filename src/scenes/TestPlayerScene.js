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


export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestPlayerScene');
    }

    create() {
         this.inputManager = new InputManager(this);
         this.physics.world.setBounds(-200, 0, 140000, 100000);
     const map = this.make.tilemap({ key: 'mappy' });
     const tileset = map.addTilesetImage('Ira', 'tiles');
     let layer = map.createLayer('mapa', tileset,0,0);
     layer.setCollisionByProperty({colision : true});
     let obsj = map.getObjectLayer('objetos');
 this.floordoors = this.physics.add.group({
     allowGravity: false,
     immovable: true
 });
 this.doors = this.physics.add.group({
     allowGravity: false,
     immovable: true
 });
 
 this.checkpoints = this.physics.add.group({
     allowGravity: false,
     immovable: true
 });
     this.orbGroup = this.physics.add.group();
     this.enemies = this.physics.add.group();
     obsj.objects.forEach((objeto) => 
         {
             
             switch (objeto.name) {
 
                 //player
         case "player":
            if (PlayerDataManager.data.respawnPoint.x == 0 && PlayerDataManager.data.respawnPoint.y == 0 ) 
                {
                  this.player = new Player(this, objeto.x, objeto.y);
                }
                else 
                {
                  this.player = new Player(this,PlayerDataManager.data.respawnPoint.x, PlayerDataManager.data.respawnPoint.y )
                }
             
             PlayerDataManager.applyDataToPlayer(this.player);
             
             break;
 
            //Enemigos
 
                case "tristeza":
             this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemySad'));
             break;
 
                case "alegria":
            this.enemies.add(new BasicMeleeEnemy(this,objeto.x, objeto.y, 'basicEnemyHappy'));
             break;
 
                case "miedo":
                 this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
             case "ranged":
                 this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
               case "flying":
                 this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
             case "mini":
                 this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
               case "trap":
                 this.enemies.add(new Trap(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
 
 
             //puertas
               case "door":
                 this.floordoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
             break;
                  case "bossdoor":
                 this.irabossdoor = new DoorBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
             case "bossdoorcontrary":
                 this.irabossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
               case "bossdoorexit":
                 this.irabossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
              case "sadnessbossdoor":
                 this.tristebossdoor = new SadnessBossDoor(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
             case "sadnessbossdoorcontrary":
                 this.tristebossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
               case "sadnessbossdoorexit":
                 this.tristebossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
             break;
 
             //buttons
          case "redbutton":
                 this.redButton = new Button(this, objeto.x, objeto.y, 'basicEnemyHappy','rojo') ;
             break;
         case "greenbutton":
                 this.greenButton = new Button(this, objeto.x, objeto.y, 'basicEnemyHappy','verde') ;
             break;
            case "bluebutton":
                 this.blueButton = new Button(this, objeto.x, objeto.y, 'basicEnemyHappy','azul') ;
             break;
 
             //orbes 
               case "speedorb":
                  this.orbGroup.add(new MoveSpeedOrb(this, objeto.x, objeto.y));
             break;
              case "dashorb":
                  this.orbGroup.add(new DashOrb(this, objeto.x, objeto.y));
             break;
              case "damageorb":
                  this.orbGroup.add(new DamageOrb(this, objeto.x, objeto.y));
             break;
              case "rangeorb":
                  this.orbGroup.add(new RangedOrb(this, objeto.x, objeto.y));
             break;
 
             //checkPoint
            case "checkpoint":
                  this.checkpoints.add(new Checkpoint(this, objeto.x, objeto.y));
             break;
 
         }
         })
      //puertas conectadas
 if (this.irabossdoor && this.irabossdoorcontrary) {
     this.irabossdoor.setContrary(this.irabossdoorcontrary);
     this.irabossdoorcontrary.setContrary(this.irabossdoor);
 }
 
 if (this.irabossdoorexit && this.irabossdoor) {
     this.irabossdoorexit.setContrary(this.irabossdoor);
 }
 
 if (this.irabossdoor) this.doors.add(this.irabossdoor);
 if (this.irabossdoorcontrary) this.doors.add(this.irabossdoorcontrary);
 if (this.irabossdoorexit) this.doors.add(this.irabossdoorexit);
 
 
 if (this.tristebossdoor && this.tristebossdoorcontrary) {
     this.tristebossdoor.setContrary(this.tristebossdoorcontrary);
     this.tristebossdoorcontrary.setContrary(this.tristebossdoor);
 }
 
 if (this.tristebossdoorexit && this.tristebossdoor) {
     this.tristebossdoorexit.setContrary(this.tristebossdoor);
 }
 
 if (this.tristebossdoor) this.doors.add(this.tristebossdoor);
 if (this.tristebossdoorcontrary) this.doors.add(this.tristebossdoorcontrary);
 if (this.tristebossdoorexit) this.doors.add(this.tristebossdoorexit);
 
 
 //ui        
         this.uiManager = new UiManager(this, this.player);
     
 
 //animaciones
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
     
 
             // Colliders y camaras
         this.physics.add.collider(this.player, layer);
     this.physics.add.collider(layer, this.enemies);
         this.cameras.main.startFollow(this.player);
           this.cameras.main.setFollowOffset(0, 200); 
         this.cameras.main.setBounds(-200, 0, 140000, 100000);
 
 
 
            //Overlaps
 this.physics.add.overlap(this.player, this.orbGroup, (player, orb) => {
             orb.collect(player);
         });       
 
 this.physics.add.overlap(this.player, this.doors, (player, door) => {
             this.currentDoor = door; 
         });
 
 this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
 
 this.physics.add.overlap(this.player, this.redButton, () => {
     if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.redButton.press();
 });
 
 this.physics.add.overlap(this.player, this.blueButton, () => {
     if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.blueButton.press();
 });
 
 this.physics.add.overlap(this.player, this.greenButton, () => {
     if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.greenButton.press();
 });
 this.physics.add.overlap(this.player, this.checkpoints, (player, cp) => {
     cp.playerNearby = true;
     if (cp.prompt) cp.prompt.setVisible(true);
 });
 
 
 //event
        this.events.on('resume', () => {
             if (this.player) PlayerDataManager.applyDataToPlayer(this.player);
             // ocultar prompt si estaba visible
            if (this.checkpoints) {
     this.checkpoints.getChildren().forEach(cp => {
         if (cp.prompt) cp.prompt.setVisible(false);
     });
 }
 
         });
 
 
 //pause
           this.input.keyboard.on('keydown-ESC', () => {
             this.scene.pause('TestPlayerScene');
             this.scene.launch('Pause', { file: 'TestPlayerScene' });
         });
    }

    update(time, delta) {

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


        // CHECKPOINTS: manejar varios a la vez
this.checkpoints.getChildren().forEach(cp => {

    if (this.physics.overlap(this.player, cp)) {

        // El jugador está cerca del checkpoint
        if (!cp.playerNearby) {
            cp.playerNearby = true;
            if (cp.prompt) cp.prompt.setVisible(true);
        }

    } else {

        // El jugador se ha alejado del checkpoint
        if (cp.playerNearby) {
            cp.playerNearby = false;
            if (cp.prompt) cp.prompt.setVisible(false);
        }

    }
});
        this.events.emit("create");

    }
}
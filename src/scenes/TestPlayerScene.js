import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BasicMeleeEnemy from '../enemy/GroundMeleeEnemy.js';
import RangedEnemy from '../enemy/GroundRangedEnemy.js';
import FlyingRangedEnemy from '../enemy/FlyingRangedEnemy.js';
import Trap from '../enemy/BaseTrap.js';
import MineEnemy from '../enemy/MineMeleeEnemy.js';
import UiManager from '../managers/UiManager.js';
import MoveSpeedOrb from '../orbs/MoveSpeedOrb.js';
import DamageOrb from '../orbs/DamageOrb.js';
import DashOrb from '../orbs/DashOrb.js';
import RangedOrb from '../orbs/RangedOrb.js';
import AttackRangeOrb from '../orbs/AttackRangeOrb.js';
import BasePlatform from '../objects/Platform.js';
import IcePlatform from '../objects/IcePlatform.js';
import ShieldOrb from '../orbs/ShieldOrb.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import Checkpoint from '../objects/Checkpoint.js';
import DoorBoss from '../objects/BossDoor.js';
import SadnessBossDoor from '../objects/SadnessBossDoor.js';
import Button from '../objects/Botton.js';
import MapDoor from '../objects/MapDoor.js';
import BossSad from '../enemy/Boss/BossSad.js';
import BossFear from '../enemy/Boss/BossFear.js';
import BossAngry from '../enemy/Boss/BossAngry.js';
import BossTutorial from '../enemy/Boss/BossTutorial.js';
import FinalBoss from '../enemy/Boss/BossFinal.js';
import InvisibleTrigger from '../objects/Trigger.js';
import BossRoom from '../objects/BossRoom.js';
import FloorIsLava from '../objects/FloorIsLava.js';

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
         this.Bossrooms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.irafloordoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
         this.icefloordoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
         this.icebossdoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
         this.irabossdoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

          this.iraPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
         this.icePlatforms = this.physics.add.group({
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

        this.createAnimations();

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
                    if (this.player)PlayerDataManager.applyDataToPlayer(this.player);
                    break;
                
                //Enemigos
    
                case "ira":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyAngry'));
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

                case "iraranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Ira_RangedEnemy'));
                    break;
                      case "tristeranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Tristeza_RangedEnemy'));
                    break;

                case "iraflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Ira_FlyingEnemy',0,'Ira_FlyingEnemy_Move','Ira_FlyingEnemy_Attack'));
                    break;
                case "tristeflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Tristeza_FlyingEnemy',0,'Tristeza_FlyingEnemy_Move','Tristeza_FlyingEnemy_Attack'));
                    break;


                case "iramine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Ira_MineEnemy',0 ,'Ira_MineEnemy_Move','Ira_MineEnemy_Attack'));
                    break;
                case "tristemine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Tristeza_MineEnemy',0 ,'Tristeza_MineEnemy_Move','Tristeza_MineEnemy_Attack'));
                    break;

                case "trap":
                    this.enemies.add(new Trap(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
    
    
                //puertas
                case "iradoor":
                    this.irafloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "icedoor":
                    this.icefloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                    case "irabossdoor":
                    this.irabossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "icebossdoor":
                    this.icebossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "bossdoor":
                    this.irabossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertaira') ;
                    break;
                case "bossdoorcontrary":
                    this.irabossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertaira') ;
                    break;
                case "bossdoorexit":
                    this.irabossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertaira') ;
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

                //triggers

                case "iratrigger":
                    this.iratrigger = new InvisibleTrigger(this, objeto.x, objeto.y) ;
                   
                    break;
                case "icetrigger":
                    this.icetrigger = new InvisibleTrigger(this, objeto.x, objeto.y) ;
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
                case "rangeorb":
                    this.orbGroup.add(new ShieldOrb(this, objeto.x, objeto.y));
                    break;
                //checkPoint
                case "checkpoint":
                    this.checkpoints.add(new Checkpoint(this, objeto.x, objeto.y));
                    this.checkpoints.add(new Checkpoint(this, objeto.x +100, objeto.y));
                    break;

                //platforms 
                case "platform":
                    this.iraPlatforms.add(new BasePlatform(this, objeto.x, objeto.y,'platform'));
                    break;
                case "iceplatform":
                    this.icePlatforms.add(new IcePlatform(this, objeto.x, objeto.y, 'iceplatform'));
                    break;
               //bosses 
                case "iraboss":
                    this.iraboss = new BossAngry(this, objeto.x, objeto.y, this.player) ;
                    this.enemies.add(this.iraboss);
                    break;
                case "tristeboss":
                    this.tristeboss = new BossSad(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
                    break;
                case "miedoboss":
                    this.miedoboss = new BossFear(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
                    break;
                case "tutoboss":
                    this.tutoboss = new BossTutorial(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
                    break;
                case "finalboss":
                    this.finalboss = new FinalBoss(this, objeto.x, objeto.y, 'basicEnemyHappy') ;
                    break;
                case "room":
                this.Bossrooms.add(new BossRoom(this,objeto.x,objeto.y,objeto.width, objeto.height));
                    break;
               

            }
        })
        const distanciaSegura = 800;
        this.lava = new FloorIsLava(this, this.player.y + distanciaSegura, 15, this.player);

    //    //ira
    //     this.enemies.add(new FlyingRangedEnemy(this, 1100, 1400, 'Ira_FlyingEnemy',0,'Ira_FlyingEnemy_Move',
    //         'Ira_FlyingEnemy_Attack','Ira_FlyingEnemy_Death','Ira_FlyingEnemy',83));

    //     this.enemies.add(new MineEnemy(this, 1200, 1350, 'Ira_MineEnemy',0 ,'Ira_MineEnemy_Move','Ira_MineEnemy_Attack','Ira_MineEnemy_Death'));

    //     this.enemies.add(new RangedEnemy(this, 1500, 1350, 'Ira_RangedEnemy',0 ,'Ira_RangedEnemy_Move','Ira_RangedEnemy_Attack','Ira_RangedEnemy_Death','Ira_FlyingEnemy',83));

    //     //Tristeza
    //     this.enemies.add(new FlyingRangedEnemy(this, 1900, 1400, 'Tristeza_FlyingEnemy',0,'Tristeza_FlyingEnemy_Move'
    //      ,'Tristeza_FlyingEnemy_Attack','Tristeza_FlyingEnemy_Death','Tristeza_FlyingEnemy',83));
    //     this.enemies.add(new MineEnemy(this, 2100, 1350, 'Tristeza_MineEnemy',0 ,'Tristeza_MineEnemy_Move','Tristeza_MineEnemy_Attack','Tristeza_MineEnemy_Death'));
    //     this.enemies.add(new RangedEnemy(this, 2300, 1350, 'Tristeza_RangedEnemy',0 ,'Tristeza_RangedEnemy_Move','Tristeza_RangedEnemy_Attack','Tristeza_RangedEnemy_Death','Tristeza_FlyingEnemy',83));
        

        this.orbGroup.add(new MoveSpeedOrb(this, 1300, 1350));
         this.orbGroup.add(new DashOrb(this, 1300, 1350));
         this.orbGroup.add(new DamageOrb(this, 1300, 1350));
         this.orbGroup.add(new RangedOrb(this, 1300, 1350));
         this.orbGroup.add(new MoveSpeedOrb(this, 1300, 1350));
         this.orbGroup.add(new DashOrb(this, 1300, 1350));
         this.orbGroup.add(new DamageOrb(this, 1300, 1350));
         this.orbGroup.add(new RangedOrb(this, 1300, 1350));
        this.orbGroup.add(new ShieldOrb(this, 1500, 1350));
        this.orbGroup.add(new AttackRangeOrb(this, 1400, 1350));
        
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
        

    //bossdoors y triggers
      

    this.irabossdoors.getChildren().forEach(door => {          
          door.abrirPuerta();         
      });
       if (this.iratrigger ) this.iratrigger.getDoors(this.irabossdoors);
        if (this.iratrigger  && this.iraboss) this.iratrigger.getBoss(this.iraboss);


       this.icebossdoors.getChildren().forEach(door => {          
          door.abrirPuerta();         
      });
       if (this.icetrigger ) this.icetrigger.getDoors(this.icebossdoors);
           
        

    //mapdoors
        
        //ui        
        this.uiManager = new UiManager(this, this.player);

 
        // Colliders y camaras
        this.physics.add.collider(this.player, layer);
        this.physics.add.collider(this.player, this.irabossdoors);
        this.physics.add.collider(this.player, this.icePlatforms);
        this.physics.add.collider(this.player, this.iraPlatforms);
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
        this.physics.add.overlap(this.player, this.iratrigger, () => {
            this.iratrigger.llamar();
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

    createAnimations(){
        
        //animaciones
        this.anims.create({
            key: 'Player_idle',
            frames: [{ key: 'angel_sword_idle' }],
            frameRate: 1,
            repeat: -1
        });


        this.anims.create({

            key: 'Player_walk',
            frames: [
            { key: 'angel_sword_walk_1' },
            { key: 'angel_sword_walk_2' },
            { key: 'angel_sword_walk_3' }
            ],
            frameRate: 6, 
            repeat: -1
        });

        this.anims.create({

            key: 'Player_jump',
            frames: [{ key: 'angel_sword_jump' }],
            frameRate: 1, 
            repeat: -1
        });

        this.anims.create({
            key: 'melee_anim',
            frames: this.anims.generateFrameNumbers('melee', { start: 0, end: 4 }),
            frameRate: 30,
            repeat: 0
        });

        this.anims.create({
            key: 'melee_ampliado_anim',
            frames: this.anims.generateFrameNumbers('melee_Ampliado', { start: 0, end: 4 }),
            frameRate: 30,
            repeat: 0
        });


        // UI
        this.anims.create({
            key: 'UI_heartbreakAnimation',
            frames: this.anims.generateFrameNumbers('heartbreak', { start: 0, end: 10 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'cp_idle_off',
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'cp_transition',
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 10, end: 31 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'cp_idle_on',
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 32, end: 38 }),
            frameRate: 8,
            repeat: -1
        });


        //enemigos voladores
        this.anims.create({
            key: 'Ira_FlyingEnemy_Move',
            frames: this.anims.generateFrameNumbers('Ira_FlyingEnemy', { start: 16, end: 19 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Ira_FlyingEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Ira_FlyingEnemy', { start: 48, end: 51 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Ira_FlyingEnemy_Death',
            frames: this.anims.generateFrameNumbers('Ira_FlyingEnemy', { start: 64, end: 72 }),
            frameRate: 12,
            repeat: 0
        });
        this.anims.create({
            key: 'Tristeza_FlyingEnemy_Move',
            frames: this.anims.generateFrameNumbers('Tristeza_FlyingEnemy', { start: 16, end: 19 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_FlyingEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Tristeza_FlyingEnemy', { start: 48, end: 51 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_FlyingEnemy_Death',
            frames: this.anims.generateFrameNumbers('Tristeza_FlyingEnemy', { start: 64, end: 72 }),
            frameRate: 12,
            repeat: 0
        });

        //enemigos rango

        this.anims.create({
            key: 'Ira_RangedEnemy_Move',
            frames: this.anims.generateFrameNumbers('Ira_RangedEnemy', { start: 17, end: 24 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Ira_RangedEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Ira_RangedEnemy', { start: 38, end: 45 }),
            frameRate: 12,
            repeat: -1
        });

          this.anims.create({
            key: 'Ira_RangedEnemy_Death',
            frames: this.anims.generateFrameNumbers('Ira_RangedEnemy', { start: 103, end: 110 }),
            frameRate: 12,
            repeat: 0
        });

         this.anims.create({
            key: 'Tristeza_RangedEnemy_Move',
            frames: this.anims.generateFrameNumbers('Tristeza_RangedEnemy', { start: 17, end: 24 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_RangedEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Tristeza_RangedEnemy', { start: 38, end: 45 }),
            frameRate: 12,
            repeat: -1
        });

          this.anims.create({
            key: 'Tristeza_RangedEnemy_Death',
            frames: this.anims.generateFrameNumbers('Tristeza_RangedEnemy', { start: 103, end: 110 }),
            frameRate: 12,
            repeat: 0
        });


        //enemigos mina
        this.anims.create({
            key: 'Ira_MineEnemy_Move',
            frames: this.anims.generateFrameNumbers('Ira_MineEnemy', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

         this.anims.create({
            key: 'Ira_MineEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Ira_MineEnemy', { start: 16, end: 23 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Ira_MineEnemy_Death',
            frames: this.anims.generateFrameNumbers('Ira_MineEnemy', { start: 32, end: 39 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'Tristeza_MineEnemy_Move',
            frames: this.anims.generateFrameNumbers('Tristeza_MineEnemy', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_MineEnemy_Attack',
            frames: this.anims.generateFrameNumbers('Tristeza_MineEnemy', { start: 16, end: 23 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_MineEnemy_Death',
            frames: this.anims.generateFrameNumbers('Tristeza_MineEnemy', { start: 32, end: 39 }),
            frameRate: 12,
            repeat: 0
        });

    }

    update(time, delta) {

        this.player.update(time, delta);
        
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

           if (this.tutoboss && this.tutoboss.active) {
            this.tutoboss.update(time, delta);
        }

        if (this.iraboss && this.iraboss.active) {
            this.iraboss.update(time, delta);
        }

        if (this.miedoboss && this.miedoboss.active) {
            this.miedoboss.update(time, delta);
        }
         if (this.tristeboss && this.tristeboss.active) {
            this.tristeboss.update(time, delta);
        }
        if (this.finalboss && this.finalboss.active) {
            this.finalboss.update(time, delta);
        }
            
let doorUnderPlayer = null;

this.doors.getChildren().forEach(door => {
    if (this.physics.overlap(this.player, door)) {
        doorUnderPlayer = door;
    }
});


this.currentDoor = doorUnderPlayer;


if (this.currentDoor && Phaser.Input.Keyboard.JustDown(this.keyE)) {
    this.currentDoor.abrirPuerta();
}


        this.checkpoints.getChildren().forEach(cp => {

            if (this.physics.overlap(this.player, cp)) {

           
                if (!cp.playerNearby) {
                    cp.playerNearby = true;
                    if (cp.prompt) cp.prompt.setVisible(true);
                }

            } else {


                if (cp.playerNearby) {
                    cp.playerNearby = false;
                    if (cp.prompt) cp.prompt.setVisible(false);
                }

            }
        });


         this.Bossrooms.getChildren().forEach(bossRoom => {
       const inside = this.physics.overlap(this.player, bossRoom);
        if (inside && !bossRoom.playerInside) {
        bossRoom.playerInside = true;
        this.handleBossRoom(bossRoom);
        } else if (!inside && bossRoom.playerInside) {
        bossRoom.playerInside = false;
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(-200, 0, 140000, 100000);
        }
        });
    }
    handleBossRoom(bossRoom) {
    this.cameras.main.stopFollow();

    this.cameras.main.setBounds(
        bossRoom.x - bossRoom.width / 2, 
        bossRoom.y - bossRoom.height / 2, 
        bossRoom.width, 
        bossRoom.height
    );

    this.cameras.main.centerOn(bossRoom.x, bossRoom.y);

}
}

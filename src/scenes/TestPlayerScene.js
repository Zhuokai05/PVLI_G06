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
import JumpOrb from '../orbs/JumpOrb.js';
import BloodStealOrb from '../orbs/BloodStealOrb.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import Checkpoint from '../objects/Checkpoint.js';
import DoorBoss from '../objects/BossDoor.js';
import SadnessBossDoor from '../objects/SadnessBossDoor.js';
import Button from '../objects/Botton.js';
import ShowButton from '../objects/ShowBotton.js';
import MapDoor from '../objects/MapDoor.js';
import BossSad from '../enemy/Boss/BossSad.js';
import BossFear from '../enemy/Boss/BossFear.js';
import BossAngry from '../enemy/Boss/BossAngry.js';
import BossTutorial from '../enemy/Boss/BossTutorial.js';
import FinalBoss from '../enemy/Boss/BossFinal.js';
import InvisibleTrigger from '../objects/Trigger.js';
import BossRoom from '../objects/BossRoom.js';
import FloorIsLava from '../objects/FloorIsLava.js';
import CheatManager from '../managers/CheatManager.js';
import TutorialPanel from '../objects/TutorialPanel.js';


export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestPlayerScene');
    }

    create() {

        this.inputManager = new InputManager(this);
        this.physics.world.setBounds(-200, 0, 140000, 100000);

        const map = this.make.tilemap({ key: 'mappy' });
        const tileset = map.addTilesetImage('Ira', 'tiles');
        let layer = map.createLayer('mapa', tileset, 0, 0);
        layer.setCollisionByProperty({ colision: true });
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
        this.fearbossdoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.tutobossdoors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
        this.finalbossdoors = this.physics.add.group({
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

        obsj.objects.forEach((objeto) => {
            switch (objeto.name) {

                //player
                case "player":
                    if (PlayerDataManager.data.respawnPoint.x == 0 && PlayerDataManager.data.respawnPoint.y == 0) {
                        this.player = new Player(this, objeto.x, objeto.y);
                    }
                    else {
                        this.player = new Player(this, PlayerDataManager.data.respawnPoint.x, PlayerDataManager.data.respawnPoint.y)
                    }
                    if (this.player) PlayerDataManager.applyDataToPlayer(this.player);
                    break;

                //Enemigos

                case "ira":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyAngry'));
                    break;
                case "tristeza":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemySad'));
                    break;

                case "alegria":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyHappy'));
                    break;

                case "miedo":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;

                case "iraranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Ira_RangedEnemy', 0, 'Ira_RangedEnemy_Move', 'Ira_RangedEnemy_Attack', 'Ira_RangedEnemy_Death', 'Ira_FlyingEnemy', 83));
                    break;
                case "tristeranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Tristeza_RangedEnemy', 0, 'Tristeza_RangedEnemy_Move', 'Tristeza_RangedEnemy_Attack', 'Tristeza_RangedEnemy_Death', 'Tristeza_RangedEnemy', 83));
                    break;

                case "iraflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Ira_FlyingEnemy', 0, 'Ira_FlyingEnemy_Move', 'Ira_FlyingEnemy_Attack', 'Ira_FlyingEnemy_Death', 'Ira_FlyingEnemy', 83));
                    break;
                case "tristeflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Tristeza_FlyingEnemy', 0, 'Tristeza_FlyingEnemy_Move', 'Tristeza_FlyingEnemy_Attack', 'Tristeza_FlyingEnemy_Death', 'Tristeza_FlyingEnemy', 83));
                    break;


                case "iramine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Ira_MineEnemy', 0, 'Ira_MineEnemy_Move', 'Ira_MineEnemy_Attack'));
                    break;
                case "tristemine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Tristeza_MineEnemy', 0, 'Tristeza_MineEnemy_Move', 'Tristeza_MineEnemy_Attack'));
                    break;

                case "trap":
                    this.enemies.add(new Trap(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;


                //puertas
                case "iradoor":
                    this.irafloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "icedoor":
                    this.icebossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "irabossdoor":
                    this.irabossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "icebossdoor":
                    this.icefloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "feardoor":
                    this.fearbossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "tutodoor":
                    this.tutobossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;
                case "finaldoor":
                    this.finalbossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;

                //bossdoor
                case "bossdoor":
                    this.irabossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertaira');
                    break;
                case "bossdoorcontrary":
                    this.irabossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertaira');
                    break;
                case "bossdoorexit":
                    this.irabossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertaira');
                    break;

                case "sadnessbossdoor":
                    this.tristebossdoor = new SadnessBossDoor(this, objeto.x, objeto.y, 'puertatriste');
                    this.bottones = new TutorialPanel(this, objeto.x, objeto.y - 50, 'No hay','Esta puerta se abre con botones.');
                    break;
                case "sadnessbossdoorcontrary":
                    this.tristebossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertatriste');
                    break;
                case "sadnessbossdoorexit":
                    this.tristebossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertatriste');
                    break;

                case "fearbossdoor":
                    this.fearbossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "fearbossdoorcontrary":
                    this.fearbossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "fearbossdoorexit":
                    this.fearbossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;

                case "finalbossdoor":
                    this.finalbossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "finalbossdoorcontrary":
                    this.finalbossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "finalbossdoorexit":
                    this.finalbossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;

                //buttons
                case "redbutton":
                    this.redButton = new Button(this, objeto.x, objeto.y, 'rbutton', 'rojo');
                    break;
                case "greenbutton":
                    this.greenButton = new Button(this, objeto.x, objeto.y, 'gbutton', 'verde');
                    break;
                case "bluebutton":
                    this.blueButton = new Button(this, objeto.x, objeto.y, 'bbutton', 'azul');
                    break;
                case "redshow":
                    this.redshow = new ShowButton(this, objeto.x, objeto.y, 'rshowA', 'rshowE');
                    break;
                case "greenshow":
                    this.greenshow = new ShowButton(this, objeto.x, objeto.y, 'gshowA', 'gshowE');
                    break;
                case "blueshow":
                    this.blueshow = new ShowButton(this, objeto.x, objeto.y, 'bshowA', 'bshowE');
                    break;

                //showbutton    

                //triggers

                case "iratrigger":
                    this.iratrigger = new InvisibleTrigger(this, objeto.x, objeto.y);

                    break;
                case "icetrigger":
                    this.icetrigger = new InvisibleTrigger(this, objeto.x, objeto.y);
                    break;
                case "feartrigger":
                    this.feartrigger = new InvisibleTrigger(this, objeto.x, objeto.y);
                    break;
                case "tutotrigger":
                    this.tutotrigger = new InvisibleTrigger(this, objeto.x, objeto.y);
                    break;

                case "finaltrigger":
                    this.finaltrigger = new InvisibleTrigger(this, objeto.x, objeto.y);
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
                case "attackeorb":
                    this.orbGroup.add(new AttackRangeOrb(this, objeto.x, objeto.y));
                    break;
                case "shieldeorb":
                    this.orbGroup.add(new ShieldOrb(this, objeto.x, objeto.y));
                    break;
                case "vamporb":
                    this.orbGroup.add(new BloodStealOrb(this, objeto.x, objeto.y));
                    break;
                case "jumpdeorb":
                    this.orbGroup.add(new JumpOrb(this, objeto.x, objeto.y));
                    break;
                case "shieldorb":
                    this.orbGroup.add(new ShieldOrb(this, objeto.x, objeto.y));
                    break;
                case "jumporb":
                    this.orbGroup.add(new JumpOrb(this, objeto.x, objeto.y));
                break;
                //checkPoint
                case "checkpoint":
                    this.checkpoints.add(new Checkpoint(this, objeto.x, objeto.y));
                    //this.checkpoints.add(new Checkpoint(this, objeto.x + 100, objeto.y));
                    break;

                //platforms 
                case "platform":
                    this.iraPlatforms.add(new BasePlatform(this, objeto.x, objeto.y, 'platform'));
                    break;
                case "iceplatform":
                    this.icePlatforms.add(new IcePlatform(this, objeto.x, objeto.y, 'iceplatform'));
                    break;
                //bosses 
                case "iraboss":
                    this.iraboss = new BossAngry(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.iraboss);
                    // Pasar las plataformas de ira al boss
                    if (this.iraPlatforms) {
                        this.iraboss.setPlatforms(this.iraPlatforms);
                    }
                    break;
                case "tristeboss":
                    this.tristeboss = new BossSad(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.tristeboss);
                    break;
                case "miedoboss":
                    console.log("CREANDO BOSS MIEDO");
                    this.miedoboss = new BossFear(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.miedoboss);
                    break;
                case "tutoboss":
                    this.tutoboss = new BossTutorial(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.tutoboss);
                    console.log("creado");
                    break;
                case "finalboss":
                    this.finalboss = new FinalBoss(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.finalboss);
                    break;
                case "room":
                    this.Bossrooms.add(new BossRoom(this, objeto.x, objeto.y, objeto.width, objeto.height));


                //lava    
                case "lava":
                    this.lavatrigger = this.add.zone(objeto.x, objeto.y, objeto.width, objeto.height);
                    this.physics.add.existing(this.lavatrigger);
                    this.lavatrigger.body.setAllowGravity(false);
                    this.lavatrigger.body.setImmovable(true);
                    break;
                case "trap":
                    this.trap = new Trap(this, objeto.x, objeto.y, 'basicEnemyFear');
                    break;
                // Paneles texto
                case "tutorial_Move_Jump":
                    this.tutorial_move_jump = new TutorialPanel(this, objeto.x, objeto.y, 'No hay', 'Presiona ESPACIO para saltar\nUsa WASD para mover');
                    break;
                case "tutorial_attack":
                    this.tutorial_attack = new TutorialPanel(this, objeto.x, objeto.y, 'No hay', 'Presiona 🡠🡡🡢🡣 para atacar');
                    break;
            }
        })
        this.cheatManager = new CheatManager(this, this.player);

        //puertas conectadas
        //ira
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

        //sadness
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

        if (this.blueButton && this.tristebossdoor) this.blueButton.setDoor(this.tristebossdoor);
        if (this.redButton && this.tristebossdoor) this.redButton.setDoor(this.tristebossdoor);
        if (this.greenButton && this.tristebossdoor) this.greenButton.setDoor(this.tristebossdoor);

        if (this.blueButton && this.blueshow) this.blueButton.setShow(this.blueshow);
        if (this.redButton && this.redshow) this.redButton.setShow(this.redshow);
        if (this.greenButton && this.greenshow) this.greenButton.setShow(this.greenshow);

        //fear
        if (this.fearbossdoor && this.fearbossdoorcontrary) {
            this.fearbossdoor.setContrary(this.fearbossdoorcontrary);
            this.fearbossdoorcontrary.setContrary(this.fearbossdoor);
        }

        if (this.fearbossdoorexit && this.fearbossdoor) {
            this.fearbossdoorexit.setContrary(this.fearbossdoor);
        }

        if (this.fearbossdoor) this.doors.add(this.fearbossdoor);
        if (this.fearbossdoorcontrary) this.doors.add(this.fearbossdoorcontrary);
        if (this.fearbossdoorexit) this.doors.add(this.fearbossdoorexit);

        //final
        if (this.finalbossdoor && this.finalbossdoorcontrary) {
            this.finalbossdoor.setContrary(this.finalbossdoorcontrary);
            this.finalbossdoorcontrary.setContrary(this.finalbossdoor);
        }

        if (this.finalbossdoorexit && this.finalbossdoor) {
            this.finalbossdoorexit.setContrary(this.finalbossdoor);
        }

        if (this.finalbossdoor) this.doors.add(this.finalbossdoor);
        if (this.finalbossdoorcontrary) this.doors.add(this.finalbossdoorcontrary);
        if (this.finalbossdoorexit) this.doors.add(this.finalbossdoorexit);

        //bossdoors y triggers

        this.irafloordoors.getChildren().forEach(door => {
            door.cerrarPuerta();
        });
        this.irabossdoors.getChildren().forEach(door => {
            door.abrirPuerta();
        });
        if (this.iratrigger) this.iratrigger.getDoors(this.irabossdoors);
        if (this.iratrigger && this.iraboss) this.iratrigger.getBoss(this.iraboss);


        this.icebossdoors.getChildren().forEach(door => {
            door.abrirPuerta();
        });
        this.icefloordoors.getChildren().forEach(door => {
            door.cerrarPuerta();
        });
        if (this.icetrigger) this.icetrigger.getDoors(this.icebossdoors);
        if (this.icetrigger && this.tristeboss) this.icetrigger.getBoss(this.tristeboss);

        this.fearbossdoors.getChildren().forEach(door => {
            door.abrirPuerta();
        });



        if (this.feartrigger) this.feartrigger.getDoors(this.fearbossdoors);

        if (this.feartrigger && this.miedoboss) this.feartrigger.getBoss(this.miedoboss);

        this.tutobossdoors.getChildren().forEach(door => {
            door.abrirPuerta();
        });




        if (this.tutotrigger) this.tutotrigger.getDoors(this.tutobossdoors);

        if (this.tutotrigger && this.tutoboss) this.tutotrigger.getBoss(this.tutoboss);


        this.finalbossdoors.getChildren().forEach(door => {
            door.abrirPuerta();
        });
        if (this.finaltrigger) this.finaltrigger.getDoors(this.finalbossdoors);

        if (this.finaltrigger && this.finalboss) this.finaltrigger.getBoss(this.finalboss);

        if (this.iraboss) this.iraboss.getDoors(this.irabossdoors, this.irafloordoors);
        if (this.tristeboss) this.tristeboss.getDoors(this.icebossdoors, this.icefloordoors);
        if (this.miedoboss) this.miedoboss.getDoors(this.fearbossdoors);
        if (this.tutoboss) this.tutoboss.getDoors(this.tutobossdoors);
        if (this.finalboss) this.finalboss.getDoors(this.finalbossdoors);

        //mapdoors

        //ui        
        this.uiManager = new UiManager(this, this.player);


        // Colliders y camaras
        this.physics.add.collider(this.player, layer);
        this.physics.add.collider(this.player, this.irabossdoors);
        this.physics.add.collider(this.player, this.irafloordoors);
        this.physics.add.collider(this.player, this.icebossdoors);
        this.physics.add.collider(this.player, this.icefloordoors);
        this.physics.add.collider(this.player, this.fearbossdoors);
        this.physics.add.collider(this.player, this.tutobossdoors);
        this.physics.add.collider(this.player, this.finalbossdoors);



        this.physics.add.collider(this.player, this.icePlatforms);
        this.physics.add.collider(this.player, this.iraPlatforms);
        this.physics.add.collider(layer, this.enemies);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setFollowOffset(0, 100);
        this.cameras.main.setBounds(-200, 0, 140000, 100000);



        //Overlaps
        //Evento de activación de la lava
        //------------------------------


        if (this.lavatrigger) {
            this.physics.add.overlap(this.player, this.lavatrigger, () => {
                this.lava = new FloorIsLava(this, this.lavatrigger.y, 75, this.player);
                this.lava.startLava();
                this.lavatrigger.destroy();
                this.cameras.main.shake(500, 0.01);
            });
        }
        //------------------------------
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

        this.physics.add.overlap(this.player, this.icetrigger, () => {
            this.icetrigger.llamar();
        });
        this.physics.add.overlap(this.player, this.feartrigger, () => {
            this.feartrigger.llamar();
        });
        this.physics.add.overlap(this.player, this.tutotrigger, () => {
            this.tutotrigger.llamar();
        });

        this.physics.add.overlap(this.player, this.finaltrigger, () => {
            this.finaltrigger.llamar();
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

    createAnimations() {

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

        if (this.cheatManager) {
            this.cheatManager.update();
        }

        // Paneles de texto
        if (this.player && this.tutorial_move_jump) {
            this.tutorial_move_jump.update(this.player);
        }

        if (this.player && this.tutorial_attack) {
            this.tutorial_attack.update(this.player);
        }
        if (this.player && this.bottones) {
            this.bottones.update(this.player);
        }
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

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
import PlayerProjectilePool from "../objects/PlayerProjectilePool.js";
import StaticLava from '../objects/StaticLava.js';
import FinalBossDoor from '../objects/FinalBossDoor.js';

/**
 * Escena principal del juego
 * Maneja todo el nivel: jugador, enemigos, jefes, puertas, checkpoints, orbes y mecánicas
 */
export default class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    create() {
        // ========================================
        // INICIALIZACIÓN BÁSICA
        // ========================================

        // Gestor de inputs del jugador
        this.inputManager = new InputManager(this);

        // Mundo de física enorme (140,000 de ancho para todo el mapa)
        this.physics.world.setBounds(-200, 0, 140000, 100000);

        // Gestor de datos persistentes del jugador
        this.PlayerDataManager = PlayerDataManager;

        // ========================================
        // CARGA DEL TILEMAP (Tiled)
        // ========================================

        const map = this.make.tilemap({ key: 'mappy' });
        const tileset = map.addTilesetImage('Ira', 'tiles');
        let layer = map.createLayer('mapa', tileset, 0, 0);

        // Activar colisiones en tiles marcados con la propiedad "colision: true"
        layer.setCollisionByProperty({ colision: true });

        // Obtener capa de objetos (donde están posicionados enemigos, puertas, etc.)
        let obsj = map.getObjectLayer('objetos');

        // ========================================
        // CREACIÓN DE GRUPOS DE FÍSICA
        // ========================================

        // Grupo de salas de jefes (zonas que cambian cámara)
        this.Bossrooms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Grupos de puertas por zona (se abren/cierran según progreso)
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

        // Plataformas móviles de la zona de ira
        this.iraPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Grupo de puertas generales (teleports)
        this.doors = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Grupo de checkpoints (puntos de guardado)
        this.checkpoints = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Grupo de orbes coleccionables (power-ups)
        this.orbGroup = this.physics.add.group();

        // Grupo de todos los enemigos
        this.enemies = this.physics.add.group();

        // Pool de proyectiles del jugador (optimización)
        this.playerProjectilePool = new PlayerProjectilePool(this, "plume");

        // Crear todas las animaciones del juego
        this.createAnimations();

        // ========================================
        // PARSING DE OBJETOS DEL TILEMAP
        // ========================================
        // Recorre cada objeto del mapa y crea las entidades correspondientes

        obsj.objects.forEach((objeto) => {
            switch (objeto.name) {

                // ====================================
                // JUGADOR
                // ====================================
                case "player":
                    // Si no hay punto de respawn guardado, crear en posición inicial
                    if (PlayerDataManager.data.respawnPoint.x == 0 && PlayerDataManager.data.respawnPoint.y == 0) {
                        this.player = new Player(this, objeto.x, objeto.y);
                    }
                    // Si hay checkpoint guardado, respawnear ahí
                    else {
                        this.player = new Player(this, PlayerDataManager.data.respawnPoint.x, PlayerDataManager.data.respawnPoint.y)
                    }
                    // Aplicar datos guardados (vida, orbes, etc.)
                    if (this.player) PlayerDataManager.applyDataToPlayer(this.player);
                    break;

                // ====================================
                // ENEMIGOS BÁSICOS (MELEE)
                // ====================================
                case "ira":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyAngry', 0, 'Ira_BasicEnemy_Move', 'basicEnemyAngry_melee_anim'));
                    break;
                case "tristeza":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemySad', 0, 'Tristeza_BasicEnemy_Move', 'basicEnemySad_melee_anim'));
                    break;
                case "alegria":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyHappy'));
                    break;
                case "miedo":
                    this.enemies.add(new BasicMeleeEnemy(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;

                // ====================================
                // ENEMIGOS A DISTANCIA (RANGED)
                // ====================================
                case "iraranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Ira_RangedEnemy', 0, 'Ira_RangedEnemy_Move', 'Ira_RangedEnemy_Attack', 'Ira_RangedEnemy_Death', 'Ira_FlyingEnemy', 83));
                    break;
                case "tristeranged":
                    this.enemies.add(new RangedEnemy(this, objeto.x, objeto.y, 'Tristeza_RangedEnemy', 0, 'Tristeza_RangedEnemy_Move', 'Tristeza_RangedEnemy_Attack', 'Tristeza_RangedEnemy_Death', 'Tristeza_FlyingEnemy', 83));
                    break;

                // ====================================
                // ENEMIGOS VOLADORES (FLYING)
                // ====================================
                case "iraflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Ira_FlyingEnemy', 0, 'Ira_FlyingEnemy_Move', 'Ira_FlyingEnemy_Attack', 'Ira_FlyingEnemy_Death', 'Ira_FlyingEnemy', 83));
                    break;
                case "tristeflying":
                    this.enemies.add(new FlyingRangedEnemy(this, objeto.x, objeto.y, 'Tristeza_FlyingEnemy', 0, 'Tristeza_FlyingEnemy_Move', 'Tristeza_FlyingEnemy_Attack', 'Tristeza_FlyingEnemy_Death', 'Tristeza_FlyingEnemy', 83));
                    break;

                // ====================================
                // ENEMIGOS MINA (EXPLOTAN)
                // ====================================
                case "iramine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Ira_MineEnemy', 0, 'Ira_MineEnemy_Move', 'Ira_MineEnemy_Attack'));
                    break;
                case "tristemine":
                    this.enemies.add(new MineEnemy(this, objeto.x, objeto.y, 'Tristeza_MineEnemy', 0, 'Tristeza_MineEnemy_Move', 'Tristeza_MineEnemy_Attack'));
                    break;

                // ====================================
                // TRAMPAS ESTÁTICAS
                // ====================================
                case "trap":
                    this.enemies.add(new Trap(this, objeto.x, objeto.y, 'basicEnemyFear'));
                    break;

                // ====================================
                // PUERTAS DE ZONA (bloquean áreas)
                // ====================================
                case "iradoor":
                    this.irabossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'PuertaBoss'));
                    break;
                case "icedoor":
                    this.icebossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'PuertaBoss'));
                    break;
                case "irazonedoor":
                    this.irafloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'bloque'));
                    break;
                case "icezonedoor":
                    this.icefloordoors.add(new MapDoor(this, objeto.x, objeto.y, 'bloque'));
                    break;
                case "feardoor":
                    this.fearbossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'PuertaBoss'));
                    break;
                case "tutodoor":
                    this.tutobossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'PuertaBoss'));
                    break;
                case "finaldoor":
                    this.finalbossdoors.add(new MapDoor(this, objeto.x, objeto.y, 'PuertaBoss'));
                    break;

                // ====================================
                // PUERTAS DE JEFES (con animaciones)
                // ====================================

                // Puertas del boss de Ira
                case "bossdoor":
                    this.irabossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertairaSheet');
                    break;
                case "bossdoorcontrary":
                    this.irabossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertairaSheet');
                    break;
                case "bossdoorexit":
                    this.irabossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertairaSheet');
                    break;

                // Puertas del boss de Tristeza
                case "sadnessbossdoor":
                    this.tristebossdoor = new SadnessBossDoor(this, objeto.x, objeto.y, 'puertatriste');
                    this.bottones = new TutorialPanel(this, objeto.x + 15, objeto.y + 150, 'No hay', 'Esta puerta se abre con botones');
                    break;
                case "sadnessbossdoorcontrary":
                    this.tristebossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertatriste');
                    break;
                case "sadnessbossdoorexit":
                    this.tristebossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertatriste');
                    break;

                // Puertas del boss de Miedo
                case "fearbossdoor":
                    this.fearbossdoor = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "fearbossdoorcontrary":
                    this.fearbossdoorcontrary = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "fearbossdoorexit":
                    this.fearbossdoorexit = new DoorBoss(this, objeto.x, objeto.y, 'puertamiedo');
                    break;

                // Puertas del boss Final
                case "finalbossdoor":
                    this.finalbossdoor = new FinalBossDoor(this, objeto.x, objeto.y, 'puertafinal');
                    break;
                case "finalbossdoorcontrary":
                    this.finalbossdoorcontrary = new FinalBossDoor(this, objeto.x, objeto.y, 'puertamiedo');
                    break;
                case "finalbossdoorexit":
                    this.finalbossdoorexit = new FinalBossDoor(this, objeto.x, objeto.y, 'puertamiedo');
                    break;

                // ====================================
                // BOTONES (puzzle de la zona tristeza)
                // ====================================
                case "redbutton":
                    this.redButton = new Button(this, objeto.x, objeto.y, 'rbutton', 'rojo');
                    // Si ya fue activado antes, mantener estado
                    if (PlayerDataManager.data.buttonStatus.red) this.redButton.changeTexture();
                    break;
                case "greenbutton":
                    this.greenButton = new Button(this, objeto.x, objeto.y, 'gbutton', 'verde');
                    if (PlayerDataManager.data.buttonStatus.green) this.greenButton.changeTexture();
                    break;
                case "bluebutton":
                    this.blueButton = new Button(this, objeto.x, objeto.y, 'bbutton', 'azul');
                    if (PlayerDataManager.data.buttonStatus.blue) this.blueButton.changeTexture();
                    break;

                // ====================================
                // INDICADORES DE BOTONES (visual)
                // ====================================
                case "redshow":
                    this.redshow = new ShowButton(this, objeto.x, objeto.y, 'rshowA', 'rshowE');
                    this.redshow.isOn = PlayerDataManager.data.buttonStatus.red;
                    this.redshow.changeTexture();
                    break;
                case "greenshow":
                    this.greenshow = new ShowButton(this, objeto.x, objeto.y, 'gshowA', 'gshowE');
                    this.greenshow.isOn = PlayerDataManager.data.buttonStatus.green;
                    this.greenshow.changeTexture();
                    break;
                case "blueshow":
                    this.blueshow = new ShowButton(this, objeto.x, objeto.y, 'bshowA', 'bshowE');
                    this.blueshow.isOn = PlayerDataManager.data.buttonStatus.blue;
                    this.blueshow.changeTexture();
                    break;

                // ====================================
                // TRIGGERS INVISIBLES (eventos de zona)
                // ====================================
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
                    this.finaltrigger = new InvisibleTrigger(this, objeto.x, objeto.y, 200, 300);
                    break;
                case "finaltrigger2":
                    this.finaltrigger2 = new InvisibleTrigger(this, objeto.x, objeto.y, 200, 300);
                    break;

                // ====================================
                // ORBES (power-ups coleccionables)
                // ====================================
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

                // ====================================
                // CHECKPOINTS (puntos de guardado)
                // ====================================
                case "checkpoint":
                    this.checkpoints.add(new Checkpoint(this, objeto.x, objeto.y));
                    break;

                // ====================================
                // PLATAFORMAS
                // ====================================
                case "platform":
                    this.iraPlatforms.add(new BasePlatform(this, objeto.x, objeto.y, 'platform'));
                    break;

                // ====================================
                // JEFES (BOSSES)
                // ====================================
                case "iraboss":
                    this.iraboss = new BossAngry(this, objeto.x, objeto.y, this.player);
                    this.enemies.add(this.iraboss);
                    // Pasar plataformas al boss para que pueda usarlas
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

                // ====================================
                // SALA DE JEFE (zona que cambia cámara)
                // ====================================
                case "room":
                    this.Bossrooms.add(new BossRoom(this, objeto.x, objeto.y, objeto.width, objeto.height));
                    break;

                // ====================================
                // LAVA (mecánica de peligro)
                // ====================================
                case "lava":
                    // Trigger que activa lava ascendente
                    this.lavatrigger = this.add.zone(objeto.x, objeto.y, objeto.width, objeto.height);
                    this.physics.add.existing(this.lavatrigger);
                    this.lavatrigger.body.setAllowGravity(false);
                    this.lavatrigger.body.setImmovable(true);
                    break;
                case "lavastop":
                    // Trigger que detiene la lava
                    this.lavastoptrigger = this.add.zone(objeto.x, objeto.y, objeto.width, objeto.height);
                    this.physics.add.existing(this.lavastoptrigger);
                    this.lavastoptrigger.body.setAllowGravity(false);
                    this.lavastoptrigger.body.setImmovable(true);
                    break;
                case "staticlava":
                    // Lava estática que mata al contacto
                    this.floorislava = new StaticLava(this, objeto.x, objeto.y, objeto.width, objeto.height, 'ground');
                    break;
                case "trap":
                    this.trap = new Trap(this, objeto.x, objeto.y, 'basicEnemyFear');
                    break;

                // ====================================
                // PANELES DE TUTORIAL (texto en juego)
                // ====================================
                case "tutorial_Move_Jump":
                    this.tutorial_move_jump = new TutorialPanel(this, objeto.x, objeto.y, 'No hay', 'Presiona ESPACIO para saltar\nUsa WASD para mover');
                    break;
                case "tutorial_attack":
                    this.tutorial_attack = new TutorialPanel(this, objeto.x, objeto.y, 'No hay', 'Presiona 🡠🡡🡢🡣 para atacar');
                    break;
            }
        })

        // ========================================
        // SISTEMA DE CHEATS
        // ========================================
        this.cheatManager = new CheatManager(this, this.player);

        // ========================================
        // CONEXIÓN DE PUERTAS (TELEPORTS)
        // ========================================

        // Puertas de Ira (conectadas entre sí)
        if (this.irabossdoor && this.irabossdoorcontrary) {
            this.irabossdoor.setContrary(this.irabossdoorcontrary);
            this.irabossdoorcontrary.setContrary(this.irabossdoor);
        }
        if (this.irabossdoorexit && this.irabossdoor) {
            this.irabossdoorexit.setContrary(this.irabossdoor);
        }
        // Añadir al grupo general
        if (this.irabossdoor) this.doors.add(this.irabossdoor);
        if (this.irabossdoorcontrary) this.doors.add(this.irabossdoorcontrary);
        if (this.irabossdoorexit) this.doors.add(this.irabossdoorexit);

        // Puertas de Tristeza (conectadas entre sí)
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

        // Conectar botones con puerta de tristeza (puzzle)
        if (this.blueButton && this.tristebossdoor) this.blueButton.setDoor(this.tristebossdoor);
        if (this.redButton && this.tristebossdoor) this.redButton.setDoor(this.tristebossdoor);
        if (this.greenButton && this.tristebossdoor) this.greenButton.setDoor(this.tristebossdoor);

        // Conectar botones con indicadores visuales
        if (this.blueButton && this.blueshow) this.blueButton.setShow(this.blueshow);
        if (this.redButton && this.redshow) this.redButton.setShow(this.redshow);
        if (this.greenButton && this.greenshow) this.greenButton.setShow(this.greenshow);

        // Puertas de Miedo (conectadas entre sí)
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

        // Puertas Finales (conectadas entre sí)
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

        // Asignar puerta final a bosses anteriores
        if (this.finalbossdoor && this.tristeboss) this.tristeboss.setFinalDoor(this.finalbossdoor);
        if (this.finalbossdoor && this.iraboss) this.iraboss.setFinalDoor(this.finalbossdoor);

        // ========================================
        // CONEXIÓN DE TRIGGERS Y JEFES
        // ========================================

        // Trigger de Ira
        if (this.iratrigger) this.iratrigger.getDoors(this.irabossdoors);
        if (this.iratrigger && this.iraboss) this.iratrigger.getBoss(this.iraboss);
        // Abrir puertas inicialmente
        this.irabossdoors.getChildren().forEach(door => {
            door.openDoor();
        });

        // Trigger de Hielo/Tristeza
        if (this.icetrigger) this.icetrigger.getDoors(this.icebossdoors);
        if (this.icetrigger && this.tristeboss) this.icetrigger.getBoss(this.tristeboss);
        this.icebossdoors.getChildren().forEach(door => {
            door.openDoor();
        });

        // Trigger de Miedo
        if (this.feartrigger) this.feartrigger.getDoors(this.fearbossdoors);
        if (this.feartrigger && this.miedoboss) this.feartrigger.getBoss(this.miedoboss);
        this.fearbossdoors.getChildren().forEach(door => {
            door.openDoor();
        });

        // Trigger de Tutorial
        if (this.tutotrigger) this.tutotrigger.getDoors(this.tutobossdoors);
        if (this.tutotrigger && this.tutoboss) this.tutotrigger.getBoss(this.tutoboss);
        this.tutobossdoors.getChildren().forEach(door => {
            door.openDoor();
        });

        // Trigger Final
        if (this.finaltrigger) this.finaltrigger.getDoors(this.finalbossdoors);
        if (this.finaltrigger && this.finalboss) this.finaltrigger.getBoss(this.finalboss);
        if (this.finaltrigger2) this.finaltrigger2.getDoors(this.finalbossdoors);
        if (this.finaltrigger2 && this.finalboss) this.finaltrigger2.getBoss(this.finalboss);
        this.finalbossdoors.getChildren().forEach(door => {
            door.openDoor();
        });

        // Asignar puertas a cada boss (para que puedan controlarlas)
        if (this.iraboss) this.iraboss.getDoors(this.irabossdoors, this.irafloordoors);
        if (this.tristeboss) this.tristeboss.getDoors(this.icebossdoors, this.icefloordoors);
        if (this.miedoboss) this.miedoboss.getDoors(this.fearbossdoors);
        if (this.tutoboss) this.tutoboss.getDoors(this.tutobossdoors);
        if (this.finalboss) this.finalboss.getDoors(this.finalbossdoors);

        // ========================================
        // PERSISTENCIA DE PUERTAS (según progreso)
        // ========================================

        // Si ya derrotaste al boss de ira, mantener puertas abiertas
        if (PlayerDataManager.data.bossStatus.anger) {
            this.irabossdoors.getChildren().forEach(door => {
                door.openDoor();
            });
        }

        // Si ya derrotaste al boss de tristeza, mantener puertas abiertas
        if (PlayerDataManager.data.bossStatus.sadness) {
            this.icefloordoors.getChildren().forEach(door => {
                door.openDoor();
            });
        }

        // ========================================
        // UI MANAGER
        // ========================================
        this.uiManager = new UiManager(this, this.player);

        // ========================================
        // COLISIONES (COLLIDERS)
        // ========================================
        // Objetos que colisionan físicamente (no se atraviesan)

        this.physics.add.collider(this.player, layer);                    // Jugador con tilemap
        this.physics.add.collider(this.player, this.irabossdoors);        // Jugador con puertas de ira
        this.physics.add.collider(this.player, this.irafloordoors);       // Jugador con bloques de ira
        this.physics.add.collider(this.player, this.icebossdoors);        // Jugador con puertas de hielo
        this.physics.add.collider(this.player, this.icefloordoors);       // Jugador con bloques de hielo
        this.physics.add.collider(this.player, this.fearbossdoors);       // Jugador con puertas de miedo
        this.physics.add.collider(this.player, this.tutobossdoors);       // Jugador con puertas de tutorial
        this.physics.add.collider(this.player, this.finalbossdoors);      // Jugador con puertas finales
        this.physics.add.collider(this.player, this.iraPlatforms);        // Jugador con plataformas
        this.physics.add.collider(layer, this.enemies);                   // Enemigos con tilemap

        // ========================================
        // CONFIGURACIÓN DE CÁMARA
        // ========================================
        this.cameras.main.startFollow(this.player);                       // Seguir al jugador
        this.cameras.main.setFollowOffset(0, 100);                        // Offset vertical (jugador más abajo en pantalla)
        this.cameras.main.setBounds(-200, 0, 140000, 100000);             // Límites de la cámara

        // ========================================
        // OVERLAPS (detección sin colisión física)
        // ========================================
        // Objetos que se detectan pero se pueden atravesar

        // ====================================
        // SISTEMA DE LAVA ASCENDENTE
        // ====================================
        if (this.lavatrigger) {
            this.physics.add.overlap(this.player, this.lavatrigger, () => {
                // Crear lava que sube desde el trigger
                this.lava = new FloorIsLava(this, this.lavatrigger.y, 75, this.player);
                this.lava.startLava();
                this.lavatrigger.destroy();                               // Destruir trigger (solo se activa una vez)
                this.cameras.main.shake(500, 0.01);                       // Screen shake para impacto
            });
        }

        // Trigger para detener la lava
        this.physics.add.overlap(this.player, this.lavastoptrigger, () => {
            if (this.lava) {
                this.lava.stopLava();                                     // Detener ascenso de lava
            }
            this.lavastoptrigger.destroy();                               // Destruir trigger
            this.cameras.main.shake(500, 0.01);                           // Screen shake
        });

        // ====================================
        // LAVA ESTÁTICA (mata al contacto)
        // ====================================
        this.physics.add.overlap(this.player, this.floorislava, () => this.player.die());

        // ====================================
        // ORBES COLECCIONABLES
        // ====================================
        this.physics.add.overlap(this.player, this.orbGroup, (player, orb) => {
            orb.collect(player);                                          // Aplicar efecto del orbe
        });

        // ====================================
        // PUERTAS (TELEPORTS)
        // ====================================
        this.physics.add.overlap(this.player, this.doors, (player, door) => {
            this.currentDoor = door;                                      // Guardar puerta actual
            // Mostrar prompt "Presiona E"
            if (door.prompt && !door.isOpening) {
                door.prompt.setVisible(true);
            }
        });

        // Tecla E para interactuar con puertas
        this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // ====================================
        // BOTONES (PUZZLE)
        // ====================================
        this.physics.add.overlap(this.player, this.redButton, () => {
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.redButton.press();
        });

        this.physics.add.overlap(this.player, this.blueButton, () => {
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.blueButton.press();
        });

        this.physics.add.overlap(this.player, this.greenButton, () => {
            if (Phaser.Input.Keyboard.JustDown(this.keyE)) this.greenButton.press();
        });

        // ====================================
        // TRIGGERS DE BOSSES
        // ====================================
        this.physics.add.overlap(this.player, this.iratrigger, () => {
            this.iratrigger.llamar();                                     // Activar evento (cerrar puertas, iniciar boss)
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

        this.physics.add.overlap(this.player, this.finaltrigger2, () => {
            this.finaltrigger2.llamar();
        });

        // ====================================
        // CHECKPOINTS
        // ====================================
        this.physics.add.overlap(this.player, this.checkpoints, (player, cp) => {
            cp.playerNearby = true;                                       // Marcar que jugador está cerca
            if (cp.prompt) cp.prompt.setVisible(true);                    // Mostrar "Presiona E para guardar"
        });

        // ========================================
        // EVENTO DE RESUME (volver desde pausa)
        // ========================================
        this.events.on('resume', () => {
            // Restaurar datos del jugador al volver
            if (this.player) PlayerDataManager.applyDataToPlayer(this.player);

            // Ocultar prompts de checkpoints
            if (this.checkpoints) {
                this.checkpoints.getChildren().forEach(cp => {
                    if (cp.prompt) cp.prompt.setVisible(false);
                });
            }
        });

        // ========================================
        // SISTEMA DE PAUSA
        // ========================================
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('PlayScene');                                // Pausar esta escena
            this.scene.launch('Pause', { file: 'PlayScene' });            // Lanzar menú de pausa
        });
    }

    /**
     * Crea todas las animaciones del juego
     * Se llama una sola vez al inicio
     */
    createAnimations() {

        // ========================================
        // ANIMACIONES DEL JUGADOR
        // ========================================
        this.anims.create({
            key: 'Player_idle',
            frames: [{ key: 'angel_sword_idle' }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'Final',
            frames: [
                { key: 'final' },
                { key: 'final2' },
            ],
            frameRate: 2,
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

        // ========================================
        // ANIMACIONES DE ATAQUE
        // ========================================
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

        // ========================================
        // ANIMACIONES DE UI
        // ========================================
        this.anims.create({
            key: 'UI_heartbreakAnimation',
            frames: this.anims.generateFrameNumbers('heartbreak', { start: 0, end: 10 }),
            frameRate: 12,
            repeat: 0
        });

        // Animaciones de Checkpoint (3 estados)
        this.anims.create({
            key: 'cp_idle_off',                                           // Checkpoint inactivo
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'cp_transition',                                         // Transición al activarse
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 10, end: 31 }),
            frameRate: 12,
            repeat: 0
        });

        this.anims.create({
            key: 'cp_idle_on',                                            // Checkpoint activo
            frames: this.anims.generateFrameNumbers('checkpoint', { start: 32, end: 38 }),
            frameRate: 8,
            repeat: -1
        });

        // ========================================
        // ANIMACIONES ENEMIGOS BÁSICOS
        // ========================================
        this.anims.create({
            key: 'Ira_BasicEnemy_Move',
            frames: this.anims.generateFrameNumbers('basicEnemyAngry_move', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'Tristeza_BasicEnemy_Move',
            frames: this.anims.generateFrameNumbers('basicEnemySad_move', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });

        // Animación de ataque melee para enemigo angry
        this.anims.create({
            key: 'basicEnemyAngry_melee_anim',
            frames: this.anims.generateFrameNumbers('basicEnemyAngry_melee', { start: 0, end: 4 }),
            frameRate: 24,
            repeat: 0
        });

        // Animación de ataque melee para enemigo sad
        this.anims.create({
            key: 'basicEnemySad_melee_anim',
            frames: this.anims.generateFrameNumbers('basicEnemySad_melee', { start: 0, end: 4 }),
            frameRate: 24,
            repeat: 0
        });

        // ========================================
        // ANIMACIONES ENEMIGOS VOLADORES
        // ========================================

        // Enemigo volador de Ira
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

        // Enemigo volador de Tristeza
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

        // ========================================
        // ANIMACIONES ENEMIGOS A DISTANCIA
        // ========================================

        // Enemigo ranged de Ira
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

        // Enemigo ranged de Tristeza
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

        // ========================================
        // ANIMACIONES ENEMIGOS MINA
        // ========================================

        // Enemigo mina de Ira
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

        // Enemigo mina de Tristeza
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

    /**
     * Se ejecuta cada frame (60 veces por segundo)
     * @param {number} time - Tiempo total desde inicio del juego
     * @param {number} delta - Tiempo desde el último frame
     */
    update(time, delta) {

        // ========================================
        // ACTUALIZAR JUGADOR
        // ========================================
        this.player.update(time, delta);

        // ========================================
        // ACTUALIZAR TODOS LOS ENEMIGOS
        // ========================================
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        // ========================================
        // ACTUALIZAR JEFES (solo si están activos)
        // ========================================
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

        // ========================================
        // GESTIÓN DE PUERTAS
        // ========================================

        // Si había una puerta actual, verificar si aún estamos en contacto
        if (this.currentDoor) {
            if (!this.physics.overlap(this.player, this.currentDoor)) {
                // Ya no hay overlap, ocultar prompt
                if (this.currentDoor.prompt) {
                    this.currentDoor.prompt.setVisible(false);
                }
                this.currentDoor = null;
            }
        }

        // Buscar si hay alguna puerta bajo el jugador
        let doorUnderPlayer = null;
        this.doors.getChildren().forEach(door => {
            if (this.physics.overlap(this.player, door)) {
                doorUnderPlayer = door;
            }
        });

        // Actualizar puerta actual
        this.currentDoor = doorUnderPlayer;

        // Si está sobre una puerta y presiona E, abrirla
        if (this.currentDoor && Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.currentDoor.openDoor();
        }

        // ========================================
        // GESTIÓN DE CHECKPOINTS
        // ========================================
        this.checkpoints.getChildren().forEach(cp => {
            // Verificar si jugador está cerca del checkpoint
            if (this.physics.overlap(this.player, cp)) {
                // Marcar como cerca y mostrar prompt
                if (!cp.playerNearby) {
                    cp.playerNearby = true;
                    if (cp.prompt) cp.prompt.setVisible(true);
                }
            } else {
                // Ya no está cerca, ocultar prompt
                if (cp.playerNearby) {
                    cp.playerNearby = false;
                    if (cp.prompt) cp.prompt.setVisible(false);
                }
            }
        });

        // ========================================
        // GESTIÓN DE SALAS DE JEFES
        // ========================================
        this.Bossrooms.getChildren().forEach(bossRoom => {
            const inside = this.physics.overlap(this.player, bossRoom);

            // Si entra en sala de jefe
            if (inside && !bossRoom.playerInside) {
                bossRoom.playerInside = true;
                this.handleBossRoom(bossRoom);                            // Cambiar cámara a sala fija
            }
            // Si sale de sala de jefe
            else if (!inside && bossRoom.playerInside && !this.player.dead) {
                bossRoom.playerInside = false;
                this.cameras.main.startFollow(this.player);               // Volver a seguir jugador
                this.cameras.main.setBounds(-200, 0, 140000, 100000);     // Restaurar límites normales
            }
        });

        // ========================================
        // ACTUALIZAR CHEATS
        // ========================================
        if (this.cheatManager) {
            this.cheatManager.update();
        }

        // ========================================
        // ACTUALIZAR PANELES DE TUTORIAL
        // ========================================
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

    /**
     * Cambia la cámara a una sala de jefe fija
     * La cámara deja de seguir al jugador y se centra en la sala
     * @param {BossRoom} bossRoom - Sala del jefe
     */
    handleBossRoom(bossRoom) {
        // Detener seguimiento del jugador
        this.cameras.main.stopFollow();

        // Establecer límites de la cámara a la sala del jefe
        this.cameras.main.setBounds(
            bossRoom.x - bossRoom.width / 2,
            bossRoom.y - bossRoom.height / 2,
            bossRoom.width,
            bossRoom.height
        );

        // Centrar cámara en la sala
        this.cameras.main.centerOn(bossRoom.x, bossRoom.y);
    }

    /**
     * Secuencia cinemática de inicio de pelea de jefe
     * Hace fade out, teletransporta al jugador, fade in, reproduce intro del jefe
     * @param {Boss} boss - Jefe que iniciará la pelea
     */
    startBossSequence(boss) {
        // ========================================
        // FASE 1: BLOQUEAR JUGADOR
        // ========================================
        if (this.player) {
            this.player.canMove = false;                                  // Deshabilitar input
            this.player.setVelocity(0, 0);                                // Detener movimiento
            this.player.play('Player_idle');                              // Animación idle
        }

        // ========================================
        // FASE 2: FADE OUT (pantalla a negro)
        // ========================================
        this.cameras.main.fadeOut(1000, 0, 0, 0);                         // 1 segundo de fade

        // ========================================
        // FASE 3: TELETRANSPORTE (durante pantalla negra)
        // ========================================
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Calcular posición de spawn según el jefe
            let spawnX = boss.x;
            let spawnY = boss.y;

            // Posiciones específicas para cada jefe
            switch (boss.bossName) {
                case 'tutorial':
                    spawnX = boss.x - 400;                                // 400 píxeles a la izquierda
                    spawnY = boss.y;
                    break;
                case 'anger':
                    spawnX = boss.x;
                    spawnY = boss.y + 185;                                // Debajo del jefe
                    break;
                case 'sadness':
                    spawnX = boss.x - 400;
                    spawnY = boss.y + 130;
                    break;
                case 'fear':
                    spawnX = boss.x;
                    spawnY = boss.y + 260;
                    break;
                case 'final':
                    spawnX = boss.x;
                    spawnY = boss.y + 250;
                    break;
            }

            // Teletransportar jugador
            this.player.setPosition(spawnX, spawnY);

            // Hacer visible al jefe
            boss.setVisible(true);
            boss.setActive(true);

            // ========================================
            // FASE 4: FADE IN (pantalla vuelve desde negro) Y REPRODUCIR INTRO DEL JEFE
            // ========================================
            boss.playIntro();                                             // Animación/diálogo de intro
            this.cameras.main.fadeIn(1000, 0, 0, 0);                      // 1 segundo de fade in
        });

        // ========================================
        // FASE 5: DESBLOQUEAR JUGADOR
        // ========================================
        this.events.once('bossIntroFinished', () => {
            if (this.player) this.player.canMove = true;                  // Devolver control al jugador
        });
    }
}
import Player from '../player/Player.js';
import InputManager from '../managers/InputManager.js';
import BasicMeleeEnemy from '../enemy/BasicMeleeEnemy.js';
import RangedEnemy from '../enemy/RangedEnemy.js';
import UiManager from '../ui/UiManager.js';
import TristezaOrb from '../orbs/TristezaOrb.js';
import IraOrb from '../orbs/IraOrb.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';
import Checkpoint from '../objects/Checkpoint.js';


export default class TestPlayerScene extends Phaser.Scene {
    constructor() {
        super('TestPlayerScene');
    }

    create() {
        this.inputManager = new InputManager(this);

        this.orbRegistry = [
            { name: 'Orb Ira' },
            { name: 'Orb Tristeza' },
        ];

        this.physics.world.setBounds(-200, 0, 1400, 1000);



        this.ground = this.physics.add.staticGroup();
        this.ground.create(0, 500, 'ground').setScale(2).refreshBody();
        this.ground.create(500, 500, 'ground').setScale(2).refreshBody();
        this.ground.create(500, 400, 'ground').setScale(2).refreshBody();
        this.ground.create(1000, 500, 'ground').setScale(2).refreshBody();


        let ground = this.physics.add.staticGroup();
        ground.create(0, 500, 'ground').setScale(2).refreshBody();
        ground.create(500, 500, 'ground').setScale(2).refreshBody();
        ground.create(500, 400, 'ground').setScale(2).refreshBody();
        ground.create(1000, 500, 'ground').setScale(2).refreshBody();

        this.orbGroup = this.physics.add.group();
        const collected = PlayerDataManager.data.collectedOrbNames || [];
        if (!collected.includes('Orb Ira')) {
            const iraOrb = new IraOrb(this, 400, 300);
            this.orbGroup.add(iraOrb);
        }
        if (!collected.includes('Orb Tristeza')) {
            const tristezaOrb = new TristezaOrb(this, 800, 300);
            this.orbGroup.add(tristezaOrb);
        }

        // Creacion del jugador en el punto de respawn guardado
        if (!PlayerDataManager.data.respawnPoint) {
            PlayerDataManager.data.respawnPoint = { x: 100, y: 100 };
        }
        this.player = new Player(this,
            PlayerDataManager.data.respawnPoint.x, PlayerDataManager.data.respawnPoint.y);

        PlayerDataManager.applyToPlayer(this.player);
        // Crear un checkpoint en el nivel
        this.checkpoint = new Checkpoint(this, 500, 340);
        // overlap solo para detectar proximidad; la activación ocurre al pulsar E
        this.physics.add.overlap(this.player, this.checkpoint, (player, cp) => {
            cp.playerNearby = true;
            if (cp.prompt) cp.prompt.setVisible(true);
        });

        /*if (this.respawnPoint) {
            this.player.x = this.respawnPoint.x;
            this.player.y = this.respawnPoint.y;
            PlayerDataManager.applyToPlayer(this.player);
        }*/


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


        this.enemies = this.physics.add.group();
        this.enemies.add(new BasicMeleeEnemy(this, 200, 300, 'basicEnemyAngry'));
        this.enemies.add(new BasicMeleeEnemy(this, 600, 300, 'basicEnemySad'));
        this.enemies.add(new BasicMeleeEnemy(this, 900, 300, 'basicEnemyHappy'));
        this.enemies.add(new BasicMeleeEnemy(this, 1000, 300, 'basicEnemyFear'));
        this.enemies.add(new RangedEnemy(this, 700, 250, 'rangedEnemy'));

        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.ground, this.enemies);

        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(ground, this.enemies);



        this.physics.add.overlap(this.player, this.orbGroup, (player, orb) => {
            orb.collect(player);
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('TestPlayerScene');
            this.scene.launch('Pause', { file: 'TestPlayerScene' });
        });

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(-200, 0, 1400, 600);

        // cuando la escena se reanuda desde el menú de orbes, aplicar equipamientos
        this.events.on('resume', () => {
            if (this.player) PlayerDataManager.applyToPlayer(this.player);
            // ocultar prompt si estaba visible
            if (this.checkpoint && this.checkpoint.prompt) this.checkpoint.prompt.setVisible(false);
        });
        this.events.emit("create");
    }

    update(time, delta) {

        this.player.update(time, delta);

        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        // gestionar visibilidad del prompt del checkpoint en base a overlap
        if (this.checkpoint) {
            if (this.physics.overlap(this.player, this.checkpoint)) {
                this.checkpoint.playerNearby = true;
                if (this.checkpoint.prompt) this.checkpoint.prompt.setVisible(true);
            } else {
                if (this.checkpoint.playerNearby) {
                    this.checkpoint.playerNearby = false;
                    if (this.checkpoint.prompt) this.checkpoint.prompt.setVisible(false);
                }
            }
        }

        if (this.player.x > 1100) {
            PlayerDataManager.saveLifeFromPlayer(this.player);
            this.scene.stop();
            this.scene.launch('BossScene');
        }

        this.events.emit("create");

    }
}
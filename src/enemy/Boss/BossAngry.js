import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryFireBallState from './State/BossAngryFireBallState.js';
import BossAngryPunchState from './State/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './State/BossAngryPunchPlatformState.js';
import BossAngryCooldownState from './State/BossAngryCooldownState.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'ira');
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(4.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 35, spriteHeight / 35);
        this.body.setOffset(spriteWidth / 9.9, spriteHeight / 12);
        this.body.moves = false;

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.fireballSpeed = 450;
        this.punchYSpeed = 1000;
        this.punchXSpeed = 600;

        // Cooldown entre ataques
        this.startCooldown = 2000;
        this.attackCooldown = 0;
        this.minCooldown = 1000;
        this.maxCooldown = 1500; 

        // Grupos
        this.fireballs = scene.physics.add.group();
        this.punches = scene.physics.add.group();

        // Maquina de estados
        this.stateMachine = new StateMachine(this, 'boss');
        
        // Registrar todos los estados
        this.stateMachine.addState('punch', new BossAngryPunchState());
        this.stateMachine.addState('fireball', new BossAngryFireBallState());
        this.stateMachine.addState('punchPlatform', new BossAngryPunchPlatformState());

        // Estados disponibles por fase
        this.availableStates = ['punch', 'fireball'];
        
        // Estado especial para cooldown
        this.stateMachine.addState('cooldown', new BossAngryCooldownState());
        
        // Iniciar con cooldown inicial
        this.stateMachine.setState('cooldown');

        // Colisiones
        this.setupCollisions();

        this.attackCooldown = this.startCooldown;
        this.notdead = true;
    }

    setupCollisions() {
        this.fireballOverlap = this.scene.physics.add.overlap(
            this.fireballs,
            this.player,
            this.FireballCollisionWithPlayer,
            null,
            this
        );
        this.punchOverlap = this.scene.physics.add.overlap(
            this.punches,
            this.player,
            this.PunchCollisionWithPlayer,
            null,
            this
        );
    }

    startRandomState() {
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        // En lugar de cambiar inmediatamente el ataque, entrar en cooldown
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    FireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }

    PunchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }

    update(time, delta) {
        if (this.notdead) 
            {
              this.stateMachine.step(time, delta);
            }
       
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());

        if (this.health <= 0) this.nextPhase();
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('Boss entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Anadir el estado de plataforma a los disponibles
            this.availableStates.push('punchPlatform');

            // Reducir cooldowns en fase 2 para mas dificultad
            //this.minCooldown = 1000;
            //this.maxCooldown = 2500;

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);

                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            this.notdead = false;
            this.setVisible(false);

            this.die();
        }
    }

    die() {
        console.log('Boss derrotado definitivamente');
         this.scene.time.delayedCall(2000, () => {   this.scene.scene.stop(); 
        this.scene.scene.launch('Win')
           this.destroy();});
     
    }
}
import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossAngryCooldownState from './BossAngryState/BossAngryCooldownState.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        // Cambiar la key inicial a uno de los frames
        super(scene, x, y, 'ira_flap_1');
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

        // Crear animaciones
        this.createAnimations();

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

        // Iniciar animación
        this.play('bossira_idle');
    }

    createAnimations() {
        // Animación idle con el ciclo específico: ira1 -> ira2 -> ira3 -> ira4 -> ira3 -> ira2 -> ira1 -> ira2...
        this.scene.anims.create({
            key: 'bossira_idle',
            frames: [
                { key: 'ira_flap_1' },
                { key: 'ira_flap_2' },
                { key: 'ira_flap_3' },
                { key: 'ira_flap_4' },
                { key: 'ira_flap_3' },
                { key: 'ira_flap_2' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Animación de ataque 
        this.scene.anims.create({
            key: 'bossira_attack',
            frames: [
                { key: 'ira_flap_4' },
                { key: 'ira_flap_3' },
                { key: 'ira_flap_2' },
                { key: 'ira_flap_1' }
            ],
            frameRate: 12,
            repeat: 0
        });
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
        if (this.notdead) {
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0xff0000);
        
        // Parpadeo durante el daño
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                this.setAlpha(1);
            }
        });

        if (this.health <= 0) this.nextPhase();
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('Boss entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Añadir el estado de plataforma a los disponibles
            this.availableStates.push('punchPlatform');

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

                // Reanudar animación
                this.play('bossira_idle');

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
        
        this.scene.time.delayedCall(2000, () => {   
            this.scene.scene.stop(); 
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }

}
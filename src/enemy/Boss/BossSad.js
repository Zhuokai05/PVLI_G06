import StateMachine from '../../stateMachine/StateMachine.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import BossSadCooldownState from './BossSadState/BossSadCooldownState.js';

export default class BossSad extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tristeza');
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(3.8); // Cambiado de 4.3 a 3.8
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Posicionar en el extremo derecho de la cámara
        const cam = scene.cameras.main;
        this.setX(cam.width - 100); 
        this.setY(cam.height / 2); 

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 35, spriteHeight / 35);
        this.body.setOffset(spriteWidth / 8.9, spriteHeight / 12);
        this.body.moves = false;

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.icicleSpeed = 450;
        this.waterBallSpeed = 200;

        // Cooldown entre ataques
        this.startCooldown = 2000;
        this.attackCooldown = 0;
        this.minCooldown = 1000;
        this.maxCooldown = 1500;

        // Grupos
        this.icicles = scene.physics.add.group();
        this.waterBalls = scene.physics.add.group();
        this.radialIcicles = scene.physics.add.group();

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'boss');
        
        // Registrar todos los estados
        this.stateMachine.addState('icicle', new BossSadIcicleState());
        this.stateMachine.addState('radial', new BossSadRadialState());
        this.stateMachine.addState('waterball', new BossSadWaterBallState());

        // Estados disponibles por fase - FASE 1: solo radial y waterball
        this.availableStates = ['radial', 'waterball'];
        
        // Estado especial para cooldown
        this.stateMachine.addState('cooldown', new BossSadCooldownState());
        
        // Iniciar con cooldown inicial
        this.stateMachine.setState('cooldown');

        // Colisiones
        this.setupCollisions();

        this.attackCooldown = this.startCooldown;
        this.notdead = true;
    }

    setupCollisions() {
        this.icicleOverlap = this.scene.physics.add.overlap(
            this.icicles,
            this.player,
            this.icicleCollisionWithPlayer,
            null,
            this
        );
        this.waterBallOverlap = this.scene.physics.add.overlap(
            this.waterBalls,
            this.player,
            this.waterBallCollisionWithPlayer,
            null,
            this
        );
        this.radialIcicleOverlap = this.scene.physics.add.overlap(
            this.radialIcicles,
            this.player,
            this.radialIcicleCollisionWithPlayer,
            null,
            this
        );
    }

    startRandomState() {
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    icicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }

    waterBallCollisionWithPlayer(player, waterBall) {
        if (!waterBall.active || !player.active) return;
        const dir = player.x < waterBall.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        waterBall.destroy();
    }

    radialIcicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }

    update(time, delta) {
        if (this.notdead) {
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0x0000ff);
        this.scene.time.delayedCall(200, () => this.clearTint());

        if (this.health <= 0) this.nextPhase();
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('BossSad entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3;

            // FASE 2: añadir el estado icicle a los disponibles
            this.availableStates.push('icicle');

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 50, 50, 255);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);

                // Volver a posicionar en el extremo derecho después del respawn
                const cam = this.scene.cameras.main;
                this.setX(cam.width - 100);
                this.setY(cam.height / 2); 

                const spriteWidth = this.displayWidth;
                const spriteHeight = this.displayHeight;
                this.body.setSize(spriteWidth / 35, spriteHeight / 35);
                this.body.setOffset(spriteWidth / 8.9, spriteHeight / 12);

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

    destroyWaterBall(waterBall) {
        if (waterBall && waterBall.active) {
            waterBall.destroy();

            const explosion = this.scene.add.circle(
                waterBall.x, 
                waterBall.y, 
                20, 
                0x00ffff, 
                0.5
            );
            this.scene.time.delayedCall(200, () => explosion.destroy());
        }
    }


    die() {
        console.log('BossSad derrotado definitivamente');
        this.scene.time.delayedCall(2000, () => {
            this.scene.scene.stop();
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }
}
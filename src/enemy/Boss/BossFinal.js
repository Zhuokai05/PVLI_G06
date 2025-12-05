import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import FinalBossCooldownState from './BossFinalState/BossFinalCooldownState.js'

export default class FinalBoss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'ira_flap_1'); // Usa tu sprite del boss final
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
       
        const cam = scene.cameras.main;
        this.setPosition(cam.width /2, cam.height / 2 - 50);

   
        this.phase = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 1;

        this.fireballSpeed = 450;
        this.punchYSpeed = 1000;
        this.punchXSpeed = 600;
        this.cupSpeed = 450;
        this.icicleSpeed = 450;
        this.waterBallSpeed = 200;

        this.startCooldown = 1500;
        this.attackCooldown = 0;
        this.minCooldown = 800;
        this.maxCooldown = 1000;

        this.fireballs = scene.physics.add.group();
        this.punches = scene.physics.add.group();
        this.cups = scene.physics.add.group();
        this.icicles = scene.physics.add.group();
        this.waterBalls = scene.physics.add.group();
        this.radialIcicles = scene.physics.add.group();

        this.clawsActive = false;
        this.leftClaw = null;
        this.rightClaw = null;

        this.stateMachine = new StateMachine(this, 'finalBoss');
        
        this.stateMachine.addState('fireball', new BossAngryFireBallState());
        this.stateMachine.addState('punch', new BossAngryPunchState());
        this.stateMachine.addState('punchPlatform', new BossAngryPunchPlatformState());
        this.stateMachine.addState('xAttack', new BossFearXAttackState());
        this.stateMachine.addState('cupAttack', new BossFearCupAttackState());
        this.stateMachine.addState('icicle', new BossSadIcicleState());
        this.stateMachine.addState('radial', new BossSadRadialState());
        this.stateMachine.addState('waterball', new BossSadWaterBallState());
        this.stateMachine.addState('cooldown', new FinalBossCooldownState());

        this.allStates = [
            'fireball', 'punch', 'punchPlatform',
            'xAttack', 'cupAttack',
            'icicle', 'radial', 'waterball'
        ];

//Fase 1 
        this.availableStates = this.selectRandomStates(3);
        console.log('FinalBoss Fase 1 - Ataques:', this.availableStates);

        // Colisiones
        this.setupCollisions();

        this.attackCooldown = this.startCooldown;
        this.notdead = true;

        // Iniciar con cooldown
        this.stateMachine.setState('cooldown');
    }

    selectRandomStates(count) {
        const shuffled = [...this.allStates];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    setupCollisions() {
        this.fireballOverlap = this.scene.physics.add.overlap(
            this.fireballs,
            this.player,
            this.fireballCollisionWithPlayer,
            null,
            this
        );

        this.punchOverlap = this.scene.physics.add.overlap(
            this.punches,
            this.player,
            this.punchCollisionWithPlayer,
            null,
            this
        );

        this.cupOverlap = this.scene.physics.add.overlap(
            this.cups,
            this.player,
            this.cupCollisionWithPlayer,
            null,
            this
        );

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

    fireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }

    punchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }

    cupCollisionWithPlayer(player, cup) {
        if (!cup.active || !player.active) return;
        const dir = player.x < cup.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        cup.destroy();
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

    startRandomState() {
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        console.log('FinalBoss ejecutando:', randomState);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    generateNewCooldown() {
        this.attackCooldown = Phaser.Math.Between(this.minCooldown, this.maxCooldown);
    }

    update(time, delta) {
        if (this.notdead) {
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0xff00ff);
        
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
            console.log('FinalBoss entra en FASE 2 - ¡TODOS LOS ATAQUES DESBLOQUEADOS!');
            this.phase = 2;
            this.health = this.maxHealth + 5;

            this.availableStates = [...this.allStates];
            console.log('FinalBoss Fase 2 - Ataques:', this.availableStates);

            this.minCooldown = 600;
            this.maxCooldown = 1000;

            this.setActive(false);
            this.setVisible(false);
            
            if (this.leftClaw) this.leftClaw.setVisible(false);
            if (this.rightClaw) this.rightClaw.setVisible(false);
            
            this.scene.cameras.main.shake(1200, 0.03);
            this.scene.cameras.main.flash(800, 255, 0, 255);

            this.scene.time.delayedCall(2500, () => {
                this.setActive(true);
                this.setVisible(true);

                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Sine.easeInOut'
                });

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
        console.log('¡FinalBoss DERROTADO! ¡VICTORIA TOTAL!');
        
        this.scene.cameras.main.shake(2000, 0.05);
        this.scene.cameras.main.flash(1500, 255, 215, 0);
        
        this.scene.time.delayedCall(3000, () => {   
            this.scene.scene.stop(); 
            this.scene.scene.launch('Win');
            this.destroy();
            
            if (this.leftClaw) this.leftClaw.destroy();
            if (this.rightClaw) this.rightClaw.destroy();
        });
    }

    createClaws() {
        const cam = this.scene.cameras.main;
    
        this.leftClaw = this.scene.physics.add.sprite(cam.width / 2 - 380, cam.height / 2 - 100, 'garra');
        this.rightClaw = this.scene.physics.add.sprite(cam.width / 2 + 380, cam.height / 2 - 100, 'garra');
    
        this.leftClaw.setScale(3.5);
        this.rightClaw.setScale(3.5);
        this.leftClaw.setDepth(5);
        this.rightClaw.setDepth(5);
        this.leftClaw.body.allowGravity = false;
        this.rightClaw.body.allowGravity = false;
    
        this.leftClaw.body.setSize(this.leftClaw.displayWidth / 3.5, this.leftClaw.displayHeight / 5.5);
        this.leftClaw.body.setOffset(0, this.leftClaw.displayHeight / 20);
    
        this.rightClaw.body.setSize(this.rightClaw.displayWidth / 3.5, this.rightClaw.displayHeight / 5.5);
        this.rightClaw.body.setOffset(0, this.rightClaw.displayHeight / 20);
    
        this.clawsActive = true;

        this.scene.physics.add.overlap(this.leftClaw, this.player, (claw, player) => {
            if (!claw.active || !player.active) return;
            const dir = player.x < claw.x ? -1 : 1;
            player.takeDamage(this.damage, dir);
        });
    
        this.scene.physics.add.overlap(this.rightClaw, this.player, (claw, player) => {
            if (!claw.active || !player.active) return;
            const dir = player.x < claw.x ? -1 : 1;
            player.takeDamage(this.damage, dir);
        });
    }

    destroyClaws() {
        if (this.leftClaw) {
            this.leftClaw.destroy();
            this.leftClaw = null;
        }
        if (this.rightClaw) {
            this.rightClaw.destroy();
            this.rightClaw = null;
        }
        this.clawsActive = false;
    }
}
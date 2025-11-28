import StateMachine from '../../stateMachine/StateMachine.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossFearCooldownState from './BossFearState/BossFearCooldownState.js';

export default class BossFear extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        // Usamos el corazón como sprite principal ya que es el que tiene colisión
        super(scene, x, y, 'corazon');
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(4.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Configurar cuerpo de colisión (solo el corazón)
        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 6.5, spriteHeight / 5);
        this.body.setOffset(spriteWidth / 25, spriteHeight / 30);
        this.body.moves = false;

        // Crear partes del boss
        this.createBossParts();

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.cupSpeed = 450;

        // Cooldown entre ataques
        this.startCooldown = 2000;
        this.attackCooldown = 0;
        this.minCooldown = 1000;
        this.maxCooldown = 1500;

        // Grupos
        this.cups = scene.physics.add.group();

        // Estado de las garras
        this.clawsActive = false;
        this.leftClaw = null;
        this.rightClaw = null;

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'bossFear');
        
        // Registrar estados
        this.stateMachine.addState('xAttack', new BossFearXAttackState());
        this.stateMachine.addState('cupAttack', new BossFearCupAttackState());
        this.stateMachine.addState('cooldown', new BossFearCooldownState());
        
        // Estados disponibles por fase
        this.availableStates = ['xAttack'];
        
        // Iniciar con cooldown
        this.stateMachine.setState('cooldown');

        // Colisiones
        this.setupCollisions();

        this.attackCooldown = this.startCooldown;
        this.notdead = true;
    }

    createBossParts() {
        const cam = this.scene.cameras.main;
        
        // Crear máscara (sin colisión, arriba del centro) - CAMBIAR NOMBRE DE VARIABLE
        this.bossMask = this.scene.add.image(cam.width / 2, cam.height / 2 - 200, 'mascara');
        this.bossMask.setScale(4.3);
        this.bossMask.setDepth(6); // Por encima del jugador
        
        // Crear corazón (cuerpo principal, con colisión, en el centro)
        this.setPosition(cam.width / 2, cam.height / 2 - 50);
        this.setDepth(5); // Mismo nivel que jugador
        
        // Las garras se crearán/destruirán durante los ataques
        this.leftClaw = null;
        this.rightClaw = null;
    }

    setupCollisions() {
        this.cupOverlap = this.scene.physics.add.overlap(
            this.cups,
            this.player,
            this.cupCollisionWithPlayer,
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

    cupCollisionWithPlayer(player, cup) {
        if (!cup.active || !player.active) return;
        const dir = player.x < cup.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        cup.destroy();
    }

    update(time, delta) {
        if (this.notdead) {
            this.stateMachine.step(time, delta);
        }
        
        // Actualizar posición de la máscara para que siga al corazón
        this.bossMask.setPosition(this.x, this.y - 200);
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0xff0000);
        this.bossMask.setTint(0xff0000);
        
        // Parpadeo durante el daño
        this.scene.tweens.add({
            targets: [this, this.bossMask],
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                this.bossMask.clearTint();
                this.setAlpha(1);
                this.bossMask.setAlpha(1);
            }
        });

        if (this.health <= 0) this.nextPhase();
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('BossFear entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Añadir el ataque de vasos
            this.availableStates.push('cupAttack');

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.bossMask.setVisible(false);
            
            // Ocultar garras si están activas
            if (this.leftClaw) this.leftClaw.setVisible(false);
            if (this.rightClaw) this.rightClaw.setVisible(false);
            
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);
                this.bossMask.setVisible(true);

                this.scene.tweens.add({
                    targets: [this, this.bossMask],
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
            this.bossMask.setVisible(false);
            this.die();
        }
    }

    die() {
        console.log('BossFear derrotado definitivamente');
        this.scene.time.delayedCall(2000, () => {   
            this.scene.scene.stop(); 
            this.scene.scene.launch('Win');
            this.destroy();
            this.bossMask.destroy();
            if (this.leftClaw) this.leftClaw.destroy();
            if (this.rightClaw) this.rightClaw.destroy();
        });
    }

    // Métodos para manejar garras
    createClaws() {
        const cam = this.scene.cameras.main;
    
        // Crear garras izquierda y derecha como sprites de física
        this.leftClaw = this.scene.physics.add.sprite(cam.width / 2 - 380, cam.height / 2 - 100, 'garra');
        this.rightClaw = this.scene.physics.add.sprite(cam.width / 2 + 380, cam.height / 2 - 100, 'garra');
    
        this.leftClaw.setScale(3.5);
        this.rightClaw.setScale(3.5);
        this.leftClaw.setDepth(5);
        this.rightClaw.setDepth(5);
        this.leftClaw.body.allowGravity = false;
        this.rightClaw.body.allowGravity = false;
    
        // Configurar colisiones para las garras
        this.leftClaw.body.setSize(this.leftClaw.displayWidth / 3.5, this.leftClaw.displayHeight / 5.5);
        this.leftClaw.body.setOffset(0, this.leftClaw.displayHeight / 20);
    
        this.rightClaw.body.setSize(this.rightClaw.displayWidth / 3.5, this.rightClaw.displayHeight / 5.5);
        this.rightClaw.body.setOffset(0, this.rightClaw.displayHeight / 20);
    
        this.clawsActive = true;

        // Configurar overlap para colisión con jugador - VERSIÓN SIMPLIFICADA
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
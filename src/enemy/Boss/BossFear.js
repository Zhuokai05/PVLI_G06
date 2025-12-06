import StateMachine from '../../stateMachine/StateMachine.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossFearCooldownState from './BossFearState/BossFearCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossFear extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'corazon');
        this.scene = scene;
        this.player = player;
        this.x = x;
        this.y = y;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(4.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Configurar cuerpo de colisión
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
        this.stateMachine = new StateMachine(this, 'boss');

        // Registrar estados de ataque
        this.stateMachine.addState('xAttack', new BossFearXAttackState());
        this.stateMachine.addState('cupAttack', new BossFearCupAttackState());

        // Estados disponibles por fase - FASE 1: solo xAttack
        this.availableStates = ['xAttack'];

        // Estado especial para cooldown
        this.stateMachine.addState('cooldown', new BossFearCooldownState());

        // AÑADIR ESTADO INACTIVE
        this.stateMachine.addState('inactive', {
            enter: () => {
                console.log('BossFear inactivo');
            },
            step: () => {
                // No ejecutar lógica de estado
            },
            exit: () => { }
        });

        // Iniciar en estado inactivo 
        this.stateMachine.setState('inactive');

        this.attackCooldown = this.startCooldown;
        this.notdead = true;

        this.setVisible(false);
        this.setActive(false);
        this.isActivated = false;
    }

    createBossParts() {
        // Crear máscara (sin colisión, arriba del corazón)
        this.bossMask = this.scene.add.image(this.x, this.y - 200, 'mascara');
        this.bossMask.setScale(4.3);
        this.bossMask.setDepth(6);
        this.bossMask.setVisible(false);

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
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(randomState);
    }

    selectNextState() {
        if (!this.isActivated) {
            this.stateMachine.setState('inactive');
            return;
        }
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
        if (this.bossMask && this.bossMask.visible) {
            this.bossMask.setPosition(this.x, this.y - 200);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated) return;
        
        this.health -= damage;
        this.setTint(0xff0000); // Rojo para miedo
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

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    nextPhase() {
        console.log(`BossFear fase actual: ${this.phase}, salud: ${this.health}`);
        
        if (this.phase === 1) {
            console.log('BossFear entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3; // Dar más vida para fase 2

            // FASE 2: añadir el estado cupAttack a los disponibles
            this.availableStates.push('cupAttack');
            console.log('Estados disponibles en fase 2:', this.availableStates);

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            if (this.bossMask) this.bossMask.setVisible(false);
            
            // Ocultar garras si están activas
            if (this.leftClaw) this.leftClaw.setVisible(false);
            if (this.rightClaw) this.rightClaw.setVisible(false);

            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0); // Rojo para miedo

            // DEBUG: Añadir texto para verificar
            this.scene.add.text(400, 300, 'FASE 2', { 
                fontSize: '48px', 
                fill: '#ff5555',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossFear para fase 2');
                
                this.setActive(true);
                this.setVisible(true);
                if (this.bossMask) this.bossMask.setVisible(true);
                
                // Volver a la posición original
                this.setX(this.x);
                this.setY(this.y);

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: [this, this.bossMask],
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
                
                console.log('BossFear fase 2 activado y listo para atacar');
            });
        } else {
            console.log('BossFear derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            if (this.bossMask) this.bossMask.setVisible(false);
            this.die();
        }
    }

    // Métodos para manejar garras
    createClaws() {
        // Crear garras izquierda y derecha como sprites de física
        this.leftClaw = this.scene.physics.add.sprite(this.x - 380, this.y - 50, 'garra');
        this.rightClaw = this.scene.physics.add.sprite(this.x + 380, this.y - 50, 'garra');

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

        // Configurar overlap para colisión con jugador
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

    die() {
        console.log('BossFear muere');
        
        // Asegúrate de que las puertas y pisos existen
        if (this.Bossdoors) {
            console.log('Abriendo puertas del BossFear');
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }
       
        if (this.floors) {
            console.log('Abriendo pisos del BossFear');
            this.floors.getChildren().forEach(floor => {
                if (floor.abrirPuerta) {
                    floor.abrirPuerta();
                }
            });
        }
       
        PlayerDataManager.killBoss('fear');
        this.scene.events.emit('bossDefeated');
        
        console.log('BossFear eliminado del registro');
    }
    
    getDoors(doors, floors) { 
        this.Bossdoors = doors;
        this.floors = floors;
        console.log('Puertas y pisos asignados a BossFear');
    }
    
    setLife() {
        console.log('Activando BossFear');
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;
        
        if (this.bossMask) {
            this.bossMask.setVisible(true);
        }
        
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
        
        console.log('BossFear activado, vida:', this.health);
    }
}
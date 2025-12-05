import StateMachine from '../../stateMachine/StateMachine.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import BossSadCooldownState from './BossSadState/BossSadCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossSad extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tristeza'); 
        this.scene = scene;
        this.player = player;
        this.x = x;
        this.y = y;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(3.8);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

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

        // AÑADIR ESTADO INACTIVE
        this.stateMachine.addState('inactive', {
            enter: () => {
                console.log('BossSad inactivo');
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
        if (!this.isActivated) return;
        
        this.health -= damage;
        this.setTint(0x0000ff); // Azul para tristeza
        
        // Efecto de parpadeo cuando recibe daño
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

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    nextPhase() {
        console.log(`BossSad fase actual: ${this.phase}, salud: ${this.health}`);
        
        if (this.phase === 1) {
            console.log('BossSad entra en FASE 2');
            this.phase = 2;
            this.health = this.maxHealth + 3; // Dar más vida para fase 2

            // FASE 2: añadir el estado icicle a los disponibles
            this.availableStates.push('icicle');
            console.log('Estados disponibles en fase 2:', this.availableStates);

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 50, 50, 255); // Azul para tristeza

            // DEBUG: Añadir texto para verificar
            this.scene.add.text(400, 300, 'FASE 2', { 
                fontSize: '48px', 
                fill: '#00ffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossSad para fase 2');
                
                this.setActive(true);
                this.setVisible(true);
                
                // Volver a la posición original
                this.setX(this.x);
                this.setY(this.y);

                // Asegurar que el cuerpo de física esté configurado
                const spriteWidth = this.displayWidth;
                const spriteHeight = this.displayHeight;
                this.body.setSize(spriteWidth / 35, spriteHeight / 35);
                this.body.setOffset(spriteWidth / 8.9, spriteHeight / 12);

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                //this.setupCollisions();

                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
                
                console.log('BossSad fase 2 activado y listo para atacar');
            });
        } else {
            console.log('BossSad derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }

    destroyWaterBall(waterBall) {
        if (waterBall && waterBall.active) {
            waterBall.destroy();
        }
    }

    die() {
        console.log('BossSad muere');
        
        // Asegúrate de que las puertas y pisos existen
        if (this.Bossdoors) {
            console.log('Abriendo puertas del BossSad');
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }
       
        if (this.floors) {
            console.log('Abriendo pisos del BossSad');
            this.floors.getChildren().forEach(floor => {
                if (floor.abrirPuerta) {
                    floor.abrirPuerta();
                }
            });
        }
       
        PlayerDataManager.killBoss('sadness');
        this.scene.events.emit('bossDefeated');
        
        console.log('BossSad eliminado del registro');
    }
    
    getDoors(iceDoors, iceFloors) { 
        this.Bossdoors = iceDoors;
        this.floors = iceFloors;
        console.log('Puertas y pisos asignados a BossSad');
    }
    
    setLife() {
        console.log('Activando BossSad');
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;
        
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
        
        console.log('BossSad activado, vida:', this.health);
    }
}
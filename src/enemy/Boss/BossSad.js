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

        this.distanceToFloor = 250;

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;
        this.damage = 1;
        this.icicleSpeed = 900;
        this.waterBallSpeed = 200;
        this.radialSpeed = 400; 

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
        // Configurar overlaps solo si no existen ya
        if (!this.icicleOverlap) {
            this.icicleOverlap = this.scene.physics.add.overlap(
                this.icicles,
                this.player,
                this.icicleCollisionWithPlayer,
                null,
                this
            );
        }
        
        if (!this.waterBallOverlap) {
            this.waterBallOverlap = this.scene.physics.add.overlap(
                this.waterBalls,
                this.player,
                this.waterBallCollisionWithPlayer,
                null,
                this
            );
        }
        
        if (!this.radialIcicleOverlap) {
            this.radialIcicleOverlap = this.scene.physics.add.overlap(
                this.radialIcicles,
                this.player,
                this.radialIcicleCollisionWithPlayer,
                null,
                this
            );
        }
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
        if (this.notdead && this.isActivated) { // Solo actualizar si está vivo y activado
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return; // No recibir daño si no está activado o ya está muerto

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
            
            // LIMPIAR WARNINGS ANTES DE LA TRANSICIÓN
            this.cleanupAllWarnings();
            this.clearActiveAttackObjects();
            
            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

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

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossSad para fase 2');

                this.setActive(true);
                this.setVisible(true);

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Asegurar que las colisiones estén configuradas
                this.setupCollisions();

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

        // IMPORTANTE: Limpiar todos los warnings y estados activos
        this.cleanupAllWarnings();
        
        // Desactivar el estado actual si existe
        if (this.stateMachine && this.stateMachine.currentState && 
            this.stateMachine.currentState.exit) {
            this.stateMachine.currentState.exit(this);
        }
        
        // Cambiar a estado inactivo
        if (this.stateMachine) {
            this.stateMachine.setState('inactive');
        }

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

        // Desactivar físicas
        this.setActive(false);
        this.setVisible(false);
        
        // IMPORTANTE: Destruir todos los objetos de ataque
        this.destroyAllAttackObjects();
        
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
    
    // NUEVOS MÉTODOS PARA LIMPIAR WARNINGS
    cleanupAllWarnings() {
        // Si hay un estado actual activo, llamar a su método de limpieza
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;
            
            // Llamar a métodos específicos de limpieza si existen
            if (typeof currentState.destroyAllWarnings === 'function') {
                currentState.destroyAllWarnings();
            }
            
            // También intentar limpiar warnings directamente
            if (currentState.warningRect && currentState.warningRect.destroy) {
                currentState.warningRect.destroy();
            }
            if (currentState.warningCircle && currentState.warningCircle.destroy) {
                currentState.warningCircle.destroy();
            }
            if (currentState.warningBorder && currentState.warningBorder.destroy) {
                currentState.warningBorder.destroy();
            }
            if (currentState.waterBall && currentState.waterBall.destroy) {
                currentState.waterBall.destroy();
            }
        }
    }
    
    clearActiveAttackObjects() {
        // Solo limpiar objetos activos, mantener los grupos
        if (this.icicles) {
            this.icicles.clear(true, true);
        }
        
        if (this.waterBalls) {
            this.waterBalls.clear(true, true);
        }
        
        if (this.radialIcicles) {
            this.radialIcicles.clear(true, true);
        }
    }
    
    destroyAllAttackObjects() {
        // Destruir todos los objetos activos
        this.clearActiveAttackObjects();
        
        // Desactivar overlaps solo cuando muere definitivamente
        this.removeAllColliders();
    }
    
    removeAllColliders() {
        // Solo eliminar overlaps cuando el boss muere definitivamente
        if (this.icicleOverlap) {
            this.scene.physics.world.removeCollider(this.icicleOverlap);
            this.icicleOverlap = null;
        }
        if (this.waterBallOverlap) {
            this.scene.physics.world.removeCollider(this.waterBallOverlap);
            this.waterBallOverlap = null;
        }
        if (this.radialIcicleOverlap) {
            this.scene.physics.world.removeCollider(this.radialIcicleOverlap);
            this.radialIcicleOverlap = null;
        }
    }
}
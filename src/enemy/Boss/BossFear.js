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
        this.startCooldown = 3000;
        this.attackCooldown = 0;
        this.minCooldown = 1500;
        this.maxCooldown = 2500;

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

        // Estado inactivo (igual que en ira)
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

        // Similar a ira: empezar invisible/inactivo
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
    }

    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.cupOverlap) {
            this.cupOverlap = this.scene.physics.add.overlap(
                this.cups,
                this.player,
                this.cupCollisionWithPlayer,
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

    cupCollisionWithPlayer(player, cup) {
        if (!cup.active || !player.active) return;
        const dir = player.x < cup.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        cup.destroy();
    }

    update(time, delta) {
        if (this.notdead && this.isActivated) { // Solo actualizar si está vivo y activado
            this.stateMachine.step(time, delta);
        }

        // Actualizar posición de la máscara para que siga al corazón
        if (this.bossMask && this.bossMask.visible) {
            this.bossMask.setPosition(this.x, this.y - 200);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return; // No recibir daño si no está activado o ya está muerto

        this.health -= damage;
        // Tint rojo similar a ira pero sin animación
        this.setTint(0xff0000);
        if (this.bossMask) this.bossMask.setTint(0xff0000);

        // Parpadeo durante el daño (igual que ira)
        this.scene.tweens.add({
            targets: [this, this.bossMask],
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.clearTint();
                if (this.bossMask) this.bossMask.clearTint();
                this.setAlpha(1);
                if (this.bossMask) this.bossMask.setAlpha(1);
            }
        });

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    nextPhase() {
        if (this.phase === 1) {
            console.log('BossFear entra en FASE 2');
            
            // LIMPIAR WARNINGS ANTES DE LA TRANSICIÓN
            this.cleanupAllWarnings();
            this.clearActiveAttackObjects();
            
            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

            this.phase = 2;
            this.health = this.maxHealth + 3;

            // Añadir el estado cupAttack a los disponibles (similar a punchPlatform en ira)
            this.availableStates.push('cupAttack');

            // Efecto visual y pausa (similar a ira)
            this.setActive(false);
            this.setVisible(false);
            if (this.bossMask) this.bossMask.setVisible(false);

            // Ocultar garras si están activas
            if (this.leftClaw) this.leftClaw.setVisible(false);
            if (this.rightClaw) this.rightClaw.setVisible(false);

            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 0);

            // Esperar y revivir (igual que ira)
            this.scene.time.delayedCall(2000, () => {
                this.setActive(true);
                this.setVisible(true);
                if (this.bossMask) this.bossMask.setVisible(true);

                // Efecto de aparición
                this.scene.tweens.add({
                    targets: [this, this.bossMask],
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });

                // Asegurar que las colisiones estén configuradas
                this.setupCollisions();

                // Iniciar cooldown antes del primer ataque (igual que ira)
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            this.notdead = false;
            this.setVisible(false);
            if (this.bossMask) this.bossMask.setVisible(false);
            this.die();
        }
    }

    // Métodos para manejar garras (específicos de miedo)
    createClaws() {
        // Crear garras izquierda y derecha usando coordenadas del mundo
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

        console.log(`Garras creadas en: left(${this.leftClaw.x}, ${this.leftClaw.y}), right(${this.rightClaw.x}, ${this.rightClaw.y})`);
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
        console.log('BossFear derrotado definitivamente');

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

        // Similar a ira: abrir puertas
        if (this.Bossdoors) {
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }

        // Similar a ira: registrar muerte
        PlayerDataManager.killBoss('fear');
        this.scene.events.emit('bossDefeated');

        // Desactivar físicas
        this.setActive(false);
        this.setVisible(false);
        
        // IMPORTANTE: Destruir todos los objetos de ataque
        this.destroyAllAttackObjects();
    }

    getDoors(doors) {
        this.Bossdoors = doors;
    }

    setLife() {
        // Similar a ira: activar el boss
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;

        if (this.bossMask) {
            this.bossMask.setVisible(true);
        }

        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque (igual que ira)
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
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
            if (currentState.leftWarning && currentState.leftWarning.destroy) {
                currentState.leftWarning.destroy();
            }
            if (currentState.rightWarning && currentState.rightWarning.destroy) {
                currentState.rightWarning.destroy();
            }
            
            // Limpiar garras si existen
            this.destroyClaws();
        }
    }
    
    clearActiveAttackObjects() {
        // Solo limpiar objetos activos, mantener los grupos
        if (this.cups) {
            this.cups.clear(true, true);
        }
        
        // Limpiar garras
        this.destroyClaws();
    }
    
    destroyAllAttackObjects() {
        // Destruir todos los objetos activos
        this.clearActiveAttackObjects();
        
        // Desactivar overlaps solo cuando muere definitivamente
        this.removeAllColliders();
    }
    
    removeAllColliders() {
        // Solo eliminar overlaps cuando el boss muere definitivamente
        if (this.cupOverlap) {
            this.scene.physics.world.removeCollider(this.cupOverlap);
            this.cupOverlap = null;
        }
    }
}
import StateMachine from '../../stateMachine/StateMachine.js';
import BossTutorialSideAttackState from './BossTutorialState/BossTutorialSideAttackState.js';
import BossTutorialJumpAttackState from './BossTutorialState/BossTutorialJumpAttackState.js';
import BossTutorialCooldownState from './BossTutorialState/BossTutorialCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossTutorial extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tutorial');
        this.scene = scene;
        this.player = player;
        this.x = x;
        this.y = y;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Escala y colisiones
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Ajustes del body
        const spriteW = this.displayWidth;
        const spriteH = this.displayHeight;
        this.body.setSize(spriteW * 0.45, spriteH * 0.4);
        this.body.setOffset(0, spriteH * 0.05);
        this.body.moves = false;

        // Stats
        this.phase = 1;
        this.health = 6;
        this.maxHealth = 6;
        this.damage = 1;

        // Cooldown entre ataques
        this.startCooldown = 3000;
        this.attackCooldown = 0;
        this.minCooldown = 3000;
        this.maxCooldown = 3000;

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'bossTutorial');

        // Registrar todos los estados
        this.stateMachine.addState('sideAttack', new BossTutorialSideAttackState());
        this.stateMachine.addState('jumpAttack', new BossTutorialJumpAttackState());

        // Estados disponibles por fase - FASE 1: solo sideAttack
        this.availableStates = ['sideAttack'];

        // Estado especial para cooldown
        this.stateMachine.addState('cooldown', new BossTutorialCooldownState());

        // AÑADIR ESTADO INACTIVE
        this.stateMachine.addState('inactive', {
            enter: () => {
                console.log('BossTutorial inactivo');
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

        // Flag para saber si golpeó al player durante un sweep
        this._hitPlayerThisSweep = false;
    }

    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.bossPlayerOverlap) {
            this.bossPlayerOverlap = this.scene.physics.add.overlap(
                this,
                this.player,
                this.onHitPlayer,
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

    // Maneja colisión directa boss <-> player
    onHitPlayer(boss, player) {
        if (!boss.active || !player.active) return;
        // evitar múltiples triggers muy seguidos
        if (player._recentlyHitByBoss) return;

        // Marca que el boss ha alcanzado al player en este sweep
        this._hitPlayerThisSweep = true;

        // Estrella de dirección para knockback
        const dir = (player.x < boss.x) ? -1 : 1;
        player.takeDamage(this.damage, dir);

        // Pequeño cooldown en el player para evitar daño repetido instantáneo
        player._recentlyHitByBoss = true;
        this.scene.time.delayedCall(300, () => {
            if (player) player._recentlyHitByBoss = false;
        });
    }

    update(time, delta) {
        if (this.notdead && this.isActivated) { // Solo actualizar si está vivo y activado
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return; // No recibir daño si no está activado o ya está muerto

        this.health -= damage;
        this.setTint(0xff0000); // Rojo para tutorial

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
        console.log(`BossTutorial fase actual: ${this.phase}, salud: ${this.health}`);

        if (this.phase === 1) {
            console.log('BossTutorial entra en FASE 2');
            
            // LIMPIAR WARNINGS ANTES DE LA TRANSICIÓN
            this.cleanupAllWarnings();
            
            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

            this.phase = 2;
            this.health = this.maxHealth + 3; // Dar más vida para fase 2

            // FASE 2: añadir el estado jumpAttack a los disponibles
            this.availableStates.push('jumpAttack');
            console.log('Estados disponibles en fase 2:', this.availableStates);

            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            this.scene.cameras.main.shake(600, 0.02);
            this.scene.cameras.main.flash(500, 255, 50, 50); // Rojo para tutorial

            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossTutorial para fase 2');

                this.setActive(true);
                this.setVisible(true);
                this.isActivated = true;

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

                console.log('BossTutorial fase 2 activado y listo para atacar');
            });
        } else {
            console.log('BossTutorial derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }

    die() {
        console.log('BossTutorial muere');

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

        // Desactivar completamente el cuerpo de física
        if (this.body) {
            this.body.enable = false; // Desactivar el cuerpo de física
            this.body.checkCollision.none = true; // Desactivar todas las colisiones
        }

        // Desactivar el sprite
        this.setVisible(false);
        this.setActive(false);

        // Asegúrate de que las puertas existen
        if (this.Bossdoors) {
            console.log('Abriendo puertas del BossTutorial');
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }

        PlayerDataManager.killBoss('tutorial');
        this.scene.events.emit('bossDefeated');

        // Destruir todos los objetos de ataque
        this.destroyAllAttackObjects();
        
        console.log('BossTutorial eliminado del registro');
    }

    getDoors(tutorialDoors) {
        this.Bossdoors = tutorialDoors;
        console.log('Puertas asignadas a BossTutorial');
    }

    setLife() {
        console.log('Activando BossTutorial');
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true;

        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');

        console.log('BossTutorial activado, vida:', this.health);
    }
    
    //PARA LIMPIAR WARNINGS
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
            
            // Detener tweens si existen
            if (currentState.tween && currentState.tween.stop) {
                currentState.tween.stop();
            }
        }
    }
    
    destroyAllAttackObjects() {
        // Desactivar overlaps solo cuando muere definitivamente
        this.removeAllColliders();
    }
    
    removeAllColliders() {
        // Solo eliminar overlaps cuando el boss muere definitivamente
        if (this.bossPlayerOverlap) {
            this.scene.physics.world.removeCollider(this.bossPlayerOverlap);
            this.bossPlayerOverlap = null;
        }
    }
}
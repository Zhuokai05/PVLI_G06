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

        this.phase = 1;
        this.health = 1;
        this.maxHealth = 1;
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

        // AÑADIR ESTADO INACTIVE
        this.stateMachine.addState('inactive', {
            enter: () => {
                console.log('FinalBoss inactivo');
            },
            step: () => {
                // No ejecutar lógica de estado
            },
            exit: () => { }
        });

        this.allStates = [
            'fireball', 'punch', 'punchPlatform',
            'xAttack', 'cupAttack',
            'icicle', 'radial', 'waterball'
        ];

        // Fase 1 
        this.availableStates = this.selectRandomStates(3);
        console.log('FinalBoss Fase 1 - Ataques:', this.availableStates);

        this.attackCooldown = this.startCooldown;
        this.notdead = true;

        // Iniciar en estado inactivo
        this.stateMachine.setState('inactive');

        this.setVisible(false);
        this.setActive(false);
        this.isActivated = false;
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
        // Configurar overlaps solo si no existen ya
        if (!this.fireballOverlap) {
            this.fireballOverlap = this.scene.physics.add.overlap(
                this.fireballs,
                this.player,
                this.fireballCollisionWithPlayer,
                null,
                this
            );
        }

        if (!this.punchOverlap) {
            this.punchOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.player,
                this.punchCollisionWithPlayer,
                null,
                this
            );
        }

        if (!this.cupOverlap) {
            this.cupOverlap = this.scene.physics.add.overlap(
                this.cups,
                this.player,
                this.cupCollisionWithPlayer,
                null,
                this
            );
        }

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
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        console.log('FinalBoss ejecutando:', randomState);
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

    update(time, delta) {
        if (this.notdead && this.isActivated) { // Solo actualizar si está vivo y activado
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        if (!this.isActivated || !this.notdead) return; // No recibir daño si no está activado o ya está muerto

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

            // LIMPIAR WARNINGS ANTES DE LA TRANSICIÓN
            this.cleanupAllWarnings();
            this.clearActiveAttackObjects();

            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }

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

                // Asegurar que las colisiones estén configuradas
                this.setupCollisions();

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

        this.scene.cameras.main.shake(2000, 0.05);
        this.scene.cameras.main.flash(1500, 255, 215, 0);

        if (this.leftClaw) this.leftClaw.destroy();
        if (this.rightClaw) this.rightClaw.destroy();

        if (this.Bossdoors) {
            this.Bossdoors.getChildren().forEach(door => {
                if (door.abrirPuerta) {
                    door.abrirPuerta();
                }
            });
        }

        // IMPORTANTE: Destruir todos los objetos de ataque
        this.destroyAllAttackObjects();

        this.scene.time.delayedCall(5000, () => {
            this.scene.scene.stop();
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }

    createClaws() {
        // Usar coordenadas del mundo 
        this.leftClaw = this.scene.physics.add.sprite(this.x - 380, this.y - 50, 'garra');
        this.rightClaw = this.scene.physics.add.sprite(this.x + 380, this.y - 50, 'garra');

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

        console.log(`FinalBoss: Garras creadas en mundo - left(${this.leftClaw.x}, ${this.leftClaw.y}), right(${this.rightClaw.x}, ${this.rightClaw.y})`);
        console.log(`Posición del boss: (${this.x}, ${this.y})`);

        // AÑADIR ESTAS COLISIONES - FALTANTES EN TU CÓDIGO
        this.setupClawCollisions();
    }

    setupClawCollisions() {
        // Configurar colisiones para las garras con el jugador
        if (this.leftClaw) {
            this.leftClawOverlap = this.scene.physics.add.overlap(
                this.leftClaw,
                this.player,
                (claw, player) => {
                    this.onClawHitPlayer(claw, player);
                },
                null,
                this
            );
        }

        if (this.rightClaw) {
            this.rightClawOverlap = this.scene.physics.add.overlap(
                this.rightClaw,
                this.player,
                (claw, player) => {
                    this.onClawHitPlayer(claw, player);
                },
                null,
                this
            );
        }
    }

    // Método para manejar colisión de garra con jugador
    onClawHitPlayer(claw, player) {
        if (!claw.active || !player.active) return;

        // Evitar múltiples golpes muy seguidos
        if (player._recentlyHitByClaw) return;

        const dir = player.x < claw.x ? -1 : 1;
        player.takeDamage(this.damage, dir);

        // Pequeño cooldown para evitar daño repetido
        player._recentlyHitByClaw = true;
        this.scene.time.delayedCall(300, () => {
            if (player) player._recentlyHitByClaw = false;
        });
    }

    destroyClaws() {
        // Limpiar colisiones de garras primero
        if (this.leftClawOverlap) {
            this.scene.physics.world.removeCollider(this.leftClawOverlap);
            this.leftClawOverlap = null;
        }

        if (this.rightClawOverlap) {
            this.scene.physics.world.removeCollider(this.rightClawOverlap);
            this.rightClawOverlap = null;
        }

        // Destruir las garras
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
    getDoors(iraDoors) {
        this.Bossdoors = iraDoors;
    }

    setLife() {
        this.setVisible(true);
        this.setActive(true);
        this.isActivated = true; // Activar el boss
        this.setupCollisions();

        // Iniciar cooldown antes del primer ataque
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
            // Para estados de BossAngry
            if (currentState.warningRect && currentState.warningRect.destroy) {
                currentState.warningRect.destroy();
            }
            if (currentState.warningBorder && currentState.warningBorder.destroy) {
                currentState.warningBorder.destroy();
            }
            if (currentState.warningText && currentState.warningText.destroy) {
                currentState.warningText.destroy();
            }
            if (currentState.arrows) {
                currentState.arrows.forEach(arrow => {
                    if (arrow && arrow.destroy) arrow.destroy();
                });
            }

            // Para estados de BossSad
            if (currentState.warningCircle && currentState.warningCircle.destroy) {
                currentState.warningCircle.destroy();
            }

            // Para estados de BossFear
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
        if (this.fireballs) {
            this.fireballs.clear(true, true);
        }

        if (this.punches) {
            this.punches.clear(true, true);
        }

        if (this.cups) {
            this.cups.clear(true, true);
        }

        if (this.icicles) {
            this.icicles.clear(true, true);
        }

        if (this.waterBalls) {
            this.waterBalls.clear(true, true);
        }

        if (this.radialIcicles) {
            this.radialIcicles.clear(true, true);
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
        if (this.fireballOverlap) {
            this.scene.physics.world.removeCollider(this.fireballOverlap);
            this.fireballOverlap = null;
        }
        if (this.punchOverlap) {
            this.scene.physics.world.removeCollider(this.punchOverlap);
            this.punchOverlap = null;
        }
        if (this.cupOverlap) {
            this.scene.physics.world.removeCollider(this.cupOverlap);
            this.cupOverlap = null;
        }
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
        if (this.leftClawOverlap) {
            this.scene.physics.world.removeCollider(this.leftClawOverlap);
            this.leftClawOverlap = null;
        }
        if (this.rightClawOverlap) {
            this.scene.physics.world.removeCollider(this.rightClawOverlap);
            this.rightClawOverlap = null;
        }
    }
}
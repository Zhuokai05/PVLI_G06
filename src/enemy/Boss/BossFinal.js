import BaseBoss from './BaseBoss/BaseBoss.js';
import BossAngryFireBallState from './BossAngryState/BossAngryFireBallState.js';
import BossAngryPunchState from './BossAngryState/BossAngryPunchState.js';
import BossAngryPunchPlatformState from './BossAngryState/BossAngryPunchPlatformState.js';
import BossFearXAttackState from './BossFearState/BossFearXAttackState.js';
import BossFearCupAttackState from './BossFearState/BossFearCupAttackState.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import FinalBossCooldownState from './BossFinalState/BossFinalCooldownState.js';

export default class FinalBoss extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 1,
            maxHealth: 1,
            damage: 1,
            startCooldown: 1500,
            minCooldown: 800,
            maxCooldown: 1000,
            availableStates: []
        };
        
        super(scene, x, y, 'final', undefined, player, config);
        
        this.x = x;
        this.y = y;
        
        // Configuración específica de FinalBoss
        this.setFinalBody();
        
        // Velocidades de ataques (combinación de todos los bosses)
        this.fireballSpeed = 450;
        this.punchYSpeed = 1000;
        this.punchXSpeed = 600;
        this.cupSpeed = 450;
        this.icicleSpeed = 450;
        this.waterBallSpeed = 200;
        
        // DISTANCIA AL PISO - ¡ESTO ES IMPORTANTE!
        this.distanceToFloor = 250; // Añadir esta propiedad
        
        // Estado de las garras
        this.clawsActive = false;
        this.leftClaw = null;
        this.rightClaw = null;
        
        // Inicializar todos los grupos de ataque
        this.initAllAttackGroups();
        
        // Configurar estados específicos
        this.setupStates();
        
        // Definir todos los estados posibles
        this.allStates = [
            'fireball', 'punch', 'punchPlatform',
            'xAttack', 'cupAttack',
            'icicle', 'radial', 'waterball'
        ];
        
        // Fase 1: seleccionar 3 ataques aleatorios
        this.availableStates = this.selectRandomStates(3);
        console.log('FinalBoss Fase 1 - Ataques:', this.availableStates); 
        this.play('Final')
    }
    
    setFinalBody() {
        this.setScale(2.5);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        
        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 18, spriteHeight / 18);
        this.body.setOffset(spriteWidth / 6, spriteHeight / 6.5);
        this.body.moves = false;
    }
    
    initAllAttackGroups() {
        // Inicializar todos los grupos de ataque de todos los bosses
        this.fireballs = this.scene.physics.add.group();
        this.punches = this.scene.physics.add.group();
        this.cups = this.scene.physics.add.group();
        this.icicles = this.scene.physics.add.group();
        this.waterBalls = this.scene.physics.add.group();
        this.radialIcicles = this.scene.physics.add.group();
        
        // Registrar todos los grupos
        this.addAttackGroup('fireballs', this.fireballs);
        this.addAttackGroup('punches', this.punches);
        this.addAttackGroup('cups', this.cups);
        this.addAttackGroup('icicles', this.icicles);
        this.addAttackGroup('waterBalls', this.waterBalls);
        this.addAttackGroup('radialIcicles', this.radialIcicles);
    }
    
    setupStates() {
        // Registrar todos los estados de todos los bosses
        // IMPORTANTE: Pasar las texturas correctas para FinalBoss
        this.addState('fireball', new BossAngryFireBallState('ffire_ball'));
        this.addState('punch', new BossAngryPunchState('fpunch'));
        this.addState('punchPlatform', new BossAngryPunchPlatformState('fpunch'));
        this.addState('xAttack', new BossFearXAttackState());
        this.addState('cupAttack', new BossFearCupAttackState('fvaso'));
        this.addState('icicle', new BossSadIcicleState('ficicle'));
        this.addState('radial', new BossSadRadialState('ficicle'));
        this.addState('waterball', new BossSadWaterBallState('fwater_ball'));
        this.addState('cooldown', new FinalBossCooldownState());
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
        // Configurar todas las colisiones de todos los tipos de ataque
        this.setupFireballCollision();
        this.setupPunchCollision();
        this.setupCupCollision();
        this.setupIcicleCollision();
        this.setupWaterBallCollision();
        this.setupRadialIcicleCollision();
    }
    
    setupFireballCollision() {
        if (!this.colliders.fireballOverlap) {
            const fireballOverlap = this.scene.physics.add.overlap(
                this.fireballs,
                this.player,
                this.fireballCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('fireballOverlap', fireballOverlap);
        }
    }
    
    setupPunchCollision() {
        if (!this.colliders.punchOverlap) {
            const punchOverlap = this.scene.physics.add.overlap(
                this.punches,
                this.player,
                this.punchCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('punchOverlap', punchOverlap);
        }
    }
    
    setupCupCollision() {
        if (!this.colliders.cupOverlap) {
            const cupOverlap = this.scene.physics.add.overlap(
                this.cups,
                this.player,
                this.cupCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('cupOverlap', cupOverlap);
        }
    }
    
    setupIcicleCollision() {
        if (!this.colliders.icicleOverlap) {
            const icicleOverlap = this.scene.physics.add.overlap(
                this.icicles,
                this.player,
                this.icicleCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('icicleOverlap', icicleOverlap);
        }
    }
    
    setupWaterBallCollision() {
        if (!this.colliders.waterBallOverlap) {
            const waterBallOverlap = this.scene.physics.add.overlap(
                this.waterBalls,
                this.player,
                this.waterBallCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('waterBallOverlap', waterBallOverlap);
        }
    }
    
    setupRadialIcicleCollision() {
        if (!this.colliders.radialIcicleOverlap) {
            const radialIcicleOverlap = this.scene.physics.add.overlap(
                this.radialIcicles,
                this.player,
                this.radialIcicleCollisionWithPlayer,
                null,
                this
            );
            this.registerCollider('radialIcicleOverlap', radialIcicleOverlap);
        }
    }
    
    // Métodos de colisión
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
    
    // Sobrescribir startRandomState para logging
    startRandomState() {
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        console.log('FinalBoss ejecutando:', randomState);
        this.stateMachine.setState(randomState);
    }
    
    getDamageTintColor() {
        return 0xff00ff; // Magenta para FinalBoss
    }
    
    nextPhase() {
        if (this.phase === 1) {
            console.log('FinalBoss entra en FASE 2 - ¡TODOS LOS ATAQUES DESBLOQUEADOS!');
            
            // Limpiar antes de la transición
            this.cleanupAllWarnings();
            this.destroyAllAttackObjects();
            
            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }
            
            this.phase = 2;
            this.health = this.maxHealth + 5;
            
            // Fase 2: todos los ataques disponibles
            this.availableStates = [...this.allStates];
            console.log('FinalBoss Fase 2 - Ataques:', this.availableStates);
            
            // Cooldowns más rápidos en fase 2
            this.minCooldown = 600;
            this.maxCooldown = 1000;
            
            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            
            // Ocultar garras
            this.destroyClaws();
            
            this.scene.cameras.main.shake(1200, 0.03);
            this.scene.cameras.main.flash(800, 255, 0, 255);
            
            // Esperar y revivir
            this.scene.time.delayedCall(2500, () => {
                this.setActive(true);
                this.setVisible(true);
                this.isActivated = true;
                
                // CORRECCIÓN: Restablecer todas las colisiones
                this.resetAllCollisions();
                
                // Efecto de aparición
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Sine.easeInOut'
                });
                
                // Iniciar cooldown antes del primer ataque
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            console.log('FinalBoss derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }
    
    die() {
        console.log('¡FinalBoss DERROTADO! ¡VICTORIA TOTAL!');
        
        // Efectos especiales de victoria
        this.scene.cameras.main.shake(2000, 0.05);
        this.scene.cameras.main.flash(1500, 255, 215, 0);
        
        // Llama al método die de BaseBoss
        super.die();
        
        // Transición a pantalla de victoria
        this.scene.time.delayedCall(5000, () => {
            this.scene.scene.stop();
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }
    
    // Métodos específicos para garras
    createClaws() {
        // Crear garras usando coordenadas del mundo
        this.leftClaw = this.scene.physics.add.sprite(this.x - 380, this.y - 50, 'fgarra');
        this.rightClaw = this.scene.physics.add.sprite(this.x + 380, this.y - 50, 'fgarra');
        
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
        
        // Configurar colisiones de garras
        this.setupClawCollisions();
    }
    
    setupClawCollisions() {
        // Configurar colisiones para las garras con el jugador
        if (this.leftClaw && !this.colliders.leftClawOverlap) {
            const leftClawOverlap = this.scene.physics.add.overlap(
                this.leftClaw,
                this.player,
                (claw, player) => {
                    this.onClawHitPlayer(claw, player);
                },
                null,
                this
            );
            this.registerCollider('leftClawOverlap', leftClawOverlap);
        }
        
        if (this.rightClaw && !this.colliders.rightClawOverlap) {
            const rightClawOverlap = this.scene.physics.add.overlap(
                this.rightClaw,
                this.player,
                (claw, player) => {
                    this.onClawHitPlayer(claw, player);
                },
                null,
                this
            );
            this.registerCollider('rightClawOverlap', rightClawOverlap);
        }
    }
    
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
        // Limpiar colisiones de garras
        if (this.colliders.leftClawOverlap) {
            this.scene.physics.world.removeCollider(this.colliders.leftClawOverlap);
            this.colliders.leftClawOverlap = null;
        }
        
        if (this.colliders.rightClawOverlap) {
            this.scene.physics.world.removeCollider(this.colliders.rightClawOverlap);
            this.colliders.rightClawOverlap = null;
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
    
    // Método específico para asignar puertas
    getDoors(iraDoors) {
        this.Bossdoors = iraDoors;
    }
    
    // Métodos específicos para limpieza de advertencias de FinalBoss
    cleanupAllWarnings() {
        // Primero llama al método base
        super.cleanupAllWarnings();
        
        // Luego añade limpieza específica para estados de FinalBoss
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;
            
            // Limpiar elementos específicos de todos los tipos de bosses
            const allBossElements = [
                'warningRect', 'warningBorder', 'warningText', 'arrows',
                'warningCircle', 'waterBall', 'leftWarning', 'rightWarning'
            ];
            
            allBossElements.forEach(element => {
                if (currentState[element] && currentState[element].destroy) {
                    currentState[element].destroy();
                }
            });
            
            // Limpiar flechas si existen
            if (currentState.arrows) {
                currentState.arrows.forEach(arrow => {
                    if (arrow && arrow.destroy) arrow.destroy();
                });
            }
            
            // Limpiar garras
            this.destroyClaws();
        }
    }
    
    // Método específico para limpiar objetos de ataque activos
    clearActiveAttackObjects() {
        // Limpiar todos los grupos de ataque
        Object.values(this.attackGroups).forEach(group => {
            if (group && group.clear) {
                group.clear(true, true);
            }
        });
        
        // Limpiar garras
        this.destroyClaws();
    }
    
    // Sobrescribir destroyAllAttackObjects para incluir limpieza específica
    destroyAllAttackObjects() {
        // Limpiar objetos activos primero
        this.clearActiveAttackObjects();
        
        // Luego llama al método base
        super.destroyAllAttackObjects();
    }
    
    // Sobrescribir removeAllColliders para añadir limpieza específica
    removeAllColliders() {
        // Llama al método base primero
        super.removeAllColliders();
        
        // Resetear referencias específicas si es necesario
        this.colliders = {};
        
        // Destruir garras
        this.destroyClaws();
    }
    
    // Sobrescribir setLife para logging
    setLife() {
        console.log('Activando FinalBoss');
        
        // Llama al método base
        super.setLife();
        
        console.log('FinalBoss activado, vida:', this.health);
    }
}
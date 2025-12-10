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

/**
 * Jefe final que combina todos los ataques de los bosses anteriores
 * @class FinalBoss
 * @extends BaseBoss
 */
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
    
    /**
     * Configura el cuerpo específico para el jefe final
     */
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

    playIntro(){
        this.setVisible(true);
        this.setActive(true);
        this.setLife();
        this.scene.events.emit('bossIntroFinished');
    }
    
    /**
     * Inicializa todos los grupos de ataque de todos los bosses
     */
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
    
    /**
     * Configura todos los estados de todos los bosses
     */
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
    
    /**
     * Selecciona estados aleatorios para el jefe final
     * @param {number} count - Número de estados a seleccionar
     * @returns {Array} - Array de estados seleccionados
     */
    selectRandomStates(count) {
        const shuffled = [...this.allStates];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }
    
    /**
     * Configura todas las colisiones de todos los tipos de ataque
     */
    setupCollisions() {
        // Configurar todas las colisiones de todos los tipos de ataque
        this.setupFireballCollision();
        this.setupPunchCollision();
        this.setupCupCollision();
        this.setupIcicleCollision();
        this.setupWaterBallCollision();
        this.setupRadialIcicleCollision();
    }
    
    /**
     * Configura las colisiones de fireball
     */
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
    
    /**
     * Configura las colisiones de puño
     */
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
    
    /**
     * Configura las colisiones de copa
     */
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
    
    /**
     * Configura las colisiones de icicle
     */
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
    
    /**
     * Configura las colisiones de water ball
     */
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
    
    /**
     * Configura las colisiones de icicle radial
     */
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
    
    /**
     * Maneja la colisión de fireball con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} fireball - Fireball
     */
    fireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }
    
    /**
     * Maneja la colisión de puño con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} punch - Puño
     */
    punchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }
    
    /**
     * Maneja la colisión de copa con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} cup - Copa
     */
    cupCollisionWithPlayer(player, cup) {
        if (!cup.active || !player.active) return;
        const dir = player.x < cup.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        cup.destroy();
    }
    
    /**
     * Maneja la colisión de icicle con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} icicle - Icicle
     */
    icicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }
    
    /**
     * Maneja la colisión de water ball con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} waterBall - Water ball
     */
    waterBallCollisionWithPlayer(player, waterBall) {
        if (!waterBall.active || !player.active) return;
        const dir = player.x < waterBall.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        waterBall.destroy();
    }
    
    /**
     * Maneja la colisión de icicle radial con el jugador
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     * @param {Phaser.GameObjects.Sprite} icicle - Icicle radial
     */
    radialIcicleCollisionWithPlayer(player, icicle) {
        if (!icicle.active || !player.active) return;
        const dir = player.x < icicle.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        icicle.destroy();
    }
    
    /**
     * Inicia un estado aleatorio con logging
     */
    startRandomState() {
        if (!this.isActivated) return;
        const randomState = Phaser.Math.RND.pick(this.availableStates);
        console.log('FinalBoss ejecutando:', randomState);
        this.stateMachine.setState(randomState);
    }
    
    /**
     * Obtiene el color del tint para el daño del jefe final
     * @returns {number} - Color magenta
     */
    getDamageTintColor() {
        return 0xff00ff; // Magenta para FinalBoss
    }
    
    /**
     * Avanza a la siguiente fase del jefe final
     */
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
    
    /**
     * Maneja la muerte definitiva del jefe final
     */
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
    
    /**
     * Crea las garras del jefe final
     */
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
    
    /**
     * Configura las colisiones de las garras
     */
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
    
    /**
     * Maneja la colisión de garra con el jugador
     * @param {Phaser.GameObjects.Sprite} claw - Garra
     * @param {Phaser.GameObjects.Sprite} player - Jugador
     */
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
    
    /**
     * Destruye las garras del jefe final
     */
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
    
    /**
     * Asigna puertas específicas para el jefe final
     * @param {Phaser.GameObjects.Group} iraDoors - Puertas de ira
     */
    getDoors(iraDoors) {
        this.Bossdoors = iraDoors;
    }
    
    /**
     * Limpia todas las advertencias visuales específicas del jefe final
     */
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
    
    /**
     * Limpia los objetos de ataque activos del jefe final
     */
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
    
    /**
     * Destruye todos los objetos de ataque específicos del jefe final
     */
    destroyAllAttackObjects() {
        // Limpiar objetos activos primero
        this.clearActiveAttackObjects();
        
        // Luego llama al método base
        super.destroyAllAttackObjects();
    }
    
    /**
     * Elimina todos los colliders específicos del jefe final
     */
    removeAllColliders() {
        // Llama al método base primero
        super.removeAllColliders();
        
        // Resetear referencias específicas si es necesario
        this.colliders = {};
        
        // Destruir garras
        this.destroyClaws();
    }
    
    /**
     * Activa el jefe final con logging
     */
    setLife() {
        console.log('Activando FinalBoss');
        
        // Llama al método base
        super.setLife();
        
        console.log('FinalBoss activado, vida:', this.health);
    }
}
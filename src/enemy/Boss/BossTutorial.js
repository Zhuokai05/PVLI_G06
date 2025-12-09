import BaseBoss from './BaseBoss.js';
import BossTutorialSideAttackState from './BossTutorialState/BossTutorialSideAttackState.js';
import BossTutorialJumpAttackState from './BossTutorialState/BossTutorialJumpAttackState.js';
import BossTutorialCooldownState from './BossTutorialState/BossTutorialCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossTutorial extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 6,
            maxHealth: 6,
            damage: 1,
            startCooldown: 3000,
            minCooldown: 3000,
            maxCooldown: 3000,
            availableStates: ['sideAttack']
        };
        
        super(scene, x, y, 'tutorial', undefined, player, config);
        
        this.x = x;
        this.y = y;
        
        // Configuración específica de BossTutorial
        this.setTutorialBody();
        
        // Flag para saber si golpeó al player durante un sweep
        this._hitPlayerThisSweep = false;
        
        // Configurar estados específicos
        this.setupStates();
    }
    
    setTutorialBody() {
        // Escala y colisiones
        this.setScale(2);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        
        // Ajustes específicos del body para tutorial
        const spriteW = this.displayWidth;
        const spriteH = this.displayHeight;
        this.body.setSize(spriteW * 0.45, spriteH * 0.4);
        this.body.setOffset(0, spriteH * 0.05);
        this.body.moves = false;
    }
    
    setupStates() {
        // Registrar estados específicos
        this.addState('sideAttack', new BossTutorialSideAttackState());
        this.addState('jumpAttack', new BossTutorialJumpAttackState());
        this.addState('cooldown', new BossTutorialCooldownState());
    }
    
    setupCollisions() {
        // Configurar overlaps solo si no existen ya
        if (!this.colliders.bossPlayerOverlap) {
            const bossPlayerOverlap = this.scene.physics.add.overlap(
                this,
                this.player,
                this.onHitPlayer,
                null,
                this
            );
            this.registerCollider('bossPlayerOverlap', bossPlayerOverlap);
        }
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
    
    getDamageTintColor() {
        return 0xff0000; // Rojo para Tutorial
    }
    
    nextPhase() {
        console.log(`BossTutorial fase actual: ${this.phase}, salud: ${this.health}`);
        
        if (this.phase === 1) {
            console.log('BossTutorial entra en FASE 2');
            
            // Limpiar antes de la transición
            this.cleanupAllWarnings();
            this.destroyAllAttackObjects();
            
            // Cambiar a estado inactivo durante la transición
            if (this.stateMachine) {
                this.stateMachine.setState('inactive');
            }
            
            this.phase = 2;
            this.health = this.maxHealth + 3;
            
            // Añadir nuevo estado en fase 2
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
                
                // CORRECCIÓN: Restablecer todas las colisiones
                this.resetAllCollisions();
                
                // Efecto de aparición
                this.scene.tweens.add({
                    targets: this,
                    alpha: { from: 0, to: 1 },
                    duration: 800,
                    ease: 'Sine.easeInOut'
                });
                
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
        
        // Desactivar completamente el cuerpo de física (específico de tutorial)
        if (this.body) {
            this.body.enable = false; // Desactivar el cuerpo de física
            this.body.checkCollision.none = true; // Desactivar todas las colisiones
        }
        
        // Llama al método die de BaseBoss
        super.die();
        
        // Completar acciones específicas de BossTutorial
        PlayerDataManager.killBoss('tutorial');
        this.scene.events.emit('bossDefeated');
        
        console.log('BossTutorial eliminado del registro');
    }
    
    // Métodos específicos para limpieza de advertencias de BossTutorial
    cleanupAllWarnings() {
        // Primero llama al método base
        super.cleanupAllWarnings();
        
        // Luego añade limpieza específica para estados de BossTutorial
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;
            
            // Detener tweens si existen
            if (currentState.tween && currentState.tween.stop) {
                currentState.tween.stop();
            }
            
            // Limpiar flag de sweep
            this._hitPlayerThisSweep = false;
        }
    }
    
    // Sobrescribir destroyAllAttackObjects (BossTutorial no tiene grupos de ataque)
    destroyAllAttackObjects() {
        // BossTutorial no tiene grupos de ataque como los otros bosses,
        // pero sí tiene colisiones directas que necesitan limpiarse
        
        // Primero limpia warnings
        this.cleanupAllWarnings();
        
        // Luego llama al método base para limpiar colisiones
        super.destroyAllAttackObjects();
    }
    
    // Método específico para resetear el flag de hit
    resetHitFlag() {
        this._hitPlayerThisSweep = false;
    }
    
    // Método específico para verificar si golpeó al player
    didHitPlayerThisSweep() {
        return this._hitPlayerThisSweep;
    }
    
    // Método específico para asignar puertas
    getDoors(tutorialDoors) {
        this.Bossdoors = tutorialDoors;
        console.log('Puertas asignadas a BossTutorial');
    }
    
    // Sobrescribir setLife si necesitas personalización adicional
    setLife() {
        console.log('Activando BossTutorial');
        
        // Resetear flag de hit
        this.resetHitFlag();
        
        // Llama al método base
        super.setLife();
        
        console.log('BossTutorial activado, vida:', this.health);
    }
    
    // Sobrescribir removeAllColliders para añadir limpieza específica
    removeAllColliders() {
        // Llama al método base primero
        super.removeAllColliders();
        
        // Resetear referencias específicas si es necesario
        this.colliders = {};
    }
}
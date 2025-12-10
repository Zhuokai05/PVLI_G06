import BaseBoss from './BaseBoss.js';
import BossSadIcicleState from './BossSadState/BossSadIcicleState.js';
import BossSadRadialState from './BossSadState/BossSadRadialState.js';
import BossSadWaterBallState from './BossSadState/BossSadWaterBallState.js';
import BossSadCooldownState from './BossSadState/BossSadCooldownState.js';
import PlayerDataManager from '../../managers/PlayerDataManager.js';

export default class BossSad extends BaseBoss {
    constructor(scene, x, y, player) {
        const config = {
            health: 10,
            maxHealth: 10,
            damage: 1,
            startCooldown: 2000,
            minCooldown: 1000,
            maxCooldown: 1500,
            availableStates: ['radial', 'waterball']
        };
        
        super(scene, x, y, 'tristeza', undefined, player, config);
        
        this.x = x;
        this.y = y;
        
        // Configuración específica de BossSad
        this.setScaleAndBody(3.8, 35, 35, 8.9, 12);
        this.distanceToFloor = 250;
        
        // Velocidades de ataques
        this.icicleSpeed = 900;
        this.waterBallSpeed = 200;
        this.radialSpeed = 400;
        
        // Inicializar grupos de ataque
        this.icicles = scene.physics.add.group();
        this.waterBalls = scene.physics.add.group();
        this.radialIcicles = scene.physics.add.group();
        
        this.addAttackGroup('icicles', this.icicles);
        this.addAttackGroup('waterBalls', this.waterBalls);
        this.addAttackGroup('radialIcicles', this.radialIcicles);
        
        // Configurar estados específicos
        this.setupStates();
    }
    
    setupStates() {
        // Registrar estados específicos
        this.addState('icicle', new BossSadIcicleState());
        this.addState('radial', new BossSadRadialState());
        this.addState('waterball', new BossSadWaterBallState());
        this.addState('cooldown', new BossSadCooldownState());
    }
    
    setupCollisions() {
        // Configurar overlaps solo si no existen ya
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
    
    getDamageTintColor() {
        return 0x0000ff; // Azul para Tristeza
    }
    
    nextPhase() {
        console.log(`BossSad fase actual: ${this.phase}, salud: ${this.health}`);
        
        if (this.phase === 1) {
            console.log('BossSad entra en FASE 2');
            
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
            this.availableStates.push('icicle');
            console.log('Estados disponibles en fase 2:', this.availableStates);
            
            // Efecto visual y pausa
            this.setActive(false);
            this.setVisible(false);
            this.isActivated = false;
            this.scene.cameras.main.shake(800, 0.02);
            this.scene.cameras.main.flash(500, 50, 50, 255); // Azul para tristeza
            
            // Esperar y revivir
            this.scene.time.delayedCall(2000, () => {
                console.log('Reactivar BossSad para fase 2');
                
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
                
                console.log('BossSad fase 2 activado y listo para atacar');
            });
        } else {
            console.log('BossSad derrotado completamente');
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }
    
    die() {
        console.log('BossSad muere');
        
        // Llama al método die de BaseBoss primero
        super.die();
        
        // Completar acciones específicas de BossSad
        PlayerDataManager.killBoss('sadness');
        this.scene.events.emit('bossDefeated');
        
        console.log('BossSad eliminado del registro');
    }
    
    // Métodos específicos para limpieza de advertencias de BossSad
    cleanupAllWarnings() {
        // Primero llama al método base
        super.cleanupAllWarnings();
        
        // Luego añade limpieza específica para estados de BossSad
        if (this.stateMachine && this.stateMachine.currentState) {
            const currentState = this.stateMachine.currentState;
            
            // Limpiar elementos específicos de BossSad
            const bossSadElements = ['warningCircle', 'waterBall'];
            
            bossSadElements.forEach(element => {
                if (currentState[element] && currentState[element].destroy) {
                    currentState[element].destroy();
                }
            });
        }
    }
    
    // Método específico para destruir water balls
    destroyWaterBall(waterBall) {
        if (waterBall && waterBall.active) {
            waterBall.destroy();
        }
    }
    
    // Método específico para asignar puertas

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

        if(this.finaldoor) 
            {
                this.finaldoor.activarTriste();
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
    setFinalDoor(finaldoor)
    {
       this.finaldoor = finaldoor
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
    
    // Método para limpiar objetos de ataque activos
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
    }
    
    // Sobrescribir takeDamage si necesitas personalización adicional
    takeDamage(damage) {
        // Primero llama al método base
        super.takeDamage(damage);
        
        // Puedes añadir lógica específica aquí si es necesario
        // El método base ya maneja el efecto visual y la reducción de salud
    }
    
    // Método específico para BossSad si necesitas algo especial en setLife
    setLife() {
        console.log('Activando BossSad');
        
        // Llama al método base
        super.setLife();
        
        console.log('BossSad activado, vida:', this.health);
    }
}
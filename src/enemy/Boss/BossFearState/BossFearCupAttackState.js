import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de tazas para el jefe Miedo
 * @class BossFearCupAttackState
 * @extends BaseBossAttackState
 */
export default class BossFearCupAttackState extends BaseBossAttackState {
    constructor(texture = 'vaso') {
        super({
            texture: texture,
            attackName: 'Ataque de Tazas',
            phases: ['attack', 'cooldown'], // Sin fase de warning
            attackDuration: 6000,
            cooldownDuration: 1500,
            logOnEnter: true
        });
        
        this.cupsSpawned = 0;
        this.maxCups = 10;
        this.cupSpawnInterval = 400;
        this.timeSinceLastSpawn = 0;
        this.activeCups = [];
    }
    
    /**
     * Entra al estado de ataque de tazas
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        super.enter(context);
        this.cupsSpawned = 0;
        this.timeSinceLastSpawn = 0;
        this.activeCups = [];
    }
    
    /**
     * Ejecuta la lógica del estado de ataque de tazas
     * @param {Object} context - Contexto del boss
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    execute(context, time, delta) {
        super.execute(context, time, delta);
        
        // Lógica específica de spawn durante la fase attack
        if (this.currentPhase === 'attack') {
            this.timeSinceLastSpawn += delta;
            
            if (this.timeSinceLastSpawn >= this.cupSpawnInterval && 
                this.cupsSpawned < this.maxCups) {
                this.spawnCup();
                this.timeSinceLastSpawn = 0;
                this.cupsSpawned++;
            }
        }
    }
    
    /**
     * Crea advertencias (este ataque no tiene fase de warning)
     */
    createWarning() {
        // Este ataque no tiene fase de warning tradicional
        // Podrías añadir algún efecto visual de advertencia aquí si lo deseas
    }
    
    /**
     * Ejecuta el ataque de tazas
     */
    executeAttack() {
        // El spawn de tazas se maneja en el método execute
        // Esta función se llama al inicio de la fase attack
    }
    
    /**
     * Genera una taza en posición aleatoria
     */
    spawnCup() {
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView;
        
        // Calcular posición aleatoria dentro del área visible
        const minX = worldView.left + 100;
        const maxX = worldView.right - 100;
        const x = Phaser.Math.Between(minX, maxX);
        const y = worldView.top - 50;
        
        // Crear taza usando Phaser (no grupo específico)
        const cup = this.scene.physics.add.sprite(x, y, this.config.texture);
        
        if (!cup) {
            console.error('No se pudo crear la taza');
            return;
        }
        
        // Añadir al grupo unificado de ataques del boss
        this.boss.addAttack(cup);
        
        cup.setDepth(7);
        cup.setScale(1.5);
        cup.setVelocityY(this.boss.cupSpeed);
        cup.body.allowGravity = false;
        cup.setCollideWorldBounds(false);
        cup.isProjectile = true;
        
        // Sonido de taza
        this.boss?.fearCupSound?.play();

        // Efecto de aparición
        cup.setAlpha(0);
        this.scene.tweens.add({
            targets: cup,
            alpha: 1,
            scale: 1.5,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        // Registrar para limpieza
        this.activeCups.push(cup);
        this.setupCupCleanup(cup);
    }
    
    /**
     * Configura la auto-destrucción de una taza
     * @param {Phaser.GameObjects.Sprite} cup - Taza a limpiar
     */
    setupCupCleanup(cup) {
        const cleanupEvent = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (!cup || !cup.active) {
                    cleanupEvent.remove(false);
                    this.removeCupFromActive(cup);
                    return;
                }
                
                // Destruir si sale de los límites visibles
                const cam = this.scene.cameras.main;
                const worldView = cam.worldView;
                
                if (cup.y > worldView.bottom + 200) {
                    cup.destroy();
                    cleanupEvent.remove(false);
                    this.removeCupFromActive(cup);
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Timer de seguridad
        this.scene.time.delayedCall(5000, () => {
            if (cup && cup.active) {
                cup.destroy();
                this.removeCupFromActive(cup);
            }
        });
    }
    
    /**
     * Elimina una taza de la lista de activas
     * @param {Phaser.GameObjects.Sprite} cup - Taza a remover
     */
    removeCupFromActive(cup) {
        const index = this.activeCups.indexOf(cup);
        if (index > -1) {
            this.activeCups.splice(index, 1);
        }
    }
    
    /**
     * Destruye todas las advertencias visuales y tazas
     */
    destroyAllWarnings() {
        super.destroyAllWarnings();
        
        // Limpiar tazas activas
        this.activeCups.forEach(cup => {
            if (cup && cup.active) {
                cup.destroy();
            }
        });
        this.activeCups = [];
    }
    
    /**
     * Sale del estado de ataque de tazas
     * @param {Object} context - Contexto del boss
     */
    exit(context) {
        this.destroyAllWarnings();
        this.cupsSpawned = 0;
        this.activeCups = [];
    }
}
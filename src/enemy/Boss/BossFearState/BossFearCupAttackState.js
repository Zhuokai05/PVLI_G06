import BaseBossAttackState from '../BaseBossAttackState.js';

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
    
    enter(context) {
        super.enter(context);
        this.cupsSpawned = 0;
        this.timeSinceLastSpawn = 0;
        this.activeCups = [];
    }
    
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
    
    createWarning() {
        // Este ataque no tiene fase de warning tradicional
        // Podrías añadir algún efecto visual de advertencia aquí si lo deseas
    }
    
    executeAttack() {
        // El spawn de tazas se maneja en el método execute
        // Esta función se llama al inicio de la fase attack
    }
    
    spawnCup() {
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView;
        
        // Calcular posición aleatoria dentro del área visible
        const minX = worldView.left + 100;
        const maxX = worldView.right - 100;
        const x = Phaser.Math.Between(minX, maxX);
        const y = worldView.top - 50;
        
        // Crear taza
        const cup = this.boss.cups.create(x, y, this.config.texture);
        
        if (!cup) {
            console.error('No se pudo crear la taza');
            return;
        }
        
        cup.setScale(1.5);
        cup.setVelocityY(this.boss.cupSpeed);
        cup.body.allowGravity = false;
        cup.setCollideWorldBounds(false);
        
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
    
    removeCupFromActive(cup) {
        const index = this.activeCups.indexOf(cup);
        if (index > -1) {
            this.activeCups.splice(index, 1);
        }
    }
    
    destroyAllWarnings() {
        super.destroyAllWarnings();
        
        // Limpiar tazas activas
        this.activeCups.forEach(cup => {
            if (cup && cup.active) {
                cup.destroy();
            }
        });
        this.activeCups = [];
        
        // Limpiar grupo de tazas
        if (this.boss && this.boss.cups) {
            this.boss.cups.clear(true, true);
        }
    }
    
    exit(context) {
        this.destroyAllWarnings();
        this.cupsSpawned = 0;
        this.activeCups = [];
    }
}
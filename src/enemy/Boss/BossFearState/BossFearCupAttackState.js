import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearCupAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        this.attackDuration = 6000; 
        this.cooldownDuration = 1500;
        
        this.cupsSpawned = 0;
        this.maxCups = 10;
        this.cupSpawnInterval = 400;
        this.timeSinceLastSpawn = 0;
        
        console.log("Ataque de tazas iniciado");
    }

    execute(context, time, delta) {
        this.stateTime += delta;
        this.timeSinceLastSpawn += delta;

        switch (this.currentPhase) {
            case 'attack':
                // Spawnear cups en intervalos
                if (this.timeSinceLastSpawn >= this.cupSpawnInterval && this.cupsSpawned < this.maxCups) {
                    this.spawnCup();
                    this.timeSinceLastSpawn = 0;
                    this.cupsSpawned++;
                }
                
                // Terminar ataque después de la duración
                if (this.stateTime >= this.attackDuration) {
                    this.startCooldownPhase();
                }
                break;
                
            case 'cooldown':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    spawnCup() {
        const { scene, cups } = this.boss;
        const cam = scene.cameras.main;
        
        // Calcular límites del mundo visible en la cámara actual
        const worldView = cam.worldView;
        const minX = worldView.left + 100;
        const maxX = worldView.right - 100;
        
        // Spawnear en posición aleatoria dentro del área visible
        const x = Phaser.Math.Between(minX, maxX);
        const y = worldView.top - 50; // Arriba de la pantalla
        
        const cup = cups.create(x, y, 'vaso');

        cup.setScale(1.5);
        cup.setVelocityY(this.boss.cupSpeed);
        cup.body.allowGravity = false;
        cup.setCollideWorldBounds(false);

        this.cleanupCup(cup);
        console.log(`Cup spawned at (${x}, ${y})`);
    }

    cleanupCup(cup) {
        const scene = this.boss.scene;
        const cleanupCheck = () => {
            if (!cup.active) return;
            
            // Destruir si sale de los límites del mundo visible
            const cam = scene.cameras.main;
            const worldView = cam.worldView;
            
            if (cup.y > worldView.bottom + 200) {
                cup.destroy();
            }
        };
        
        // Verificar cada frame
        scene.events.on('update', cleanupCheck);
        
        // También agregar un timer de seguridad
        scene.time.delayedCall(5000, () => {
            if (cup && cup.active) {
                cup.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
        console.log("Ataque de tazas terminado, entrando en cooldown");
    }

    exit(context) {
        // Limpiar cups restantes
        this.boss.cups.clear(true, true);
    }
}
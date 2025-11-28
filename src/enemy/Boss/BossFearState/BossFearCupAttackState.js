import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearCupAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        this.attackDuration = 2000;
        this.cooldownDuration = 500;
        
        this.cupsSpawned = 0;
        this.maxCups = 10;
        this.cupSpawnInterval = 400;
        
        this.startAttackPhase();
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'attack':
                if (this.stateTime >= this.cupSpawnInterval && this.cupsSpawned < this.maxCups) {
                    this.spawnCup();
                    this.stateTime = 0;
                }
                
                if (this.cupsSpawned >= this.maxCups && this.stateTime >= this.attackDuration) {
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
        const camWidth = scene.cameras.main.width;

        const x = Phaser.Math.Between(100, camWidth - 100);
        const cup = cups.create(x, 0, 'vaso');

        cup.setScale(1.5);
        cup.setVelocityY(this.boss.cupSpeed);
        cup.body.allowGravity = false;
        cup.setCollideWorldBounds(false);

        this.cleanupCup(cup);
        this.cupsSpawned++;
    }

    cleanupCup(cup) {
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!cup.active) return;
            const cam = scene.cameras.main;
            if (cup.x < -200 || cup.x > cam.width + 200 || cup.y > cam.height + 200) {
                cup.destroy();
            }
        });
    }

    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;
        this.cupsSpawned = 0;
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Limpiar cups restantes
        this.boss.cups.clear(true, true);
    }
}
import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadIcicleState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1200;
        this.attackDuration = 500;
        this.cooldownDuration = 500;
        
        this.startWarningPhase();
        
        console.log("Carámbanos verticales");
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const player = this.boss.player;
        const cam = scene.cameras.main;

        // Crear advertencia vertical
        const warningWidth = 120;
        this.spawnX = player.x;
        
        this.warningRect = scene.add.rectangle(
            this.spawnX,
            this.boss.y,
            warningWidth,
            cam.height,
            0x4169e1, // Azul en lugar de rojo
            0.5
        );
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.startAttackPhase();
                }
                break;
                
            case 'attack':
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

    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;
        
        this.warningRect.destroy();
        this.spawnIcicle();
    }

    spawnIcicle() {
        const { scene, icicles } = this.boss;
        const Yspeed = this.boss.icicleSpeed;
        
        const icicle = icicles.create(this.spawnX, this.boss.y - 400, 'icicle');
        icicle.setVelocityY(Yspeed);
        icicle.setScale(1.5);
        icicle.body.allowGravity = false;
        icicle.setTint(0x4169e1); // Azul en lugar de rojo
        
        // Rotar 90 grados para que apunte hacia abajo
        icicle.setRotation(Math.PI / 2);

        this.cleanupIcicle(icicle);
    }

    cleanupIcicle(icicle) {
        const scene = this.boss.scene;

        scene.events.on('update', () => {
            if (!icicle.active) return;
            const cam = scene.cameras.main;
            if (icicle.y > this.boss.y + this.boss.distanceToFloor) {
                icicle.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        if (this.warningRect && this.warningRect.active) {
            this.warningRect.destroy();
        }
    }
}
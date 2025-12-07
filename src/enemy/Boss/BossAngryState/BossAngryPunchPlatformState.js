import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryPunchPlatformState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1200;
        this.attackDuration = 500;
        this.cooldownDuration = 500;
        
        this.startWarningPhase();
             console.log("puño vertical")
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
            0xff0000,
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
        this.spawnPunch();
    }

    spawnPunch() {
        const { scene, punches } = this.boss;
        const Yspeed = this.boss.punchYSpeed;
        
        const punch = punches.create(this.spawnX, this.boss.y - 300, 'punch');
        punch.setVelocityY(Yspeed);
        punch.setScale(2.5);
        punch.body.allowGravity = false;
        punch.setTint(0xff6b6b);

        // Marcar este puño como "puño de plataforma" (opcional, para diferenciar)
        punch.isPlatformPunch = true;

        this.cleanupPunch(punch);
    }

    cleanupPunch(punch) {
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!punch.active) return;
            const cam = scene.cameras.main;
            if (punch.y > this.boss.y + this.boss.distanceToFloor + 150) {
                punch.destroy();
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
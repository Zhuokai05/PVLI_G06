import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryPunchState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1000;
        this.attackDuration = 500;
        this.cooldownDuration = 500;

        this.fixedSpawnY = this.boss.y + this.boss.distanceToFloor;
        
        // Iniciar fase de advertencia
        this.startWarningPhase();

        console.log("puño horizontal")
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const player = this.boss.player;
        const cam = scene.cameras.main;

        // Solo ataques laterales
        this.attackDirection = Phaser.Math.Between(0, 1) === 0 ? 'left' : 'right';

        // Rectangulo horizontal de advertencia
        const warningHeight = 120;
        this.spawnY = this.fixedSpawnY;
        this.spawnX = this.attackDirection === 'left' ? this.boss.x - cam.width/2 : this.boss.x + cam.width/2;

        this.warningRect = scene.add.rectangle(
            this.boss.x,   
            this.spawnY,            
            cam.width,          
            warningHeight,       
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
        
        // Destruir advertencia y crear puno
        this.warningRect.destroy();
        this.spawnPunch();
    }

    spawnPunch() {
        const { scene, punches } = this.boss;
        const Xspeed = this.boss.punchXSpeed;
        const cam = scene.cameras.main;
        let punch;

        if (this.attackDirection === 'left') {
            punch = punches.create(this.boss.x -cam.width/2, this.fixedSpawnY, 'punch');
            punch.setVelocityX(Xspeed);
            punch.setAngle(-90);
        } else {
            punch = punches.create(this.boss.x + cam.width/2, this.fixedSpawnY, 'punch');
            punch.setVelocityX(-Xspeed);
            punch.setAngle(90);
        }

        punch.setScale(2.5);
        punch.body.allowGravity = false;
        punch.setTint(0x6b6bff);

        // Destruccion cuando sale de camara
        this.cleanupPunch(punch);
    }

    cleanupPunch(punch) {
        
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!punch.active) return;
            const cam = scene.cameras.main;
            if (punch.x < this.boss.x -200 -cam.width/2 || punch.x > this.boss.x +200 +cam.width/2 || punch.y > this.boss.y + 600) {
                punch.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Limpiar advertencia si aun existe
        if (this.warningRect && this.warningRect.active) {
            this.warningRect.destroy();
        }
    }
}
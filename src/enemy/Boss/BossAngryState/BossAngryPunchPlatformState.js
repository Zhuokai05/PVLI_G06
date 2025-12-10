import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

export default class BossAngryPunchPlatformState extends BaseBossAttackState {
    constructor(texture = 'punch') {
        super({
            texture: texture,
            attackName: 'Puño Vertical',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 1200,
            attackDuration: 500,
            cooldownDuration: 500
        });
        
        this.spawnX = 0;
    }
    
    createWarning() {
        const cam = this.scene.cameras.main;
        
        // Crear advertencia vertical en la posición del jugador
        this.spawnX = this.player.x;
        const warningWidth = 120;
        
        this.createWarningRectangle(
            this.spawnX,
            this.boss.y,
            warningWidth,
            cam.height,
            0xff0000,
            0.5
        );
    }
    
    executeAttack() {
        this.spawnPunch();
    }
    
    spawnPunch() {
        const Yspeed = this.boss.punchYSpeed;
        
        const punch = this.boss.punches.create(
            this.spawnX,
            this.boss.y - 300,
            this.config.texture
        );
        
        punch.setVelocityY(Yspeed);
        punch.setScale(2.5);
        punch.body.allowGravity = false;
        punch.isPlatformPunch = true; // Marcar como puño de plataforma
        
        // Auto-destrucción
        this.cleanupPunch(punch);
    }
    
    cleanupPunch(punch) {
        const scene = this.scene;
        scene.events.on('update', () => {
            if (!punch.active) return;
            if (punch.y > this.boss.y + this.boss.distanceToFloor + 150) {
                punch.destroy();
            }
        });
    }
}
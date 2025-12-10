import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de puño vertical para plataformas (jefe Ira)
 * @class BossAngryPunchPlatformState
 * @extends BaseBossAttackState
 */
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
    
    /**
     * Crea las advertencias visuales para el puño vertical
     */
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
    
    /**
     * Ejecuta el ataque de puño vertical
     */
    executeAttack() {
        this.boss.play('bossira_attack');
        this.spawnPunch();
    }
    
    /**
     * Genera un puño vertical
     */
    spawnPunch() {
        const Yspeed = this.boss.punchYSpeed;
        
        // Usar create de Phaser en lugar del grupo específico
        const punch = this.scene.physics.add.sprite(
            this.spawnX,
            this.boss.y - 300,
            this.config.texture
        );
        
        // Añadir al grupo de ataques del boss
        this.boss.addAttack(punch);
        
        punch.setVelocityY(Yspeed);
        punch.setScale(2.5);
        punch.body.allowGravity = false;
        punch.isPlatformPunch = true; // Marcar como puño de plataforma
        
        // Auto-destrucción
        this.cleanupPunch(punch);
    }
    
    /**
     * Configura la auto-destrucción del puño vertical
     * @param {Phaser.GameObjects.Sprite} punch - Puño a limpiar
     */
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
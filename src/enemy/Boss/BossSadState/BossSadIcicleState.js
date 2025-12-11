import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de carámbanos verticales para el jefe Tristeza
 * @class BossSadIcicleState
 * @extends BaseBossAttackState
 */
export default class BossSadIcicleState extends BaseBossAttackState {
    constructor(texture = 'icicle') {
        super({
            texture: texture,
            attackName: 'Carámbanos Verticales',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 1200,
            attackDuration: 500,
            cooldownDuration: 500
        });

        this.spawnX = 0;
    }

    /**
     * Crea las advertencias visuales para los carámbanos verticales
     */
    createWarning() {
        const cam = this.scene.cameras.main;
        this.spawnX = this.player.x;
        const warningWidth = 120;

        this.createWarningRectangle(
            this.spawnX,
            this.boss.y,
            warningWidth,
            cam.height,
            0x4169e1,
            0.5
        );
    }

    /**
     * Ejecuta el ataque de carámbanos verticales
     */
    executeAttack() {
        if(this.boss.bossName === 'sadness')this.boss.play('bosssadness_attack');
        this.spawnIcicle();
    }

    /**
     * Genera un carámbano vertical
     */
    spawnIcicle() {
        const Yspeed = this.boss.icicleSpeed;

        // Crear sprite con Phaser
        const icicle = this.scene.physics.add.sprite(
            this.spawnX,
            this.boss.y - 400,
            this.config.texture
        );

        // Añadir al grupo unificado de ataques
        this.boss.addAttack(icicle);

        icicle.setVelocityY(Yspeed);
        icicle.setScale(1.5);
        icicle.body.allowGravity = false;
        icicle.setRotation(Math.PI / 2); // Apuntar hacia abajo
        icicle.isProjectile = true;

        // Sonidos de carambanos
        this.boss?.sadCarambanosSound?.play();

        // Auto-destrucción por tiempo (2 segundos)
        this.scene.time.delayedCall(2000, () => {
            if (icicle && icicle.active) {
                icicle.destroy();
            }
        });
    }

    /**
     * Configura la auto-destrucción de un carámbano
     * @param {Phaser.GameObjects.Sprite} icicle - Carámbano a limpiar
     */
    cleanupIcicle(icicle) {
        const cleanupEvent = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                if (!icicle.active) {
                    cleanupEvent.remove(false);
                    return;
                }

                if (icicle.y > this.boss.y + this.boss.distanceToFloor) {
                    icicle.destroy();
                    cleanupEvent.remove(false);
                }
            },
            callbackScope: this,
            loop: true
        });

        // Registrar evento para limpieza
        if (!this.cleanupEvents) {
            this.cleanupEvents = [];
        }
        this.cleanupEvents.push(cleanupEvent);
    }

    /**
     * Destruye todas las advertencias visuales
     */
    destroyAllWarnings() {
        super.destroyAllWarnings();

        // No necesitamos limpiar eventos de cleanup ya que usamos delayedCall
    }
}
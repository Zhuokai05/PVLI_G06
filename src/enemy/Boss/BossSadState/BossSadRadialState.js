import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque radial de icicles para el jefe Tristeza
 * @class BossSadRadialState
 * @extends BaseBossAttackState
 */
export default class BossSadRadialState extends BaseBossAttackState {
    constructor(texture = 'icicle') {
        super({
            texture: texture,
            attackName: 'Ataque Radial',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 1200,
            attackDuration: 900,
            cooldownDuration: 1500
        });
    }

    /**
     * Crea las advertencias visuales para el ataque radial
     */
    createWarning() {
        // Crear advertencia circular alrededor del boss
        const warningCircle = this.createWarningCircle(
            this.boss.x,
            this.boss.y,
            150,
            0x4169e1,
            0.3
        );

        // Borde para mayor visibilidad
        const warningBorder = this.scene.add.circle(
            this.boss.x,
            this.boss.y,
            150,
            0x4169e1,
            0
        );
        warningBorder.setStrokeStyle(4, 0x87ceeb);

        this.registerWarningElement('warningCircle', warningCircle);
        this.registerWarningElement('warningBorder', warningBorder);

        // Efecto de pulso
        this.createPulseEffect([warningCircle, warningBorder], 600, 0.5, 0.8, 1, 1.2);
    }

    /**
     * Crea un círculo de advertencia
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} radius - Radio del círculo
     * @param {number} color - Color del círculo
     * @param {number} alpha - Transparencia
     * @returns {Phaser.GameObjects.Circle} - Círculo creado
     */
    createWarningCircle(x, y, radius, color, alpha) {
        const circle = this.scene.add.circle(x, y, radius, color, alpha);
        this.registerWarningElement('warningCircle', circle);
        return circle;
    }

    /**
     * Ejecuta el ataque radial de icicles
     */
    executeAttack() {
        if(this.boss.bossName === 'sadness')this.boss.play('bosssadness_attack');
        this.spawnRadialIcicles(12);
    }

    /**
     * Genera icicles en patrón radial
     * @param {number} count - Número de icicles a generar
     */
    spawnRadialIcicles(count) {
        const speed = this.boss.radialSpeed || 300;
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            // Crear sprite con Phaser
            const icicle = this.scene.physics.add.sprite(
                this.boss.x,
                this.boss.y,
                this.config.texture
            );

            // Añadir al grupo unificado de ataques
            this.boss.addAttack(icicle);

            icicle.setVelocity(velocityX, velocityY);
            icicle.setScale(1);
            icicle.body.allowGravity = false;
            icicle.isProjectile = true;

            const rotationAngle = Math.atan2(velocityY, velocityX);
            icicle.setRotation(rotationAngle);

            // Sonido de carambanos
            this.boss?.sadIcicleSound?.play();

            // Auto-destrucción por tiempo (3 segundos)
            this.scene.time.delayedCall(3000, () => {
                if (icicle && icicle.active) {
                    icicle.destroy();
                }
            });
        }
    }

    /**
     * Configura la auto-destrucción de un icicle
     * @param {Phaser.GameObjects.Sprite} icicle - Icicle a limpiar
     */
    setupIcicleCleanup(icicle) {
        const cleanupEvent = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (!icicle.active) return;

                // Destruir si está muy lejos del boss
                const distance = Phaser.Math.Distance.Between(
                    this.boss.x, this.boss.y,
                    icicle.x, icicle.y
                );

                if (distance > 800) {
                    icicle.destroy();
                    cleanupEvent.remove(false);
                }

                // Destruir si sale de pantalla
                const cam = this.scene.cameras.main;
                const bounds = new Phaser.Geom.Rectangle(
                    cam.worldView.x - 200,
                    cam.worldView.y - 200,
                    cam.worldView.width + 400,
                    cam.worldView.height + 400
                );

                if (!bounds.contains(icicle.x, icicle.y)) {
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
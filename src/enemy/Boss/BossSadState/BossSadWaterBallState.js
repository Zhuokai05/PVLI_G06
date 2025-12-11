import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de bola de agua perseguidora para el jefe Tristeza
 * @class BossSadWaterBallState
 * @extends BaseBossAttackState
 */
export default class BossSadWaterBallState extends BaseBossAttackState {
    constructor(texture = 'water_ball') {
        super({
            texture: texture,
            attackName: 'Bola de Agua Perseguidora',
            phases: ['spawn', 'follow', 'explode', 'cooldown'],
            warningDuration: 0,
            attackDuration: 6000,
            cooldownDuration: 500
        });

        this.fixedPhases = {
            spawn: 500,
            follow: 5000,
            explode: 600,
            cooldown: 500
        };

        this.damageApplied = false;
        this.ballDestroyed = false;
        this.waterBall = null;
        this.timeSinceLastSpawn = 0;
        this.spawnInterval = 500;
    }

    /**
     * Entra al estado de bola de agua
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        this.boss = context;
        super.enter(context);

        // Iniciar fase de spawn directamente
        this.currentPhase = 'spawn';
        this.startSpawnPhase();
        if (this.boss.bossName === 'sadness') this.boss.play('bosssadness_attack');
    }

    /**
     * Ejecuta la lógica del estado de bola de agua
     * @param {Object} context - Contexto del boss
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    execute(context, time, delta) {
        this.stateTime += delta;
        this.timeSinceLastSpawn += delta;

        switch (this.currentPhase) {
            case 'spawn':
                if (this.stateTime >= this.fixedPhases.spawn) {
                    this.startFollowPhase();
                }
                break;

            case 'follow':
                this.followPlayer();
                this.checkPlayerCollision();

                if (this.stateTime >= this.fixedPhases.follow && !this.ballDestroyed) {
                    this.startExplodePhase();
                }
                break;

            case 'explode':
                if (this.stateTime >= this.fixedPhases.explode) {
                    this.startCooldownPhase();
                }
                break;

            case 'cooldown':
                if (this.stateTime >= this.fixedPhases.cooldown) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    createWarning() {
        // Este ataque no tiene fase de warning tradicional
    }

    executeAttack() {
        // El ataque se ejecuta en las fases específicas
    }

    /**
     * Inicia la fase de spawn de la bola de agua
     */
    startSpawnPhase() {
        this.currentPhase = 'spawn';
        this.stateTime = 0;
        this.spawnWaterBall();
    }

    /**
     * Genera la bola de agua
     */
    spawnWaterBall() {
        // Crear sprite con Phaser
        this.waterBall = this.scene.physics.add.sprite(
            this.boss.x,
            this.boss.y - 50,
            this.config.texture
        );

        // Añadir al grupo unificado de ataques
        this.boss.addAttack(this.waterBall);

        this.waterBall.setScale(1.4);
        this.waterBall.body.allowGravity = false;
        this.waterBall.following = false;
        this.waterBall.speed = this.boss.waterBallSpeed;
        this.waterBall.isProjectile = true;

        // Efecto de aparición
        this.waterBall.setAlpha(0);
        this.waterBall.setScale(0.1);

        this.scene.tweens.add({
            targets: this.waterBall,
            alpha: 1,
            scale: 1.4,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Inicia la fase de seguimiento al jugador
     */
    startFollowPhase() {
        this.currentPhase = 'follow';
        this.stateTime = 0;

        if (this.waterBall) {
            this.waterBall.following = true;
        }
        this.ballDestroyed = false;
    }

    /**
     * Hace que la bola de agua siga al jugador
     */
    followPlayer() {
        if (!this.waterBall || !this.waterBall.active || !this.waterBall.following || this.ballDestroyed) return;

        const angle = Phaser.Math.Angle.Between(
            this.waterBall.x, this.waterBall.y,
            this.player.x, this.player.y
        );

        const velocityX = Math.cos(angle) * this.waterBall.speed;
        const velocityY = Math.sin(angle) * this.waterBall.speed;

        this.waterBall.setVelocity(velocityX, velocityY);

        // Efecto visual de movimiento
        if (this.stateTime % 300 < 10) {
            this.createTrailEffect();
        }
    }

    /**
     * Crea efecto de rastro tras la bola de agua
     */
    createTrailEffect() {
        if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;

        const trail = this.scene.add.circle(
            this.waterBall.x,
            this.waterBall.y,
            15,
            0x87ceeb,
            0.6
        );

        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
                if (trail && trail.active) {
                    trail.destroy();
                }
            }
        });
    }

    /**
     * Verifica colisión con el jugador
     */
    checkPlayerCollision() {
        if (!this.waterBall || !this.waterBall.active || this.damageApplied || this.ballDestroyed) return;

        // Usar verificación periódica por tiempo
        this.scene.time.delayedCall(100, () => {
            if (!this.waterBall || !this.waterBall.active || this.damageApplied || this.ballDestroyed) return;

            const distance = Phaser.Math.Distance.Between(
                this.waterBall.x, this.waterBall.y,
                this.player.x, this.player.y
            );

            const collisionRadius = 40;

            if (distance <= collisionRadius) {
                const dir = this.player.x < this.waterBall.x ? -1 : 1;
                this.player.takeDamage(this.boss.damage, dir);
                this.damageApplied = true;
                this.ballDestroyed = true;

                this.createImpactEffect();

                // Destruir la bola
                if (this.waterBall && this.waterBall.active) {
                    this.waterBall.destroy();
                }
            }
        });
    }

    /**
     * Crea efecto visual de impacto con el jugador
     */
    createImpactEffect() {
        const impactCircle = this.scene.add.circle(
            this.waterBall.x,
            this.waterBall.y,
            60,
            0x00bfff,
            0.7
        );

        // Ondas de impacto
        for (let i = 0; i < 3; i++) {
            const wave = this.scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                30,
                0x4169e1,
                0.5 - (i * 0.15)
            );

            this.scene.tweens.add({
                targets: wave,
                scale: 3 + (i * 0.5),
                alpha: 0,
                duration: 400,
                delay: i * 80,
                onComplete: () => {
                    if (wave && wave.active) {
                        wave.destroy();
                    }
                }
            });
        }

        // Partículas de impacto
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                10,
                0x87ceeb,
                0.9
            );

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 50,
                y: particle.y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => {
                    if (particle && particle.active) {
                        particle.destroy();
                    }
                }
            });
        }

        this.scene.cameras.main.shake(200, 0.015);

        this.scene.time.delayedCall(300, () => {
            if (impactCircle && impactCircle.active) {
                impactCircle.destroy();
            }
        });
    }

    /**
     * Inicia la fase de explosión de la bola
     */
    startExplodePhase() {
        if (this.ballDestroyed || this.damageApplied) {
            this.startCooldownPhase();
            return;
        }

        this.currentPhase = 'explode';
        this.stateTime = 0;

        if (this.waterBall && this.waterBall.active) {
            this.explosionX = this.waterBall.x;
            this.explosionY = this.waterBall.y;

            this.waterBall.following = false;
            this.waterBall.setVelocity(0, 0);
            this.ballDestroyed = true;

            this.destroyWaterBallWithEffect();
            this.createExplosion();
        }
    }

    /**
     * Destruye la bola de agua con efecto visual
     */
    destroyWaterBallWithEffect() {
        if (!this.waterBall || !this.waterBall.active) return;

        this.scene.tweens.add({
            targets: this.waterBall,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                if (this.waterBall && this.waterBall.active) {
                    this.waterBall.destroy();
                }
            }
        });
    }

    /**
     * Crea efecto visual de explosión
     */
    createExplosion() {
        if (this.damageApplied) return;

        const explosionRadius = 180;

        // Efecto de explosión principal
        const explosionSprite = this.scene.add.sprite(
            this.explosionX,
            this.explosionY,
            this.config.texture
        );

        explosionSprite.setScale(0.5);
        explosionSprite.setTint(0x00bfff);
        explosionSprite.setAlpha(0.8);

        this.scene.tweens.add({
            targets: explosionSprite,
            scale: 6,
            alpha: 0,
            duration: this.fixedPhases.explode,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (explosionSprite && explosionSprite.active) {
                    explosionSprite.destroy();
                }
            }
        });

        // Ondas de explosión
        for (let waveNum = 0; waveNum < 4; waveNum++) {
            const wave = this.scene.add.circle(
                this.explosionX,
                this.explosionY,
                explosionRadius * 0.3,
                0x4169e1,
                0.4 - (waveNum * 0.1)
            );

            this.scene.tweens.add({
                targets: wave,
                scale: 4 + (waveNum * 0.3),
                alpha: 0,
                duration: 500,
                delay: waveNum * 120,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    if (wave && wave.active) {
                        wave.destroy();
                    }
                }
            });
        }

        // Partículas de explosión
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 90 + Math.random() * 60;
            const particle = this.scene.add.circle(
                this.explosionX,
                this.explosionY,
                12 + Math.random() * 8,
                0x87ceeb,
                0.9
            );

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * distance,
                y: particle.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: 600 + Math.random() * 200,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    if (particle && particle.active) {
                        particle.destroy();
                    }
                }
            });
        }

        // Verificar daño por explosión
        if (!this.damageApplied) {
            const distance = Phaser.Math.Distance.Between(
                this.explosionX, this.explosionY,
                this.player.x, this.player.y
            );

            if (distance <= explosionRadius) {
                const dir = this.player.x < this.explosionX ? -1 : 1;
                this.player.takeDamage(this.boss.damage, dir);
                this.damageApplied = true;
                this.scene.cameras.main.shake(300, 0.02);
            }
        }
    }

    /**
     * Inicia la fase de cooldown
     */
    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
        this.damageApplied = false;
        this.ballDestroyed = false;
    }

    /**
     * Destruye todas las advertencias visuales
     */
    destroyAllWarnings() {
        super.destroyAllWarnings();

        if (this.waterBall && this.waterBall.active) {
            this.waterBall.destroy();
            this.waterBall = null;
        }
    }

    /**
     * Sale del estado de bola de agua
     * @param {Object} context - Contexto del boss
     */
    exit(context) {
        this.destroyAllWarnings();
        this.damageApplied = false;
        this.ballDestroyed = false;
    }
}
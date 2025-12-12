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
        this.waterBallHealth = 1;
    }

    /**
     * Entra al estado de bola de agua
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        this.boss = context;
        super.enter(context);

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

        switch (this.currentPhase) {
            case 'spawn':
                if (this.stateTime >= this.fixedPhases.spawn) {
                    this.startFollowPhase();
                }
                break;

            case 'follow':
                this.followPlayer();        // Seguir al jugador
                this.checkPlayerCollision(); // Verificar colisión con jugador
                this.checkAttackCollision(); // Verificar colisión con ataques

                if (this.stateTime >= this.fixedPhases.follow && !this.ballDestroyed) {
                    this.startExplodePhase(); // Explotar si se acaba el tiempo
                }
                break;

            case 'explode':
                if (this.stateTime >= this.fixedPhases.explode) {
                    this.startCooldownPhase(); // Ir a cooldown después de explotar
                }
                break;

            case 'cooldown':
                if (this.stateTime >= this.fixedPhases.cooldown) {
                    this.boss.selectNextState(); // Cambiar a siguiente estado del boss
                }
                break;
        }
    }

    createWarning() { }  // Este ataque no tiene fase de warning
    executeAttack() { }  // El ataque se maneja en las fases específicas

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
        // Crear sprite de física para la bola de agua
        this.waterBall = this.scene.physics.add.sprite(
            this.boss.x,
            this.boss.y - 50,
            this.config.texture
        );

        this.boss.addAttack(this.waterBall); // Añadir al grupo de ataques del boss

        // Configurar propiedades de la bola
        this.waterBall.setScale(1.4);
        this.waterBall.body.allowGravity = false; // Sin gravedad
        this.waterBall.following = false; // Aún no sigue al jugador
        this.waterBall.speed = this.boss.waterBallSpeed;
        this.waterBall.isProjectile = true; // Marcar como proyectil
        this.waterBall.health = this.waterBallHealth; // Vida de la bola
        this.waterBall.maxHealth = this.waterBallHealth;

        this.boss?.sadBubbleInvokeSound?.play(); // Sonido de invocación

        // Efecto de aparición
        this.waterBall.setAlpha(0);
        this.waterBall.setScale(0.1);

        this.scene.tweens.add({
            targets: this.waterBall,
            alpha: 1,
            scale: 1.4,
            duration: 400,
            ease: 'Back.easeOut' // Animación de "rebote"
        });
    }

    /**
     * Verifica colisión con ataques del jugador
     */
    checkAttackCollision() {
        if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;

        // Verificar ataque melee (con delay para evitar múltiples colisiones)
        if (this.scene.player.isAttacking) {
            this.scene.time.delayedCall(50, () => {
                if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;

                const attackDistance = this.scene.player.meleeAttackDist * this.scene.player.attackRangeMultiplier;
                const distanceToPlayer = Phaser.Math.Distance.Between(
                    this.waterBall.x, this.waterBall.y,
                    this.scene.player.x, this.scene.player.y
                );

                // Si el jugador está en rango de ataque melee
                if (distanceToPlayer <= attackDistance + 50) {
                    this.takeDamage(this.scene.player.damage * this.scene.player.damageMultiplier);
                }
            });
        }

        // Verificar proyectiles del jugador
        if (this.scene.playerProjectilePool && this.scene.playerProjectilePool.projectiles) {
            const projectiles = this.scene.playerProjectilePool.projectiles.getChildren();

            projectiles.forEach(projectile => {
                // Si hay colisión entre proyectil y bola de agua
                if (projectile.active && Phaser.Math.Distance.Between(
                    this.waterBall.x, this.waterBall.y,
                    projectile.x, projectile.y
                ) <= 60) {
                    projectile.destroy(); // Destruir proyectil
                    this.takeDamage(this.scene.player.rangeDamage * this.scene.player.damageMultiplier);
                }
            });
        }
    }

    /**
     * Aplica daño a la bola de agua
     * @param {number} damage - Cantidad de daño a aplicar
     */
    takeDamage(damage) {
        if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;

        this.waterBall.health -= damage; // Reducir salud de la bola
        this.showDamageEffect(); // Mostrar efecto visual de daño

        // Si la bola se queda sin salud
        if (this.waterBall.health <= 0) {
            this.destroyWaterBall(false); // false = destrucción por jugador (no aplica daño al jugador)
        }
    }

    /**
     * Muestra efecto visual de daño en la bola de agua
     */
    showDamageEffect() {
        if (!this.waterBall || !this.waterBall.active) return;

        // Efecto de parpadeo
        this.scene.tweens.add({
            targets: this.waterBall,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        // Cambiar color temporalmente
        this.waterBall.setTint(0xff4444);
        this.scene.time.delayedCall(200, () => {
            if (this.waterBall && this.waterBall.active) {
                this.waterBall.clearTint(); // Restaurar color original
            }
        });

        this.createDamageParticles(); // Crear partículas de daño
    }

    /**
     * Crea partículas de daño
     */
    createDamageParticles() {
        if (!this.waterBall || !this.waterBall.active) return;

        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2; // Ángulo aleatorio
            const speed = 50 + Math.random() * 100; // Velocidad aleatoria
            const particle = this.scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                5 + Math.random() * 8, // Tamaño aleatorio
                0x87ceeb, // Color azul claro
                0.8
            );

            // Animación de partícula volando en dirección aleatoria
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * speed,
                y: particle.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Destruye la bola de agua
     * @param {boolean} applyDamageToPlayer - Si aplica daño al jugador
     * @param {string} damageSource - Fuente del daño ('player' o 'timeout')
     */
    destroyWaterBall(applyDamageToPlayer = false, damageSource = 'player') {
        if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;

        this.ballDestroyed = true; // Marcar como destruida
        this.explosionX = this.waterBall.x; // Guardar posición para explosión
        this.explosionY = this.waterBall.y;

        if (this.waterBall.following) {
            this.waterBall.following = false; // Dejar de seguir
            this.waterBall.setVelocity(0, 0); // Detener movimiento
        }

        this.destroyWaterBallWithEffect(); // Animación de destrucción
        this.boss?.sadBubbleExplodeSound?.play(); // Sonido de explosión

        // Si la bola explota sobre el jugador
        if (applyDamageToPlayer && !this.damageApplied) {
            this.damageApplied = true;
            const dir = this.player.x < this.explosionX ? -1 : 1; // Dirección del knockback
            this.player.takeDamage(this.boss.damage, dir); // Dañar al jugador
            this.createImpactEffect(); // Efecto visual de impacto
        } else {
            // Si la bola es destruida por el jugador
            if (damageSource === 'player') {
                this.createExplosion(100, 4, 0xff4444, 12, 80); // Explosión pequeña (roja)
            } else {
                // Explosión normal (tiempo terminado)
                this.createExplosion(180, 6, 0x00bfff, 20, 150); // Explosión grande (azul)
            }
        }

        this.startCooldownPhase(); // Ir a fase de cooldown
    }

    /**
     * Inicia la fase de seguimiento al jugador
     */
    startFollowPhase() {
        this.currentPhase = 'follow';
        this.stateTime = 0;

        if (this.waterBall) {
            this.waterBall.following = true; // Activar seguimiento
        }
        this.ballDestroyed = false;
    }

    /**
     * Hace que la bola de agua siga al jugador
     */
    followPlayer() {
        if (!this.waterBall || !this.waterBall.active || !this.waterBall.following || this.ballDestroyed) return;

        // Calcular ángulo hacia el jugador
        const angle = Phaser.Math.Angle.Between(
            this.waterBall.x, this.waterBall.y,
            this.player.x, this.player.y
        );

        // Mover hacia el jugador con velocidad constante
        this.waterBall.setVelocity(
            Math.cos(angle) * this.waterBall.speed,
            Math.sin(angle) * this.waterBall.speed
        );

        // Crear efecto de rastro periódicamente
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

        // Animación de desvanecimiento del rastro
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => trail.destroy()
        });
    }

    /**
     * Verifica colisión directa con el jugador
     */
    checkPlayerCollision() {
        if (!this.waterBall || !this.waterBall.active || this.damageApplied || this.ballDestroyed) return;

        // Verificar con delay para evitar colisiones múltiples
        this.scene.time.delayedCall(100, () => {
            if (!this.waterBall || !this.waterBall.active || this.damageApplied || this.ballDestroyed) return;

            const distance = Phaser.Math.Distance.Between(
                this.waterBall.x, this.waterBall.y,
                this.player.x, this.player.y
            );

            // Si hay colisión cercana con el jugador
            if (distance <= 40) {
                this.boss?.sadBubbleExplodeSound?.play();
                this.destroyWaterBall(true, 'player'); // true = aplica daño al jugador
            }
        });
    }

    /**
     * Crea efecto visual de impacto
     */
    createImpactEffect() {
        const impactCircle = this.scene.add.circle(
            this.waterBall.x,
            this.waterBall.y,
            60,
            0x00bfff,
            0.7
        );

        // Ondas de impacto concéntricas
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
                scale: 3 + (i * 0.5), // Escalar progresivamente
                alpha: 0,
                duration: 400,
                delay: i * 80, // Retraso entre ondas
                onComplete: () => wave.destroy()
            });
        }

        // Partículas que salen en todas direcciones
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2; // Distribuir en círculo completo
            const particle = this.scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                10,
                0x87ceeb,
                0.9
            );

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 50, // Mover en dirección radial
                y: particle.y + Math.sin(angle) * 50,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }

        this.scene.cameras.main.shake(200, 0.015); // Sacudida de cámara
        this.scene.time.delayedCall(300, () => impactCircle.destroy()); // Destruir círculo después
    }

    /**
     * Inicia la fase de explosión
     */
    startExplodePhase() {
        if (this.ballDestroyed || this.damageApplied) {
            this.startCooldownPhase(); // Si ya fue destruida, ir a cooldown
            return;
        }

        this.currentPhase = 'explode';
        this.stateTime = 0;

        if (this.waterBall && this.waterBall.active) {
            this.destroyWaterBall(false, 'timeout'); // timeout = explosión natural (sin daño al jugador)
        }
    }

    /**
     * Destruye la bola de agua con efecto visual
     */
    destroyWaterBallWithEffect() {
        if (!this.waterBall || !this.waterBall.active) return;

        // Efecto de expansión y desvanecimiento
        this.scene.tweens.add({
            targets: this.waterBall,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => this?.waterBall?.destroy()
        });
    }

    /**
     * Crea efecto visual de explosión
     * @param {number} radius - Radio de la explosión
     * @param {number} maxScale - Escala máxima
     * @param {number} tint - Color del tint
     * @param {number} particleCount - Número de partículas
     * @param {number} maxDistance - Distancia máxima de partículas
     */
    createExplosion(radius = 180, maxScale = 6, tint = 0x00bfff, particleCount = 20, maxDistance = 150) {
        if (this.damageApplied) return;

        // Sprite central de explosión
        const explosionSprite = this.scene.add.sprite(
            this.explosionX,
            this.explosionY,
            this.config.texture
        );

        explosionSprite.setScale(0.5);
        explosionSprite.setTint(tint);
        explosionSprite.setAlpha(0.8);

        // Animación de expansión de la explosión
        this.scene.tweens.add({
            targets: explosionSprite,
            scale: maxScale,
            alpha: 0,
            duration: this.fixedPhases.explode,
            ease: 'Cubic.easeOut',
            onComplete: () => explosionSprite.destroy()
        });

        // Ondas concéntricas de explosión
        for (let waveNum = 0; waveNum < 4; waveNum++) {
            const wave = this.scene.add.circle(
                this.explosionX,
                this.explosionY,
                radius * 0.3,
                0x4169e1,
                0.4 - (waveNum * 0.1)
            );

            this.scene.tweens.add({
                targets: wave,
                scale: 4 + (waveNum * 0.3),
                alpha: 0,
                duration: 500,
                delay: waveNum * 120, // Retraso progresivo entre ondas
                ease: 'Sine.easeOut',
                onComplete: () => wave.destroy()
            });
        }

        // Partículas de explosión que salen radialmente
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = maxDistance * 0.6 + Math.random() * maxDistance * 0.4;
            const particle = this.scene.add.circle(
                this.explosionX,
                this.explosionY,
                12 + Math.random() * 8,
                tint === 0xff4444 ? 0xff4444 : 0x87ceeb, // Color según tipo de explosión
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
                onComplete: () => particle.destroy()
            });
        }

        // Verificar daño por explosión (solo para explosión normal azul)
        if (!this.damageApplied && tint === 0x00bfff) {
            const distance = Phaser.Math.Distance.Between(
                this.explosionX, this.explosionY,
                this.player.x, this.player.y
            );

            // Si el jugador está dentro del radio de explosión
            if (distance <= radius) {
                const dir = this.player.x < this.explosionX ? -1 : 1;
                this.player.takeDamage(this.boss.damage, dir); // Dañar al jugador
                this.damageApplied = true;
                this.scene.cameras.main.shake(300, 0.02); // Sacudida fuerte de cámara
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
        this.waterBallHealth = 1; // Resetear salud para próxima bola
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
        this.waterBallHealth = 1;
    }
}
import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadWaterBallState extends BaseState {
   constructor(texture = 'water_ball') {
        super(); 
        this.texture = texture;
    }
   
   
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'spawn'; // spawn -> follow -> explode -> cooldown
        this.spawnDuration = 500;
        this.followDuration = 5000; 
        this.explodeDuration = 600;
        this.cooldownDuration = 500;
        
        // Flags para controlar estados
        this.damageApplied = false;
        this.ballDestroyed = false;
        
        this.startSpawnPhase();
        
        console.log("Bola de agua perseguidora mejorada");
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'spawn':
                if (this.stateTime >= this.spawnDuration) {
                    this.startFollowPhase();
                }
                break;
                
            case 'follow':
                this.followPlayer();
                
                // Verificar colisión con el jugador durante el seguimiento
                this.checkPlayerCollision();
                
                // SOLO iniciar explosión si la bola NO ha sido destruida
                if (this.stateTime >= this.followDuration && !this.ballDestroyed) {
                    this.startExplodePhase();
                }
                break;
                
            case 'explode':
                if (this.stateTime >= this.explodeDuration) {
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

    startSpawnPhase() {
        const { scene, waterBalls } = this.boss;
        
        this.waterBall = waterBalls.create(this.boss.x, this.boss.y - 50, this.texture);
        this.waterBall.setScale(1.4);
        this.waterBall.body.allowGravity = false;
        //this.waterBall.setTint(0x4169e1);
        
        // Propiedades de seguimiento
        this.waterBall.following = false;
        this.waterBall.speed = this.boss.waterBallSpeed;
        
        // Efecto de aparición más vistoso
        this.waterBall.setAlpha(0);
        this.waterBall.setScale(0.1);
        
        scene.tweens.add({
            targets: this.waterBall,
            alpha: 1,
            scale: 1.4,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    startFollowPhase() {
        this.currentPhase = 'follow';
        this.stateTime = 0;
        this.waterBall.following = true;
        this.ballDestroyed = false;
    }

    followPlayer() {
        if (!this.waterBall || !this.waterBall.active || !this.waterBall.following || this.ballDestroyed) return;
        
        const player = this.boss.player;
        const angle = Phaser.Math.Angle.Between(
            this.waterBall.x, this.waterBall.y,
            player.x, player.y
        );
        
        const velocityX = Math.cos(angle) * this.waterBall.speed;
        const velocityY = Math.sin(angle) * this.waterBall.speed;
        
        this.waterBall.setVelocity(velocityX, velocityY);
        
        // Efecto visual de movimiento 
        if (this.stateTime % 300 < 10) {
            this.createTrailEffect();
        }
    }

    createTrailEffect() {
        if (!this.waterBall || !this.waterBall.active || this.ballDestroyed) return;
        
        const { scene } = this.boss;
        const trail = scene.add.circle(
            this.waterBall.x,
            this.waterBall.y,
            15,
            0x87ceeb,
            0.6
        );
        
        scene.tweens.add({
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

    checkPlayerCollision() {
        if (!this.waterBall || !this.waterBall.active || this.damageApplied || this.ballDestroyed) return;
        
        const player = this.boss.player;
        const distance = Phaser.Math.Distance.Between(
            this.waterBall.x, this.waterBall.y,
            player.x, player.y
        );
        
        // Radio de colisión aumentado
        const collisionRadius = 40;
        
        if (distance <= collisionRadius) {
            const dir = player.x < this.waterBall.x ? -1 : 1;
            player.takeDamage(this.boss.damage, dir);
            this.damageApplied = true;
            this.ballDestroyed = true;
            
            // Crear efecto de impacto
            this.createImpactEffect();
            
            // Destruir bola inmediatamente después del impacto
            const { scene } = this.boss;
            
            scene.time.delayedCall(100, () => {
                if (this.waterBall && this.waterBall.active) {
                    this.waterBall.destroy();
                    
                    // Ir directamente a cooldown SIN crear explosión
                    this.startCooldownPhase();
                }
            });
        }
    }

    createImpactEffect() {
        const { scene } = this.boss;
        
        // Efecto de impacto visual
        const impactCircle = scene.add.circle(
            this.waterBall.x,
            this.waterBall.y,
            60,
            0x00bfff,
            0.7
        );
        
        // Ondas de impacto
        for (let i = 0; i < 3; i++) {
            const wave = scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                30,
                0x4169e1,
                0.5 - (i * 0.15)
            );
            
            scene.tweens.add({
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
            const particle = scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                10,
                0x87ceeb,
                0.9
            );
            
            scene.tweens.add({
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
        
        // Shake de cámara
        scene.cameras.main.shake(200, 0.015);
        
        // Destruir círculo de impacto
        scene.time.delayedCall(300, () => {
            if (impactCircle && impactCircle.active) {
                impactCircle.destroy();
            }
        });
    }

    startExplodePhase() {
        // PREVENCIÓN: Si la bola ya fue destruida, no crear explosión
        if (this.ballDestroyed || this.damageApplied) {
            this.startCooldownPhase();
            return;
        }
        
        this.currentPhase = 'explode';
        this.stateTime = 0;
        
        if (this.waterBall && this.waterBall.active) {
            // Guardar posición antes de destruir
            this.explosionX = this.waterBall.x;
            this.explosionY = this.waterBall.y;
            
            this.waterBall.following = false;
            this.waterBall.setVelocity(0, 0);
            
            // Marcar bola como destruida
            this.ballDestroyed = true;
            
            // Destruir bola con efecto
            this.destroyWaterBallWithEffect();
            
            // Crear explosión
            this.createExplosion();
        } else if (this.explosionX && this.explosionY) {
            // Si la bola ya fue destruida por colisión, usar la última posición conocida
            this.createExplosion();
        }
    }

    destroyWaterBallWithEffect() {
        if (!this.waterBall || !this.waterBall.active) return;
        
        const { scene } = this.boss;
        
        // Efecto de desvanecimiento antes de destruir
        scene.tweens.add({
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

    createExplosion() {
        // PREVENCIÓN: Si ya se aplicó daño por contacto, no crear explosión
        if (this.damageApplied) {
            return;
        }
        
        const { scene } = this.boss;
        const explosionRadius = 180; 
        
        // EFECTO DE EXPLOSIÓN PRINCIPAL
        const explosionSprite = scene.add.sprite(
            this.explosionX, 
            this.explosionY, 
            this.texture
        );
        
        explosionSprite.setScale(0.5);
        explosionSprite.setTint(0x00bfff);
        explosionSprite.setAlpha(0.8);
        
        // Animación de explosión
        scene.tweens.add({
            targets: explosionSprite,
            scale: 6, 
            alpha: 0,
            duration: this.explodeDuration,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (explosionSprite && explosionSprite.active) {
                    explosionSprite.destroy();
                }
            }
        });
        
        // ONDAS DE EXPLOSIÓN MÚLTIPLES
        for (let waveNum = 0; waveNum < 4; waveNum++) {
            const wave = scene.add.circle(
                this.explosionX,
                this.explosionY,
                explosionRadius * 0.3,
                0x4169e1,
                0.4 - (waveNum * 0.1)
            );
            
            scene.tweens.add({
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
        
        // PARTÍCULAS DE EXPLOSIÓN MÁS ABUNDANTES
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = 90 + Math.random() * 60;
            const particle = scene.add.circle(
                this.explosionX,
                this.explosionY,
                12 + Math.random() * 8,
                0x87ceeb,
                0.9
            );
            
            scene.tweens.add({
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
        
        // VERIFICAR DAÑO POR EXPLOSIÓN (solo si no hubo daño por contacto)
        if (!this.damageApplied) {
            const player = this.boss.player;
            const distance = Phaser.Math.Distance.Between(
                this.explosionX, this.explosionY,
                player.x, player.y
            );
            
            if (distance <= explosionRadius) {
                const dir = player.x < this.explosionX ? -1 : 1;
                player.takeDamage(this.boss.damage, dir);
                this.damageApplied = true;
                
                // Efecto de shake más fuerte para explosión
                scene.cameras.main.shake(300, 0.02);
            }
        }
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
        this.damageApplied = false;
        this.ballDestroyed = false;
    }
    
    // NUEVO MÉTODO
    destroyAllWarnings() {
        if (this.waterBall && this.waterBall.active) {
            this.waterBall.destroy();
            this.waterBall = null;
        }
    }

    exit(context) {
        this.destroyAllWarnings();
        this.damageApplied = false;
        this.ballDestroyed = false;
    }
}
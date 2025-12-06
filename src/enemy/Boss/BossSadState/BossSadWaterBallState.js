import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadWaterBallState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'spawn'; // spawn -> follow -> explode -> cooldown
        this.spawnDuration = 500;
        this.followDuration = 3500;
        this.explodeDuration = 500; // Reducido a 500ms
        this.cooldownDuration = 500;
        
        this.startSpawnPhase();
        
        console.log("Bola de agua perseguidora");
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
                if (this.stateTime >= this.followDuration) {
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
        
        this.waterBall = waterBalls.create(this.boss.x, this.boss.y - 50, 'water_ball');
        this.waterBall.setScale(1.2);
        this.waterBall.body.allowGravity = false;
        this.waterBall.setTint(0x4169e1);
        
        // Propiedades de seguimiento
        this.waterBall.following = false;
        this.waterBall.speed = this.boss.waterBallSpeed;
        
        // Efecto de aparición
        this.waterBall.setAlpha(0);
        scene.tweens.add({
            targets: this.waterBall,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }

    startFollowPhase() {
        this.currentPhase = 'follow';
        this.stateTime = 0;
        this.waterBall.following = true;
    }

    followPlayer() {
        if (!this.waterBall || !this.waterBall.active || !this.waterBall.following) return;
        
        const player = this.boss.player;
        const angle = Phaser.Math.Angle.Between(
            this.waterBall.x, this.waterBall.y,
            player.x, player.y
        );
        
        const velocityX = Math.cos(angle) * this.waterBall.speed;
        const velocityY = Math.sin(angle) * this.waterBall.speed;
        
        this.waterBall.setVelocity(velocityX, velocityY);
    }

    startExplodePhase() {
        this.currentPhase = 'explode';
        this.stateTime = 0;
        
        if (this.waterBall && this.waterBall.active) {
            // Guardar posición antes de destruir
            this.explosionX = this.waterBall.x;
            this.explosionY = this.waterBall.y;
            
            this.waterBall.following = false;
            this.waterBall.setVelocity(0, 0);
            this.createExplosion();
            this.waterBall.destroy();
        }
    }

    createExplosion() {
        const { scene } = this.boss;
        const explosionRadius = 150;
        
        // **VERSIÓN SIMPLE SIN TWEEN PROBLEMÁTICO**
        // Crear efecto visual de explosión
        const explosionCircle = scene.add.circle(
            this.explosionX, 
            this.explosionY, 
            explosionRadius, 
            0x4169e1, 
            0.4
        );
        
        // **EVITAR TWEEENS EN PROPIEDADES QUE SE DESTRUYEN**
        // En lugar de tween, crear múltiples círculos con diferentes tamaños
        for (let i = 0; i < 3; i++) {
            const wave = scene.add.circle(
                this.explosionX,
                this.explosionY,
                explosionRadius * 0.3,
                0x87ceeb,
                0.6 - (i * 0.2)
            );
            
            // Tween seguro - solo propiedades de transformación
            scene.tweens.add({
                targets: wave,
                scale: 3 + (i * 0.5),
                alpha: 0,
                duration: 400,
                delay: i * 100,
                onComplete: () => {
                    if (wave && wave.active) {
                        wave.destroy();
                    }
                }
            });
        }
        
        // Efecto de partículas simples
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = scene.add.circle(
                this.explosionX,
                this.explosionY,
                8,
                0x00bfff,
                0.8
            );
            
            // Tween seguro en propiedades de transformación
            scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 70,
                y: particle.y + Math.sin(angle) * 70,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => {
                    if (particle && particle.active) {
                        particle.destroy();
                    }
                }
            });
        }
        
        // **VERIFICAR DAÑO INMEDIATAMENTE**
        const player = this.boss.player;
        const distance = Phaser.Math.Distance.Between(
            this.explosionX, this.explosionY,
            player.x, player.y
        );
        
        if (distance <= explosionRadius) {
            const dir = player.x < this.explosionX ? -1 : 1;
            player.takeDamage(this.boss.damage, dir);
            
            // Efecto de shake si hace daño
            scene.cameras.main.shake(200, 0.01);
        }
        
        // **DESTRUIR EL CÍRCULO PRINCIPAL DESPUÉS DE UN TIEMPO CORTO**
        scene.time.delayedCall(300, () => {
            if (explosionCircle && explosionCircle.active) {
                explosionCircle.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Limpiar bola de agua si aún existe
        if (this.waterBall && this.waterBall.active) {
            this.waterBall.destroy();
        }
    }
}
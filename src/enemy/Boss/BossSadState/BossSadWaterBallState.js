import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadWaterBallState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'spawn'; // spawn -> follow -> explode -> cooldown
        this.spawnDuration = 500;
        this.followDuration = 3500;
        this.explodeDuration = 500;
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
            this.waterBall.following = false;
            this.waterBall.setVelocity(0, 0);
            this.createExplosion();
            this.waterBall.destroy();
        }
    }

    createExplosion() {
        const { scene } = this.boss;
        const explosionRadius = 100;
        
        // Crear efecto visual de explosión
        const explosionCircle = scene.add.circle(
            this.waterBall.x, 
            this.waterBall.y, 
            explosionRadius, 
            0x4169e1, 
            0.3
        );
        
        // Efecto de partículas
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = scene.add.circle(
                this.waterBall.x,
                this.waterBall.y,
                10,
                0x87ceeb,
                0.7
            );
            
            scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 50,
                y: particle.y + Math.sin(angle) * 50,
                alpha: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
        
        // Verificar daño al jugador
        const distance = Phaser.Math.Distance.Between(
            this.waterBall.x, this.waterBall.y,
            this.boss.player.x, this.boss.player.y
        );
        
        if (distance <= explosionRadius) {
            const dir = this.boss.player.x < this.waterBall.x ? -1 : 1;
            this.boss.player.takeDamage(this.boss.damage, dir);
        }
        
        // Remover el círculo después de un tiempo
        scene.time.delayedCall(300, () => {
            explosionCircle.destroy();
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
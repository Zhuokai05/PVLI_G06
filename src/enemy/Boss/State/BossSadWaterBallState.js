import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadWaterBallState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> follow -> explode -> cooldown
        this.attackDuration = 500;
        this.followDuration = 3500;
        this.explodeDuration = 500;
        this.cooldownDuration = 500;
        
        this.spawnWaterBall();
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'attack':
                if (this.stateTime >= this.attackDuration) {
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

    spawnWaterBall() {
        const { scene, waterBalls } = this.boss;
        const bossX = this.boss.x;
        const bossY = this.boss.y;
        
        this.waterBall = waterBalls.create(bossX, bossY - 50, 'water_ball');
        // Reducir tamaño 
        this.waterBall.setScale(1);
        this.waterBall.body.allowGravity = false;
        this.waterBall.setTint(0x4169e1);
        
        // Propiedades de seguimiento
        this.waterBall.following = true;
        this.waterBall.speed = this.boss.waterBallSpeed;
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

    startFollowPhase() {
        this.currentPhase = 'follow';
        this.stateTime = 0;
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
        const explosionRadius = 80; 
        
        // Crear efecto visual de explosión
        const explosionCircle = scene.add.circle(
            this.waterBall.x, 
            this.waterBall.y, 
            explosionRadius, 
            0x4169e1, 
            0.3
        );
        
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
        if (this.waterBall && this.waterBall.active) {
            this.waterBall.destroy();
        }
    }
}
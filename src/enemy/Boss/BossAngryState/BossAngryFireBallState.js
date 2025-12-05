import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryFireBallState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        
        this.timeSinceLastSpawn = 0;
        this.attackDuration = 6000;
        this.cooldownDuration = 500;
        this.spawnInterval = 500;
        this.columnSpread = 100;
        this.numColumns = 8;    
        
        this.columns = this.generateColumns();

        console.log("lanza bolas")
    }

    execute(context, time, delta) {
        this.stateTime += delta;
        this.timeSinceLastSpawn += delta;
        
        switch (this.currentPhase) {
            case 'attack':
                if (this.timeSinceLastSpawn >= this.spawnInterval) {
                    this.spawnColumnFireballs();
                    this.timeSinceLastSpawn = 0;
                }
                if (this.stateTime >= this.attackDuration) {
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

    generateColumns() {
        const columns = [];
        const half = Math.floor(this.numColumns / 2);

        for (let i = 0; i < this.numColumns; i++) {
            let offset = (i - half) * this.columnSpread;
            let x = this.boss.x + offset;
            columns.push(x);
        }

        return columns;
    }

    spawnColumnFireballs() {
        const scene = this.boss.scene;
        let fireballs = this.boss.fireballs;

        const colX = Phaser.Math.RND.pick(this.columns);

        let fireball = fireballs.create(colX, this.boss.y - 150, 'fire_ball');

        fireball.setScale(1.4);
        fireball.body.allowGravity = false;
        fireball.setVelocityY(this.boss.fireballSpeed);
        fireball.setCollideWorldBounds(false);

        this.autoCleanup(fireball);
    }

     autoCleanup(fireball) {
        const scene = this.boss.scene;

        scene.events.on('update', () => {
            if (!fireball.active) return;

            if (fireball.y > this.boss.y + this.boss.distanceToFloor + 150) {
                fireball.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        
    }
}
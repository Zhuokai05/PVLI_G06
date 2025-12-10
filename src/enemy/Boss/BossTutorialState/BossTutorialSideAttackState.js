import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

export default class BossTutorialSideAttackState extends BaseBossAttackState {
    constructor() {
        super({
            texture: 'tutorial',
            attackName: 'Ataque Lateral',
            phases: ['warning', 'attack', 'finish'],
            warningDuration: 1000,
            attackDuration: 2000,
            cooldownDuration: 2000
        });
        
        this.initialY = 0;
        this.direction = '';
        this.tween = null;
    }
    
    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.player = this.boss.player;
        
        this.boss._hitPlayerThisSweep = false;
        this.initialY = this.boss.y;
        
        if (this.boss.body) {
            this.boss.body.moves = false;
        }
        
        super.enter(context);
    }
    
    createWarning() {
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView || { x: 0, width: 800, height: 600 };
        
        this.direction = (this.boss.x < worldView.x + worldView.width / 2) ? 'right' : 'left';
        
        // Crear advertencia
        const warningRect = this.createWarningRectangle(
            worldView.x + worldView.width / 2,
            this.initialY,
            worldView.width,
            120,
            0xff0000,
            0.4
        );
        
        // Flechas direccionales
        this.createDirectionArrows();
    }
    
    createDirectionArrows() {
        const worldView = this.scene.cameras.main.worldView || { width: 800 };
        const centerX = worldView.x + worldView.width / 2;
        
        for (let i = 0; i < 3; i++) {
            const arrowX = this.direction === 'right' 
                ? centerX - worldView.width / 4 + (i * 80)
                : centerX + worldView.width / 4 - (i * 80);
            
            const arrow = this.createArrow(arrowX, this.initialY, this.direction);
            
            this.scene.tweens.add({
                targets: arrow,
                x: this.direction === 'right' ? arrowX + 20 : arrowX - 20,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    createArrow(x, y, direction) {
        const arrow = this.scene.add.graphics();
        arrow.fillStyle(0xff4444, 0.8);
        
        arrow.beginPath();
        arrow.moveTo(x, y);
        
        if (direction === 'right') {
            arrow.lineTo(x - 30, y - 15);
            arrow.lineTo(x - 30, y + 15);
        } else {
            arrow.lineTo(x + 30, y - 15);
            arrow.lineTo(x + 30, y + 15);
        }
        
        arrow.closePath();
        arrow.fillPath();
        
        return arrow;
    }
    
    executeAttack() {
        this.startSideSweep();
    }
    
    startSideSweep() {
        const cam = this.scene.cameras.main;
        const worldView = cam.worldView || { x: 0, width: 800 };
        
        const fromX = this.direction === 'right' ? worldView.x + 50 : worldView.x + worldView.width - 50;
        const toX = this.direction === 'right' ? worldView.x + worldView.width - 50 : worldView.x + 50;
        
        this.boss.x = fromX;
        this.boss.y = this.initialY;
        this.boss.flipX = (this.direction === 'right');
        
        if (this.boss.body) {
            this.boss.body.moves = true;
        }
        
        this.tween = this.scene.tweens.add({
            targets: this.boss,
            x: toX,
            duration: this.config.attackDuration,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                this.boss.y = this.initialY;
            },
            onComplete: () => {
                if (!this.boss._hitPlayerThisSweep) {
                    this.boss.takeDamage(1);
                }
                
                if (this.boss.body) {
                    this.boss.body.setVelocity(0, 0);
                    this.boss.body.moves = false;
                }
                
                this.currentPhase = 'finish';
                this.stateTime = 0;
            }
        });
    }
    
    execute(context, time, delta) {
        super.execute(context, time, delta);
        
        if (this.currentPhase === 'finish') {
            this.stateTime += delta;
            if (this.stateTime >= this.config.cooldownDuration) {
                this.boss.selectNextState();
            }
        }
    }
    
    exit(context) {
        super.exit(context);
        context._hitPlayerThisSweep = false;
    }
}
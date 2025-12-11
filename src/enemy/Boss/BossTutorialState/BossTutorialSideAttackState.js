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
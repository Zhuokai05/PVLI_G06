import StateMachine from '../../stateMachine/StateMachine.js';
import BossFearHeartState from './BossFearState/BossFearHeartState.js';
import BossFearPhase2State from './BossFearState/BossFearPhase2State.js';
import BossFearCupGameState from './BossFearState/BossFearCupGameState.js';
import BossFearClawAttackState from './BossFearState/BossFearClawAttackState.js';

export default class BossFear extends Phaser.GameObjects.Container {
    constructor(scene, x, y, player) {
        super(scene, x, y);
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);

        // Stats
        this.phase = 1;
        this.health = 10;
        this.maxHealth = 10;

        // Referencia al corazón para que persista entre estados
        this.heart = null;

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'bossFear');
        this.stateMachine.addState('heart', new BossFearHeartState());
        this.stateMachine.addState('phase2', new BossFearPhase2State());
        this.stateMachine.addState('cupGame', new BossFearCupGameState());
        this.stateMachine.addState('clawAttack', new BossFearClawAttackState());
        
        this.stateMachine.setState('heart');
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
    }

    takeDamage(damage) {
        this.health -= damage;
        console.log(this.player)
        console.log(this)
        console.log(`BossFear salud: ${this.health}/${this.maxHealth} (Fase ${this.phase})`);

        if (this.health <= 0) {
            if (this.phase === 1) {
                this.startPhase2();
            } else {
                this.die();
            }
        }
    }

    startPhase2() {
        console.log('INICIANDO FASE 2');
        this.phase = 2;
        this.health = this.maxHealth;
        
        this.scene.cameras.main.shake(500, 0.02);
        
        this.stateMachine.setState('phase2');
    }

    die() {
        console.log('BossFear derrotado definitivamente!');
        // Destruir el corazón también
        if (this.heart) {
            this.heart.destroy();
        }
        this.destroy();
    }

    getCupSpeed() {
        const healthPercentage = this.health / this.maxHealth;
        // VELOCIDAD MÁS LENTA: de 1200ms a 600ms 
        return 1200 - (healthPercentage * 600);
    }
}
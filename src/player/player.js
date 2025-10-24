import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './PlayerIdleState.js';
import PlayerMoveState from './PlayerMoveState.js';
import PlayerJumpState from './PlayerJumpState.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player'); 

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5;
        this.direction = 1; // 1 derecha, -1 izquierda
        this.hasDash = false;
        this.hasShield = false;
        this.grounded = false;
        this.movementSpeed = 300;
        this.jumpSpeed = 600;

        this.keys = scene.inputManager.keys;

       this.stateMachine = new StateMachine(this, 'player');
       this.stateMachine
        .addState('idle', new PlayerIdleState())
        .addState('move', new PlayerMoveState())
        .addState('jump', new PlayerJumpState())
        .setState('idle');
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
    }

    takeDamage(amount) {

        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.setVelocity(0, 0);
    }

    isGrounded() {
        return this.body.onFloor();
    }
}
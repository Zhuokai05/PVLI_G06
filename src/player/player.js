import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerMeleeAttackState from './States/PlayerMeleeAttackState.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'angel_sword_idle'); 

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5;
        this.damage = 1;
        this.direction = 1; // 1 derecha, -1 izquierda
        this.hasDash = false;
        this.hasShield = false;
        this.grounded = false;
        this.movementSpeed = 300;
        this.jumpSpeed = 600;
        this.attackCooldown = 300;
        this.meleeAttackDist = 50;
        this.meleeAttackWidge = 50;
        this.meleeAttackHeight = 50;

        this.keys = scene.inputManager.keys;

       this.stateMachine = new StateMachine(this, 'player');
       this.stateMachine
        .addState('idle', new PlayerIdleState())
        .addState('move', new PlayerMoveState())
        .addState('jump', new PlayerJumpState())
        .addState('attack', new PlayerMeleeAttackState())
        .setState('idle');
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
        this.attackDir = this.getAttackDirection();
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

    getAttackDirection() {
        let { upArrow, downArrow, leftArrow, rightArrow } = this.keys;

        let JustDown = Phaser.Input.Keyboard.JustDown;

        if (JustDown(upArrow))   return 'up';
        if (JustDown(downArrow)) return 'down';
        if (JustDown(leftArrow)) return 'left';
        if (JustDown(rightArrow))return 'right';

        return null;
    }

    meleeAttack(direction) {

        if (this.attackCooldownTimer > 0) return;

        console.log("attack")

        this.attackCooldownTimer = this.attackCooldown; 

        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.isAttacking = false;
            this.attackCooldownTimer = 0;
        });

        let offsetX = 0, offsetY = 0;

        switch (direction) {
            case 'left': offsetX = -this.meleeAttackDist; break;
            case 'right': offsetX = this.meleeAttackDist; break;
            case 'up': offsetY = -this.meleeAttackDist; break;
            case 'down': offsetY = this.meleeAttackDist; break;
        }

        let hitbox = this.scene.add.rectangle(this.x + offsetX, this.y + offsetY, this.meleeAttackWidge, this.meleeAttackHeight, 0xff0000, 0.5);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        let hitEnemies = new Set();
        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {

            if (hitEnemies.has(enemy)) return; 
            hitEnemies.add(enemy);

            enemy.takeDamage?.(this.damage);

            let knockback = 50 * (enemy.x < this.x ? -1 : 1);
            enemy.setVelocityX(knockback);

        });

        this.scene.time.delayedCall(100, () => hitbox.destroy());
    }
}
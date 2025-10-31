import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerMeleeAttackState from './States/PlayerMeleeAttackState.js';
import PlayerDeathState from './States/PlayerDeathState.js';
import PlayerKnockbackState from './States/PlayerKnockbackState.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'angel_sword_idle'); 

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5;
        this.maxHealth = 5;
        this.damage = 1;
        this.direction = 1; // 1 derecha, -1 izquierda
        this.hasDash = false;
        this.hasShield = false;
        this.grounded = false;
        this.movementSpeed = 300;
        this.jumpSpeed = 800;
        this.attackCooldown = 300;
        this.meleeAttackDist = 80;
        this.meleeAttackWidge = 120;
        this.meleeAttackHeight = 70;
        this.invulnerableTime = 1000;
        this.knockbackTime = 200;
        this.knockbackDistance = 200;

        this.keys = scene.inputManager.keys;

       this.stateMachine = new StateMachine(this, 'player');
       this.stateMachine
        .addState('idle', new PlayerIdleState())
        .addState('move', new PlayerMoveState())
        .addState('jump', new PlayerJumpState())
        .addState('attack', new PlayerMeleeAttackState())
        .addState('knockback', new PlayerKnockbackState())
        .addState('dead', new PlayerDeathState())
        .setState('idle');
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
        this.attackDir = this.getAttackDirection();
    }

    takeDamage(damage,knockbackdirection) {

        if (this.invulnerable) return;


        this.setTint(0xff0000);
        this.scene.time.delayedCall(this.invulnerableTime*0.8, () => this.clearTint());

        this.invulnerable = true;

        if (knockbackdirection){
            this.stateMachine.setState('knockback', knockbackdirection);
        }

        this.health -= damage;
        this.emit('healthChanged', this.health);
        console.log(damage + ' daño recibido. Vida: ', + this.health);

        this.scene.time.delayedCall(this.invulnerableTime, () => (this.invulnerable = false));

        if (this.health <= 0) {
        this.die();
        }
    }

    die() {
        console.log('jugador muerto');
        this.setVelocity(0, 0);
        this.stateMachine.setState('dead');
    }

    isGrounded() {
        return this.body.onFloor();
    }

    getAttackDirection() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.upArrow))   return 'up';
        if (Phaser.Input.Keyboard.JustDown(this.keys.downArrow)) return 'down';
        if (Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)) return 'left';
        if (Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)) return 'right';

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

        let w = this.meleeAttackWidge;
        let h = this.meleeAttackHeight;

        switch (direction) {
            case 'left': 
                offsetX = -this.meleeAttackDist; 
                break;
            case 'right': 
                offsetX = this.meleeAttackDist; 
                break;
            case 'up': 
                offsetY = -this.meleeAttackDist; 
                [w,h] = [h,w]   
                break;
            case 'down': 
                offsetY = this.meleeAttackDist; 
                [w,h] = [h,w] 
                break;
        }

        let hitbox = this.scene.add.rectangle(this.x + offsetX, this.y + offsetY, h, w, 0xff0000, 0.5);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        let hitEnemies = new Set();
        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {

            if (hitEnemies.has(enemy)) return; 
            hitEnemies.add(enemy);

            enemy.takeDamage(this.damage);

        });

        this.scene.time.delayedCall(100, () => hitbox.destroy());
    }
}
import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryAttackState from './State/BossAngryAttackState.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'ira');
        this.scene = scene;
        this.player = player;

        // Agregar al mundo fisico
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Tamano visual grande
        this.setScale(4.3);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;

        // Collider mas pequeno
        const colliderWidth = spriteWidth / 15;
        const colliderHeight = spriteHeight / 15;

        const offsetX = spriteWidth / 8;
        const offsetY = spriteHeight / 8;

        this.body.setSize(colliderWidth, colliderHeight);
        this.body.setOffset(offsetX, offsetY);

        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Stats
        this.health = 3;
        this.damage = 1;
        this.attackCooldown = 3000;
        this.fireballSpeed = 300;

        // Grupo de bolas de fuego
        this.fireballs = this.scene.physics.add.group();

        // Estado
        this.stateMachine = new StateMachine(this, 'boss');
        this.stateMachine
            .addState('attack', new BossAngryAttackState())
            .setState('attack');

        // Colision entre bolas de fuego y el jugador
        this.fireballOverlap = scene.physics.add.overlap(
            this.fireballs,
            this.player,
            this.FireballCollisionWithPlayer,
            null,
            this
        );
    }

    FireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;

        // Calcular direccion del golpe para knockback
        const knockbackDirection = player.x < fireball.x ? 1 : -1;

        // Aplicar dano y knockback
        player.takeDamage(this.damage, knockbackDirection);

        // Destruir la bola de fuego
        fireball.destroy();
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
    }

    takeDamage(damage) {
        this.health -= damage;
        console.log(`Boss recibio ${damage} de dano. Vida restante: ${this.health}`);

        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log('Boss derrotado');
        this.destroy();
    }
}


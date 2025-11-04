import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryAttackState from './State/BossAngryAttackState.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'ira');
        this.scene = scene;

        // Agregar al mundo fisico
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Tamano visual grande
        this.setScale(4.3);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;

        // Nuevo tamano del collider
        const colliderWidth = spriteWidth / 15;
        const colliderHeight = spriteHeight / 15;

        // Calcular offsets
        const offsetX = spriteWidth / 8;
        const offsetY = spriteHeight / 8;

        // Aplicar tamano y posicion del collider 
        this.body.setSize(colliderWidth, colliderHeight);
        this.body.setOffset(offsetX, offsetY);

        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        // Estadisticas
        this.health = 3; 
        this.damage = 1;
        this.attackCooldown = 3000; // intervalo base de ataque
        this.fireballSpeed = 300;

        // Grupo de bolas de fuego
        this.fireballs = this.scene.physics.add.group();

        // Maquina de estados
        this.stateMachine = new StateMachine(this, 'boss');
        this.stateMachine
            .addState('attack', new BossAngryAttackState())
            .setState('attack');

        // Las bolas de fuego danan al jugador
        this.scene.physics.add.overlap(this.fireballs, this.scene.player, (obj1, obj2) => {
            let fireball, player;

            if (obj1.texture.key === 'fire_ball') {
            fireball = obj1;
            player = obj2;
            } else {
            fireball = obj2;
            player = obj1;
            }

            if (player && typeof player.takeDamage === 'function') {
                player.takeDamage(this.damage);
            }

            if (fireball && fireball.active) {
                fireball.destroy();
            }
        });
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);
    }

    takeDamage(damage) {
        this.health -= damage;
        console.log(`Boss recibio ${damage} dano. Vida restante: ${this.health}`);

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

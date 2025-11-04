import StateMachine from '../../stateMachine/StateMachine.js';
import BossAngryFireBallState from './State/BossAngryFireBallState.js';
import BossAngryPunchState from './State/BossAngryPunchState.js';

export default class BossAngry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'ira');
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(4.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);

        const spriteWidth = this.displayWidth;
        const spriteHeight = this.displayHeight;
        this.body.setSize(spriteWidth / 15, spriteHeight / 15);
        this.body.setOffset(spriteWidth / 8, spriteHeight / 8);

        // Stats
        this.phase = 1;
        this.health = 5;
        this.maxHealth = 5;
        this.damage = 1;
        this.fireballSpeed = 500;
        this.punchSpeed = 1000;

        // Grupos
        this.fireballs = scene.physics.add.group();
        this.punches = scene.physics.add.group();

        // Maquina de estados
        this.punchState = new BossAngryPunchState();
        this.fireballState = new BossAngryFireBallState();
        this.stateMachine = new StateMachine(this, 'boss');

        // Solo el puno activo al inicio
        this.activeStates = [this.punchState];
        this.punchState.enter(this);

        // Colisiones
        this.fireballOverlap = scene.physics.add.overlap(
            this.fireballs,
            this.player,
            this.FireballCollisionWithPlayer,
            null,
            this
        );
        this.punchOverlap = scene.physics.add.overlap(
            this.punches,
            this.player,
            this.PunchCollisionWithPlayer,
            null,
            this
        );
    }

    FireballCollisionWithPlayer(player, fireball) {
        if (!fireball.active || !player.active) return;
        const dir = player.x < fireball.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
        fireball.destroy();
    }

    PunchCollisionWithPlayer(player, punch) {
        if (!punch.active || !player.active) return;
        const dir = player.x < punch.x ? -1 : 1;
        player.takeDamage(this.damage, dir);
    }

    update(time, delta) {
        // Ejecutar todos los estados activos
        for (const state of this.activeStates) {
            state.execute(this, time, delta);
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());

        if (this.health <= 0) this.nextPhase();
    }

nextPhase() {
    if (this.phase === 1) {
        console.log('Boss entra en FASE 2');
        this.phase = 2;
        this.health = this.maxHealth + 3;

        // Efecto visual y pausa de 2 segundos
        this.setActive(false);
        this.setVisible(false);
        this.scene.cameras.main.shake(800, 0.02); // vibracion camara

        // Efecto de desaparicion 
        this.scene.cameras.main.flash(500, 255, 50, 0);

        // Esperar y revivir
        this.scene.time.delayedCall(2000, () => {
            this.setActive(true);
            this.setVisible(true);

            // Pequeno efecto de aparicion
            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 800,
                ease: 'Sine.easeInOut'
            });

            // Anadir bola de fuego
            this.fireballState.enter(this);
            this.activeStates.push(this.fireballState);
        });
    } else {
        this.die();
    }
}

    die() {
        console.log('Boss derrotado definitivamente');
        this.destroy();
    }
}

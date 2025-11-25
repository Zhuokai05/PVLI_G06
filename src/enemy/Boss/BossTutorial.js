import StateMachine from '../../stateMachine/StateMachine.js';
import BossTutorialSideAttackState from './BossTutorialState/BossTutorialSideAttackState.js';
import BossTutorialJumpAttackState from './BossTutorialState/BossTutorialJumpAttackState.js';
import BossTutorialCooldownState from './BossTutorialState/BossTutorialCooldownState.js';

export default class BossTutorial extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tutorial');
        this.scene = scene;
        this.player = player;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Escala y colisiones base
        this.setScale(2);
        this.setCollideWorldBounds(true);

        // Ajustes del body (puedes afinar offsets/tamaños)
        const spriteW = this.displayWidth;
        const spriteH = this.displayHeight;
        this.body.setSize(spriteW * 0.45, spriteH * 0.4);
        this.body.setOffset(0, spriteH * 0.05);

        // Stats
        this.phase = 1;
        this.health = 6;
        this.maxHealth = 6;
        this.damage = 1;

        // Cooldown
        this.startCooldown = 3000;
        this.attackCooldown = this.startCooldown;
        this.minCooldown = 3000;   
        this.maxCooldown = 3000;  

        // Máquina de estados
        this.stateMachine = new StateMachine(this, 'bossTutorial');
        this.stateMachine.addState('sideAttack', new BossTutorialSideAttackState());
        this.stateMachine.addState('jumpAttack', new BossTutorialJumpAttackState());
        this.stateMachine.addState('cooldown', new BossTutorialCooldownState());

        // estados disponibles según fase
        this.availableStates = ['sideAttack']; // fase 1 solo sideAttack

        // Colisión entre boss y player (para detectar golpe cuerpo a cuerpo)
        this.bossPlayerOverlap = scene.physics.add.overlap(
            this,
            this.player,
            this.onHitPlayer,
            null,
            this
        );

        // Flag para saber si golpeó al player durante un sweep
        this._hitPlayerThisSweep = false;

        // Alive flag - CAMBIADO: usar notdead como BossAngry
        this.notdead = true;

        // Iniciar en cooldown para espaciar primera acción
        this.attackCooldown = this.startCooldown;
        this.stateMachine.setState('cooldown');
    }

    // Maneja colisión directa boss <-> player
    onHitPlayer(boss, player) {
        if (!boss.active || !player.active) return;
        // evitar múltiples triggers muy seguidos
        if (player._recentlyHitByBoss) return;

        // Marca que el boss ha alcanzado al player en este sweep
        this._hitPlayerThisSweep = true;

        // Estrella de dirección para knockback
        const dir = (player.x < boss.x) ? -1 : 1;
        player.takeDamage(this.damage, dir);

        // Pequeño cooldown en el player para evitar daño repetido instantáneo
        player._recentlyHitByBoss = true;
        this.scene.time.delayedCall(300, () => { if (player) player._recentlyHitByBoss = false; });
    }

    generateNewCooldown() {
        this.attackCooldown = 3000;
    }

    startRandomState() {
        const s = Phaser.Math.RND.pick(this.availableStates);
        this.stateMachine.setState(s);
    }

    selectNextState() {
        this.generateNewCooldown();
        this.stateMachine.setState('cooldown');
    }

    update(time, delta) {
        // CAMBIADO: usar notdead como BossAngry
        if (this.notdead) {
            this.stateMachine.step(time, delta);
        }
    }

    takeDamage(damage) {
        // CAMBIADO: Verificar notdead como BossAngry
        if (!this.notdead) return;
        
        this.health -= damage;
        this.setTint(0xff0000);
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => { this.clearTint(); this.setAlpha(1); }
        });

        if (this.health <= 0) {
            this.nextPhase();
        }
    }

    nextPhase() {
        if (this.phase === 1) {
            // pasar a fase 2
            this.phase = 2;
            // regenerar vida (puedes ajustar)
            this.maxHealth = 9;
            this.health = this.maxHealth;
            // añadir jumpAttack a disponibles
            this.availableStates.push('jumpAttack');

            // Actualizar cooldowns para fase 2 también a 3 segundos
            this.minCooldown = 3000;
            this.maxCooldown = 3000;

            // Pequeña pausa/efecto
            this.scene.cameras.main.shake(600, 0.02);
            this.scene.time.delayedCall(1000, () => {
                this.generateNewCooldown();
                this.stateMachine.setState('cooldown');
            });
        } else {
            this.notdead = false;
            this.setVisible(false);
            this.die();
        }
    }

    die() {
        console.log('Boss Tutorial derrotado definitivamente');
        this.scene.time.delayedCall(2000, () => {   
            // Lanzar escena Win antes de destruir
            this.scene.scene.launch('Win');
            this.destroy();
        });
    }
}
import BaseBossAttackState from '../BaseBossAttackState.js';

export default class BossAngryFireBallState extends BaseBossAttackState {
    constructor(texture = 'fire_ball') {
        super({
            texture: texture,
            attackName: 'Bolas de Fuego',
            phases: ['attack', 'cooldown'], // Sin fase de warning
            attackDuration: 6000,
            cooldownDuration: 500,
            logOnEnter: true
        });

        this.timeSinceLastSpawn = 0;
        this.spawnInterval = 500;
        this.columnSpread = 100;
        this.numColumns = 8;
        this.columns = [];
    }

    enter(context) {
        super.enter(context);
        this.columns = this.generateColumns();
    }

    execute(context, time, delta) {
        this.stateTime += delta;
        this.timeSinceLastSpawn += delta;

        switch (this.currentPhase) {
            case 'attack':
                if (this.timeSinceLastSpawn >= this.spawnInterval) {
                    this.spawnColumnFireballs();
                    this.timeSinceLastSpawn = 0;
                }
                if (this.stateTime >= this.config.attackDuration) {
                    this.startCooldownPhase();
                }
                break;

            case 'cooldown':
                if (this.stateTime >= this.config.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    generateColumns() {
        const columns = [];
        const half = Math.floor(this.numColumns / 2);

        for (let i = 0; i < this.numColumns; i++) {
            let offset = (i - half) * this.columnSpread;
            let x = this.boss.x + offset;
            columns.push(x);
        }

        return columns;
    }

    createWarning() {
        // Este ataque no tiene fase de warning
        this.startAttackPhase();
    }

    executeAttack() {
        // El ataque se ejecuta continuamente durante la fase attack
        // La lógica está en el método execute()
    }

    spawnColumnFireballs() {
        const colX = Phaser.Math.RND.pick(this.columns);
        const fireball = this.boss.fireballs.create(colX, this.boss.y - 350, this.config.texture);
        fireball.play('fireball_move');

        fireball.setScale(4);
        fireball.body.allowGravity = false;
        fireball.setVelocityY(this.boss.fireballSpeed);
        fireball.setCollideWorldBounds(false);

        const nuevoAncho = 12;
        const nuevaAlto = 24;

        fireball.body.setSize(nuevoAncho, nuevaAlto);
        const offsetX = (32 - nuevoAncho) / 2;
        const offsetY = (32 - nuevaAlto) / 2;

        fireball.body.setOffset(offsetX, offsetY);

        this.autoCleanup(fireball);
    }

    autoCleanup(fireball) {
        const scene = this.boss.scene;
        if (this.boss && this.boss.scene) {
            this.boss.scene.time.delayedCall(3000, () => {
                if (fireball.active) fireball.destroy();
            });
        }
    }
}
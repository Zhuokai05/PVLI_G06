import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de bolas de fuego para el jefe Ira
 * @class BossAngryFireBallState
 * @extends BaseBossAttackState
 */
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

    /**
     * Entra al estado de bolas de fuego
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        this.boss = context;
        super.enter(context);
        this.columns = this.generateColumns();
        this.boss.play({ key: 'bossira_attack', repeat: 5 });
    }

    /**
     * Ejecuta la lógica del estado de bolas de fuego
     * @param {Object} context - Contexto del boss
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
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

    /**
     * Genera las columnas donde aparecerán las bolas de fuego
     * @returns {Array} - Array de posiciones X de las columnas
     */
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

    /**
     * Crea advertencias (este ataque no tiene fase de warning)
     */
    createWarning() {
        // Este ataque no tiene fase de warning
        this.startAttackPhase();
    }

    /**
     * Ejecuta el ataque de bolas de fuego
     */
    executeAttack() {
        // El ataque se ejecuta continuamente durante la fase attack
        // La lógica está en el método execute()
    }

    /**
     * Genera bolas de fuego en una columna aleatoria
     */
    spawnColumnFireballs() {
        const colX = Phaser.Math.RND.pick(this.columns);
        
        // Usar create de Phaser en lugar del grupo específico
        const fireball = this.scene.physics.add.sprite(colX, this.boss.y - 350, this.config.texture);
        
        // Añadir al grupo de ataques del boss
        this.boss.addAttack(fireball);
        
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

    /**
     * Configura la auto-destrucción de las bolas de fuego
     * @param {Phaser.GameObjects.Sprite} fireball - Bola de fuego a limpiar
     */
    autoCleanup(fireball) {
        this.scene.time.delayedCall(3000, () => {
            if (fireball.active) fireball.destroy();
        });
    }
}
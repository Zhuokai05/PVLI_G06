import BaseBoss from './BaseBoss/BaseBoss.js';
import BossTutorialSideAttackState from './BossTutorialState/BossTutorialSideAttackState.js';
import BossTutorialJumpAttackState from './BossTutorialState/BossTutorialJumpAttackState.js';
import BossTutorialCooldownState from './BossTutorialState/BossTutorialCooldownState.js';

/**
 * Jefe del tutorial
 * @class BossTutorial
 * @extends BaseBoss
 */
export default class BossTutorial extends BaseBoss {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tutorial', undefined, player, {
            health: 9,
            maxHealth: 12,
            damage: 1,
            startCooldown: 3000,
            minCooldown: 3000,
            maxCooldown: 3000,
            availableStates: ['sideAttack'],
            bossName: 'tutorial'
        });

        this.setScaleAndBody(2, 0.45, 0.4, 0, 0.05);
        this._hitPlayerThisSweep = false;
        this.setupStates();
    }

    /**
     * Configura escala y cuerpo del jefe Tutorial
     * @param {number} scale - Escala del sprite
     * @param {number} widthRatio - Ratio de ancho del cuerpo
     * @param {number} heightRatio - Ratio de alto del cuerpo
     * @param {number} offsetX - Offset X del cuerpo
     * @param {number} offsetY - Offset Y del cuerpo
     */
    setScaleAndBody(scale, widthRatio = 0.45, heightRatio = 0.4, offsetX = 0, offsetY = 0.05) {
        this.setScale(scale);
        this.body.setSize(this.displayWidth * widthRatio, this.displayHeight * heightRatio);
        this.body.setOffset(this.displayWidth * offsetX, this.displayHeight * offsetY);
    }

    /**
     * Reproduce la intro del jefe Tutorial
     */
    playIntro() {
        this.setVisible(true);
        this.setActive(true);
        this.setLife();
        this.scene.events.emit('bossIntroFinished');
    }

    /**
     * Configura los estados específicos del jefe Tutorial
     */
    setupStates() {
        this.addState('sideAttack', new BossTutorialSideAttackState());
        this.addState('jumpAttack', new BossTutorialJumpAttackState());
        this.addState('cooldown', new BossTutorialCooldownState());
    }

    /**
     * Configura las colisiones específicas del jefe Tutorial
     */
    setupCollisions() {
        super.setupCollisions();
        
        if (!this.colliders.bossPlayerOverlap) {
            this.registerCollider('bossPlayerOverlap', this.scene.physics.add.overlap(
                this,
                this.player,
                this.onHitPlayer,
                null,
                this
            ));
        }
    }

    /**
     * Maneja colisión directa con el jugador
     * @param {Object} boss - Referencia al boss
     * @param {Object} player - Jugador que colisiona
     */
    onHitPlayer(boss, player) {
        if (!boss.active || !player.active || player._recentlyHitByBoss) return;
        
        this._hitPlayerThisSweep = true;
        const dir = player.x < boss.x ? -1 : 1;
        player.takeDamage(this.damage, dir);

        player._recentlyHitByBoss = true;
        this.scene.time.delayedCall(300, () => {
            player._recentlyHitByBoss = false;
        });
    }

    /**
     * Obtiene el color del tint para el daño de Tutorial
     * @returns {number} - Color rojo
     */
    getDamageTintColor() {
        return 0xff0000;
    }

    /**
     * Avanza a la siguiente fase del jefe Tutorial
     */
    nextPhase() {
        if (this.phase === 1) {
            this.phase = 2;
            this.health = this.maxHealth + 3;
            this.availableStates.push('jumpAttack');
            
            this.handlePhaseTransition();
        } else {
            this.die();
        }
    }

    /**
     * Maneja la transición entre fases del jefe Tutorial
     */
    handlePhaseTransition() {
        this.cleanupAllWarnings();
        this.destroyAllAttackObjects();
        this.stateMachine?.setState('inactive');

        this.setActive(false).setVisible(false);
        this.isActivated = false;
        
        this.scene.cameras.main.shake(600, 0.02).flash(500, 255, 50, 50);

        this.scene.time.delayedCall(2000, () => {
            this.setActive(true).setVisible(true);
            this.isActivated = true;
            this.resetAllCollisions();

            this.scene.tweens.add({
                targets: this,
                alpha: { from: 0, to: 1 },
                duration: 800,
                ease: 'Sine.easeInOut'
            });

            this.generateNewCooldown();
            this.stateMachine.setState('cooldown');
        });
    }

    /**
     * Maneja la muerte del jefe Tutorial
     */
    die() {
        // Desactivar físicas antes de morir
        if (this.body) {
            this.body.enable = false;
            this.body.checkCollision.none = true;
        }
        super.die();
    }

    /**
     * Limpia todas las advertencias visuales
     */
    cleanupAllWarnings() {
        super.cleanupAllWarnings();
        this._hitPlayerThisSweep = false;
    }

    /**
     * Resetea el flag de golpe al jugador
     */
    resetHitFlag() {
        this._hitPlayerThisSweep = false;
    }

    /**
     * Verifica si golpeó al jugador en este barrido
     * @returns {boolean} - True si golpeó al jugador
     */
    didHitPlayerThisSweep() {
        return this._hitPlayerThisSweep;
    }
}
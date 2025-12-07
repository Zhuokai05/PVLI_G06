import BaseEnemy from './BaseEnemy.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';

/**
 * enemigo terrestre a distancia simple
 */
export default class RangedEnemy extends BaseEnemy {

    /**
     * constructor del enemigo a distancia
     * @param {Phaser.Scene} scene escena donde vive el enemigo
     * @param {number} x posicion x inicial
     * @param {number} y posicion y inicial
     * @param {string} sprite clave del sprite
     */
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);                  // inicializar baseenemy

        // ataque
        this.attackRange = 900;                      // rango ataque a distancia
        this.attackTime = 1000;                      // tiempo de carga del ataque

        // deteccion del jugador
        this.detectPlayerRangeX = 1000;              // rango en x de deteccion
        this.detectPlayerRangeY = 200;               // rango en y de deteccion

        // maquina de estados
        this.stateMachine
            .addState('move', new GroundEnemyMoveState())   // estado mover
            .addState('attack', new RangedEnemyAttackState()) // estado atacar
            .setState('move');                              // estado inicial
    }
}

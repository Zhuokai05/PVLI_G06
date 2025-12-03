import BaseEnemy from './BaseEnemy.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';

export default class RangedEnemy extends BaseEnemy {
    constructor(scene, x, y, sprite) {
        super(scene, x, y, sprite);

        this.attackRange = 900; //rango ataque del enemigo a distancia
        this.attackTime = 1000; // lo que tarda en atacar

        this.detectPlayerRangeX = 1000; //rango en X que empieza a detecta el jugador
        this.detectPlayerRangeY = 200; //rango en Y que empieza a detecta el jugador

        this.stateMachine
            .addState('move', new RangedEnemyMoveState())
            .addState('attack', new RangedEnemyAttackState())
            .setState('move');
    }

}

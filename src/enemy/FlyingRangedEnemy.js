import FlyingEnemyMoveState from './enemyMove/FlyingEnemyMoveState.js';
import FlyingEnemyMeleeAttackState from './enemyAttack/RangedEnemyAttackState.js';
import BaseEnemy from './BaseEnemy.js';

export default class FlyingRangedEnemy extends BaseEnemy {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.body.allowGravity = false; 

        this.speed = 120;
        this.verticalSpeed = 60;
        this.attackDuration = 600;

        this.attackRange = 200;
        this.attackDuration = 1500;
        this.damage = 1;

        this.detectPlayerRangeX = 1000; //rango en X que empieza a detecta el jugador
        this.detectPlayerRangeY = 800; //rango en Y que empieza a detecta el jugador


        this.stateMachine
            .addState('move', new FlyingEnemyMoveState())
            .addState('attack', new FlyingEnemyMeleeAttackState())
            .setState('move');
    }

}

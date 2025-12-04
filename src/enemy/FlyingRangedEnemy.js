import FlyingEnemyMoveState from './enemyMove/FlyingEnemyMoveState.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import BaseEnemy from './BaseEnemy.js';

export default class FlyingRangedEnemy extends BaseEnemy {
    constructor(scene, x, y, texture = 'enemy',frame = 0, moveAnimationKey, attackAnimationKey) {
        super(scene, x, y, texture,frame, moveAnimationKey, attackAnimationKey);

        this.setScale(2);
        this.body.allowGravity = false; 

        /* reducimos el collider a la mitad, ya que hay un proble con el spritesheet donde las celdas son de 64 
        pero el sprite solo esta en el medio, con un gran margen vacio */
        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setOffset(this.width / 4, this.height / 4);

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
            .addState('attack', new RangedEnemyAttackState())
            .setState('move');
    }

}

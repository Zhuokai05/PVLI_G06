import BaseEnemy from './BaseEnemy.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';

export default class RangedEnemy extends BaseEnemy {
    constructor(scene, x, y, texture = 'enemy',frame = 0, moveAnimationKey, attackAnimationKey,deathAnimationKey,projectileTexture,projectileTextureFrame) {
        super(scene, x, y, texture,frame, moveAnimationKey, attackAnimationKey,deathAnimationKey,projectileTexture,projectileTextureFrame);

        /* reducimos el collider, ya que hay un proble con el spritesheet donde las celdas son de 64 
        pero el sprite solo esta en el medio, con un gran margen vacio */
        this.colliderWidthDivisor = 2;
        this.colliderHeightDivisor = 1.2;
        
        this.DivideCollider( this.colliderWidthDivisor, this.colliderHeightDivisor);

        this.attackRange = 500; //rango ataque del enemigo a distancia
        this.attackDuration = 600;// lo que tarda en atacar

        this.detectPlayerRangeX = 1000; //rango en X que empieza a detecta el jugador
        this.detectPlayerRangeY = 200; //rango en Y que empieza a detecta el jugador

        this.stateMachine
            .addState('move', new GroundEnemyMoveState())
            .addState('attack', new RangedEnemyAttackState())
            .setState('move');
    }

}

import BaseEnemy from './BaseEnemy.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';

/**
 * enemigo terrestre a distancia
 */
export default class RangedEnemy extends BaseEnemy {

    constructor(scene, x, y, texture='enemy', frame=0,
        moveAnimationKey, attackAnimationKey, deathAnimationKey,
        projectileTexture, projectileTextureFrame)
    {
        super(scene, x, y, texture, frame,
            moveAnimationKey, attackAnimationKey, deathAnimationKey,
            projectileTexture, projectileTextureFrame);

        // collider reducido
        this.colliderWidthDivisor = 2;                   // reducir ancho collider
        this.colliderHeightDivisor = 1.2;                // reducir alto collider
        this.DivideCollider(this.colliderWidthDivisor, this.colliderHeightDivisor);

        // stats
        this.attackRange = 500;                          // rango de ataque
        this.attackDuration = 600;                       // tiempo ataque
        this.detectPlayerRangeX = 1000;                  // rango deteccion x
        this.detectPlayerRangeY = 200;                   // rango deteccion y

        // estados
        this.stateMachine
            .addState('move', new GroundEnemyMoveState())
            .addState('attack', new RangedEnemyAttackState())
            .setState('move');
    }
}

import FlyingEnemyMoveState from './enemyMove/FlyingEnemyMoveState.js';
import RangedEnemyAttackState from './enemyAttack/RangedEnemyAttackState.js';
import BaseEnemy from './BaseEnemy.js';

/**
 * enemigo volador con ataque a distancia
 */
export default class FlyingRangedEnemy extends BaseEnemy {

    constructor(scene, x, y, texture='enemy', frame=0,
        moveAnimationKey, attackAnimationKey, deathAnimationKey,
        projectileTexture, projectileTextureFrame)
    {
        super(scene, x, y, texture, frame,
            moveAnimationKey, attackAnimationKey, deathAnimationKey,
            projectileTexture, projectileTextureFrame);

        // render
        this.setScale(2);                               // mas grande
        this.body.allowGravity = false;                 // volador sin gravedad

        // collider reducido
        this.colliderWidthDivisor = 2;
        this.colliderHeightDivisor = 2;
        this.DivideCollider(this.colliderWidthDivisor, this.colliderHeightDivisor);

        // stats
        this.speed = 120;                               // velocidad horizontal
        this.verticalSpeed = 60;                        // velocidad vertical
        this.attackDuration = 1500;                     // duracion ataque
        this.attackRange = 200;                         // rango ataque
        this.damage = 1;                                // danio
        this.detectPlayerRangeX = 1000;                 // deteccion x
        this.detectPlayerRangeY = 800;                  // deteccion y

        // estados
        this.stateMachine
            .addState('move', new FlyingEnemyMoveState())
            .addState('attack', new RangedEnemyAttackState())
            .setState('move');
    }
}

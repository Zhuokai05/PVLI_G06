import BaseEnemy from './BaseEnemy.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';
import MeleeEnemyAttackState from './enemyAttack/MeleeEnemyAttackState.js';

/**
 * enemigo terrestre melee
 */
export default class MeleeEnemy extends BaseEnemy {

  constructor(scene, x, y, texture='enemy', frame=0,
    moveAnimationKey, attackAnimationKey, deathAnimationKey)
  {
    super(scene, x, y, texture, frame, moveAnimationKey, attackAnimationKey, deathAnimationKey);

    // stats
    this.speed = 70;                                    // velocidad
    this.attackRange = 80;                              // rango ataque
    this.meleeAttackWidge = 60;                         // ancho hitbox
    this.meleeAttackHeight = 60;                        // alto hitbox
    this.meleeAttackDist = 40;                          // distancia ataque

    // estados
    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MeleeEnemyAttackState())
      .setState('move');
  }
}

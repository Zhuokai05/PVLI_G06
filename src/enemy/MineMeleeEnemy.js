import BaseEnemy from './BaseEnemy.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';
import MineEnemyAttackState from './enemyAttack/MineEnemyAttackState.js';

/**
 * enemigo mina (explota al atacar)
 */
export default class MineEnemy extends BaseEnemy {

  constructor(scene, x, y, texture='enemy', frame=0,
    moveAnimationKey, attackAnimationKey, deathAnimationKey)
  {
    super(scene, x, y, texture, frame, moveAnimationKey, attackAnimationKey, deathAnimationKey);

    // stats
    this.setScale(2);                                   // escalar sprite
    this.speed = 120;                                   // velocidad
    this.attackRange = 50;                              // rango
    this.attackDuration = 1000;                         // explosion demora
    this.damage = 1;                                    // danio explosion
    this.meleeAttackWidge = 100;                        // ancho hitbox
    this.meleeAttackHeight = 100;                       // alto hitbox
    this.startAttackTime = 0;                           // ataque inmediato

    // estados
    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MineEnemyAttackState())
      .setState('move');
  }

  /**
   * sobreescribe colision para que no haga doble danio
   */
  CollisionWithPlayer(player, enemy) {
    // no hace nada (evita doble danio por explosion)
  }
}

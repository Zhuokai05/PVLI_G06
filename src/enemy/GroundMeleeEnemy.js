import BaseEnemy from './BaseEnemy.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';
import MeleeEnemyAttackState from './enemyAttack/MeleeEnemyAttackState.js';

/**
 * Enemigo terrestre de ataque cuerpo a cuerpo
 * @class MeleeEnemy
 * @extends BaseEnemy
 */
export default class MeleeEnemy extends BaseEnemy {

  constructor(scene, x, y, texture='basicEnemyAngry', frame=0, 
    moveAnimationKey, attackAnimationKey, deathAnimationKey)
  {
    // Pasar todos los parámetros al constructor padre
    super(scene, x, y, texture, frame, moveAnimationKey, attackAnimationKey, deathAnimationKey);

    // stats
    this.speed = 70;                                    // velocidad
    this.attackRange = 80;                              // rango ataque
    this.attackDuration = 1000;                           
    this.meleeAttackWidge = 60;                         // ancho hitbox
    this.meleeAttackHeight = 60;                        // alto hitbox
    this.meleeAttackDist = 40;                          // distancia ataque

    this.detectPlayerRangeX = 500;                    // rango x de deteccion
    this.detectPlayerRangeY = 50;                     // rango y de deteccion

    // estados
    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MeleeEnemyAttackState())
      .setState('move');
  }

  /**
   * Metodo vacio ta que su animacion de ataque es un sprite aparte
   */
  playAttackAnimation() {
    
  }

}
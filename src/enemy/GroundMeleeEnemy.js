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
    moveAnimationKey, attackAnimationKey='', deathAnimationKey='')
  {
    // Pasar todos los parámetros al constructor padre
    super(scene, x, y, texture, frame, moveAnimationKey, attackAnimationKey, deathAnimationKey);

    // stats
    this.speed = 70;                                    // velocidad
    this.attackRange = 80;                              // rango ataque
    this.meleeAttackWidge = 60;                         // ancho hitbox
    this.meleeAttackHeight = 60;                        // alto hitbox
    this.meleeAttackDist = 40;                          // distancia ataque

    // Guardar la clave de animación de ataque específica
    this.meleeAttackAnimationKey = this.getMeleeAttackKey();

    // estados
    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MeleeEnemyAttackState())
      .setState('move');
  }

  /**
   * Obtiene la clave de animación de ataque según el tipo de enemigo
   * @returns {string} - Clave de la animación de ataque
   */
  getMeleeAttackKey() {
    if (this.texture.key === 'basicEnemyAngry') {
      return 'basicEnemyAngry_melee_anim';
    } else if (this.texture.key === 'basicEnemySad') {
      return 'basicEnemySad_melee_anim';
    }
    return 'basicEnemyAngry_melee_anim'; // default
  }
}
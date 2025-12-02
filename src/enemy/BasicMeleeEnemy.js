import BaseEnemy from './BaseEnemy.js';
import BasicMeleeEnemyMoveState from './enemyMove/BaseEnemyMoveState.js';
import BasicMeleeEnemyAttackState from './enemyAttack/BasicMeleeEnemyAttackState.js';

export default class MeleeEnemy extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 70;
    this.attackRange = 80;

    this.meleeAttackWidge = 60; //ancho del hitbox de ataque 
    this.meleeAttackHeight = 60;// alto del hitbox de ataque
    this.meleeAttackDist = 40; //distancia de su ataque

    this.stateMachine
      .addState('move', new BasicMeleeEnemyMoveState())
      .addState('attack', new BasicMeleeEnemyAttackState())
      .setState('move');
  }
}
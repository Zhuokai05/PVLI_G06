import BaseEnemy from './BaseEnemy.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';
import MeleeEnemyAttackState from './enemyAttack/MeleeEnemyAttackState.js';

export default class MeleeEnemy extends BaseEnemy {
  constructor(scene, x, y, texture = 'enemy',frame = 0, moveAnimationKey, attackAnimationKey,deathAnimationKey) {
    super(scene, x, y, texture,frame, moveAnimationKey, attackAnimationKey,deathAnimationKey);

    this.speed = 70;
    this.attackRange = 80;

    this.meleeAttackWidge = 60; //ancho del hitbox de ataque 
    this.meleeAttackHeight = 60;// alto del hitbox de ataque
    this.meleeAttackDist = 40; //distancia de su ataque

    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MeleeEnemyAttackState())
      .setState('move');
  }
}
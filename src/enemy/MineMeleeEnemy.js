import BaseEnemy from './BaseEnemy.js';
import MineEnemyMoveState from './enemyMove/BaseEnemyMoveState.js';
import MineEnemyAttackState from './enemyAttack/MineEnemyAttackState.js';

export default class MeleeEnemy extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 120;
    this.attackRange = 80;
    this.attackCooldown = 1000;

    this.meleeAttackWidge = 60; //ancho del hitbox de ataque 
    this.meleeAttackHeight = 60;// alto del hitbox de ataque
    this.meleeAttackDist = 40; //distancia de su ataque

    this.stateMachine
      .addState('move', new MineEnemyMoveState())
      .addState('attack', new MineEnemyAttackState())
      .setState('move');
  }
}
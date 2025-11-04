import BaseEnemy from './BaseEnemy.js';
import BasicMeleeEnemyMoveState from './enemyMove/BasicMeleeEnemyMoveState.js';
import BasicMeleeEnemyAttackState from './enemyAttack/BasicMeleeEnemyAttackState.js';

export default class MeleeEnemy extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 70;
    this.attackRange = 80;
    this.attackCooldown = 1000;

    this.stateMachine
      .addState('move', new BasicMeleeEnemyMoveState())
      .addState('attack', new BasicMeleeEnemyAttackState())
      .setState('move');
  }
}
import EnemyBase from './EnemyBase.js';
import BasicMeleeEnemyMoveState from './enemyMove/BasicMeleeEnemyMoveState.js';

export default class MeleeEnemy extends EnemyBase {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 70;
    this.attackRange = 80;

    this.stateMachine
      .addState('move', new BasicMeleeEnemyMoveState())
      //.addState('attack', new BasicMeleeEnemyAttackState())
      .setState('move');
  }
}
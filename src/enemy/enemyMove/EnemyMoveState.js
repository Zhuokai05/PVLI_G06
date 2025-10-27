import BaseState from '../../stateMachine/BaseState.js';

export default class EnemyMoveState extends BaseState {
  enter(enemy) {}

  execute(enemy, time, delta) {
    const player = enemy.player;
    if (!player) return;

    const direction = player.x > enemy.x ? 1 : -1;
    enemy.setVelocityX(direction * enemy.speed);
    enemy.setFlipX(direction < 0);

    enemy.separateFromOthers(enemy.scene.enemies.getChildren());

    if (!enemy.canSeePlayer()) {
      enemy.setVelocityX(0);
      console.log(enemy.canSeePlayer())
      return;
    }
  }

  exit(enemy) {
    enemy.setVelocityX(0);
  }
}
import StateMachine from '../stateMachine/StateMachine.js';

export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture = 'enemy') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.player = scene.player;
    this.speed = 50;
    this.attackRange = 80;
    this.health = 3;
    this.distanceBtwEnemies = 20;

    this.body.pushable = false;

    this.stateMachine = new StateMachine(this, 'enemy');
  }

  update(time, delta) {
    this.stateMachine.step(time, delta);
  }

  canSeePlayer() {
    const distX = Math.abs(this.player.x - this.x);
    const distY = Math.abs(this.player.y - this.y);
    return distX < 300 && distY < 50;
  }

  separateFromOthers(enemies) {
    enemies.forEach(other => {
      if (other === this) return;
      const dist = Math.abs(this.x - other.x);
      if (dist < distanceBtwEnemies) {
        const pushDir = this.x < other.x ? -1 : 1;
        this.x += pushDir * 1.5;
      }
    });
  }
}

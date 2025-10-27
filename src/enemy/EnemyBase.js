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
    this.dead=false;
    this.body.pushable = false;

    this.stateMachine = new StateMachine(this, 'enemy');
  }

  update(time, delta) {
    if (this.dead) return;
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

  takeDamage(amount) {
    this.health -= amount;
    console.log(`Enemy HP: ${this.health}`);

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    if (this.dead) return; 
    this.dead = true;
    
    this.setVelocity(0);
    this.setActive(false);
    this.setVisible(false);
    
    this.scene.time.delayedCall(100, () => {
     this.destroy();
    });
  }

}

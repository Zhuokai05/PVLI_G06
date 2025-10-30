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

    this.playerOverlap = scene.physics.add.overlap(
      this,
      this.player,
      this.CollisionWithPlayer,
      null,
      this
    );

    
  }

  update(time, delta) {
    if (this.dead) return;
    this.stateMachine.step(time, delta);
  }

  canSeePlayer() {
    let distX = Math.abs(this.player.x - this.x);
    let distY = Math.abs(this.player.y - this.y);
    return distX < 300 && distY < 50;
  }

  CollisionWithPlayer(player, enemy) {
    console.log('Colision con enemigo');
    let knockbackDirection = player.x < enemy.x ? -1 : 1;
    this.player.takeDamage(1,knockbackDirection);
  }
  
 

  /*
  separateFromOthers(enemies) {

    const margin = 2;      

    enemies.forEach(other => {

      if (other === this || !other.active || other.dead) return;

      const dx = this.x - other.x;
      const dist = Math.abs(dx);

      if (dist < this.distanceBtwEnemies - margin) {

        //solo mueve a uno
        if (this.x > other.x) {
          this.x += (this.distanceBtwEnemies - dist);
        }

      }
      
    });
    
  }*/

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

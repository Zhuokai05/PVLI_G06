import StateMachine from '../stateMachine/StateMachine.js';

export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture = 'enemy') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.collisionDamage = 1; // daño que hace al jugador al colisionar con el
    this.scene = scene;
    this.player = scene.player;
    this.speed = 50; //velocidad
    this.attackRange = 80; //rango de ataque
    this.health = 3; //vida
    this.distanceBtwEnemies = 20; //distancia minima que existe entre los enemigos
    this.dead=false; //si esta muerto
    this.body.pushable = false; //para que no pueda ser empujado
    this.applyKnockbackToPlayer = true; // si aplica knockback al jugador
    this.detectPlayerRangeX = 500; //rango en X que empieza a detecta el jugador
    this.detectPlayerRangeY = 50; //rango en Y que empieza a detecta el jugador
    this.isAttacking = false;
    
    this.damage = 1; // el daño que hace

    this.attackTime = 500; // tiempo que tarda el ataque, !!!debe de ser menor que attackCooldown!!!
    this.startAttackTime = 1000; //en cuanto tiempo empieza el ataque estando player delante
    this.attackDuration = 100; //cuanto dura el hitbox de ataque

    this.stateMachine = new StateMachine(this, 'enemy');

    //colision contra el player
    this.playerOverlap = scene.physics.add.overlap(
      this,
      this.player,
      this.CollisionWithPlayer,
      null,
      this
    );

    this.setDepth(4);

  }

  update(time, delta) {
    if (this.dead || this.player.dead) return;
    this.stateMachine.step(time, delta);
  }

  //detecta si la posicion del jugador esta dentro de su rango de deteccion
  canSeePlayer() {
    let distX = Math.abs(this.player.x - this.x);
    let distY = Math.abs(this.player.y - this.y);
    return distX < this.detectPlayerRangeX && distY < this.detectPlayerRangeY;
  }

  //funcion que se llama al colisionar con el jugador

  /**
   * 
   * @param {Player} player el jugador que colisiona
   * @param {Enemy} enemy el enemigo que colisiona   
   */
  CollisionWithPlayer(player, enemy) {
    console.log('Colision con enemigo');

    //si hace knockback le aplicamos knockback 
    if (this.applyKnockbackToPlayer){
      let knockbackDirection = player.x < enemy.x ? 1 : -1;
      this.player.takeDamage(this.collisionDamage,knockbackDirection);
    }
    
    else 
    {
      this.player.takeDamage(this.collisionDamage);
    }
  }

  takeDamage(amount) {
    if (this.inmune) return;
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

import StateMachine from '../stateMachine/StateMachine.js';

export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture = 'enemy',frame = 0, 
    moveAnimationKey, attackAnimationKey,deathAnimationKey,projectileTexture,projectileTextureFrame)
  {

    super(scene, x, y, texture,frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.moveAnimationKey = moveAnimationKey;
    this.attackAnimationKey = attackAnimationKey;
    this.deathAnimationKey = deathAnimationKey;
    this.projectileTexture = projectileTexture;
    this.projectileTextureFrame = projectileTextureFrame;

    
    //en casos de que el sprite tenga mucho borde, osea collider muy grande, le reducimos el collider
    this.colliderWidthDivider = 1;
    this.colliderHeightDivider = 1;

    this.collisionDamage = 1; // daño que hace al jugador al colisionar con el
    this.scene = scene;
    this.player = scene.player;
    this.speed = 50; //velocidad
    this.verticalSpeed = 0; //velocidad en Y
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

    this.startAttackTime = 1000; //en cuanto tiempo empieza el ataque estando player delante
    this.attackDuration = 100; //cuanto dura el ataque

    this.stateMachine = new StateMachine(this, 'enemy');

    this.maxVelocityX = 1000; //velocidad maxima en X
    this.maxVelocityY = 1000;//velocidad maxima en Y

    //colision contra el player
    this.playerOverlap = scene.physics.add.overlap(
      this,
      this.player,
      this.CollisionWithPlayer,
      null,
      this
    );

    this.setDepth(4);

    this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY); //velocidad maxima

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


  //en casos de que el sprite tenga mucho borde, osea collider muy grande, le reducimos el collider
  DivideCollider(colliderWidthDivisor,colliderHeightDivisor){
    this.body.setSize(this.width / colliderWidthDivisor, this.height / colliderHeightDivisor);
    this.body.setOffset((this.width-this.width/colliderWidthDivisor)/2, (this.height-this.height/colliderHeightDivisor)/ 2);
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

  //muerte del enemigo
  die() {
    if (this.dead) return; 
    this.dead = true;
    
    this.body.allowGravity = true; 
    this.setVelocityX(0);

    if(this.player)this.player.health +=this.player.bloodStealAmount;
    //si tiene animacion de muerte, se espera acabar la animacion y de destruye
    if(this.deathAnimationKey){
      this.play(this.deathAnimationKey, true);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
      });
    } 
    
    else {
      this.scene.time.delayedCall(100, () => {
        this.destroy();
      });
    }
  }

  playMoveAnimation(){
    if(this.dead) return;
    if(this.moveAnimationKey) this.play(this.moveAnimationKey, true);
  }

  playAttackAnimation(){
    if(this.dead) return;
    if(this.attackAnimationKey) this.play(this.attackAnimationKey, true);
  }
}

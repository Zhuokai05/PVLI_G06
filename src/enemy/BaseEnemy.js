import StateMachine from '../stateMachine/StateMachine.js';

/**
 * clase base de todos los enemigos
 * contiene stats comunes, deteccion, danio y muerte
 */
export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {

  /**
   * constructor base
   */
  constructor(scene, x, y, texture = 'enemy', frame = 0,
    moveAnimationKey, attackAnimationKey, deathAnimationKey,
    projectileTexture, projectileTextureFrame)
  {
    super(scene, x, y, texture, frame);

    // escena y fisicas
    scene.add.existing(this);                         // agregar sprite
    scene.physics.add.existing(this);                 // activar fisicas
    this.scene = scene;                               // guardar escena
    this.player = scene.player;                       // referencia al jugador

    // animaciones
    this.moveAnimationKey = moveAnimationKey;         // anim caminar
    this.attackAnimationKey = attackAnimationKey;     // anim atacar
    this.deathAnimationKey = deathAnimationKey;       // anim muerte
    this.projectileTexture = projectileTexture;       // sprite proyectil
    this.projectileTextureFrame = projectileTextureFrame; // frame proyectil

    // collider
    this.colliderWidthDivider = 1;                    // divisor ancho collider
    this.colliderHeightDivider = 1;                   // divisor alto collider

    // stats
    this.health = 6;                                  // vida
    this.speed = 50;                                  // velocidad movimiento
    this.verticalSpeed = 0;                           // velocidad vertical
    this.attackRange = 80;                            // rango ataque melee
    this.damage = 1;                                  // danio base
    this.collisionDamage = 1;                         // danio por colision
    this.startAttackTime = 1000;                      // tiempo hasta atacar
    this.attackDuration = 100;                        // duracion ataque
    this.distanceBtwEnemies = 20;                     // distancia minima entre enemigos

    // estado y control
    this.dead = false;                                // enemigo esta vivo
    this.isAttacking = false;                         // esta atacando
    this.applyKnockbackToPlayer = true;               // aplica knockback al jugador

    // deteccion del jugador
    this.detectPlayerRangeX = 500;                    // rango x de deteccion
    this.detectPlayerRangeY = 50;                     // rango y de deteccion

    // fisicas
    this.body.pushable = false;                       // no puede ser empujado
    this.maxVelocityX = 1000;                         // vmax x
    this.maxVelocityY = 1000;                         // vmax y
    this.setDepth(4);                                 // profundidad render
    this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY);

    // estado maquina
    this.stateMachine = new StateMachine(this, 'enemy');

    // colision con jugador
    this.playerOverlap = scene.physics.add.overlap(
      this,
      this.player,
      this.CollisionWithPlayer,
      null,
      this
    );
  }

  /**
   * update comun de todos los enemigos
   */
  update(time, delta) {
    if (this.dead || this.player.dead) return;
    this.stateMachine.step(time, delta);               // avanzar estado
  }

  /**
   * comprueba si el jugador esta en rango de deteccion
   */
  canSeePlayer() {
    let distX = Math.abs(this.player.x - this.x);      // distancia x
    let distY = Math.abs(this.player.y - this.y);      // distancia y
    return distX < this.detectPlayerRangeX && distY < this.detectPlayerRangeY;
  }

  /**
   * reduce el tamano del collider
   */
  DivideCollider(divW, divH) {
    this.body.setSize(this.width / divW, this.height / divH);
    this.body.setOffset(
      (this.width - this.width / divW) / 2,
      (this.height - this.height / divH) / 2
    );
  }

  /**
   * colision entre jugador y enemigo
   */
  CollisionWithPlayer(player, enemy) {
    console.log('colision con enemigo');

    if (this.applyKnockbackToPlayer) {
      let dir = player.x < enemy.x ? 1 : -1;           // direccion knockback
      this.player.takeDamage(this.collisionDamage, dir);
    } else {
      this.player.takeDamage(this.collisionDamage);
    }
  }

  /**
   * recibir danio
   */
  takeDamage(amount) {
    if (this.inmune) return;

    // tint rojo breve para feedback visual
    this.setTint(0xff0000);

    // quitar tinte en un tiempo
    this.scene.time.delayedCall(100, () => {
      if (!this || !this.active || !this.scene) return;
      this.clearTint();
    });

    // tween de parpadeo del enemigo
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.alpha = 1;
        this.clearTint();
      }
    });

    
    this.health -= amount;                             // quitar vida
    console.log(`Enemy HP: ${this.health}`);

    if (this.health <= 0) this.die();                  // morir si llega a 0
  }

  /**
   * muerte del enemigo
   */
  die() {
    if (this.dead) return;

    this.dead = true;
    this.body.allowGravity = true;                     // gravedad al morir
    this.setVelocityX(0);                              // detener movimiento

    // robo de vida del jugador
    if (this.player && this.player.health < this.player.maxHealth) {
      this.player.health += this.player.bloodStealAmount;
      this.player.emit('updateHearts', this.player.health, false);
    }

    // animacion de muerte
    if (this.deathAnimationKey) {
      this.play(this.deathAnimationKey, true);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
      });
    } else {
      // muerte sin animacion
      this.scene.time.delayedCall(100, () => this.destroy());
    }
  }

  playMoveAnimation() {
    if (!this.dead && this.moveAnimationKey)
      this.play(this.moveAnimationKey, true);
  }

  playAttackAnimation() {
    if (!this.dead && this.attackAnimationKey)
      this.play(this.attackAnimationKey, true);
  }
}

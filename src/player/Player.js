import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerDeathState from './States/PlayerDeathState.js';
import PlayerDashState from './States/PlayerDashState.js';
import PlayerKnockbackState from './States/PlayerKnockbackState.js';

/**
 * clase player
 * representa al jugador controlado por el usuario
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor del jugador
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'angel_sword_idle');

        // escena
        this.scene = scene;                                    // referencia a escena
        this.scene.add.existing(this);                         // agregar sprite
        this.scene.physics.add.existing(this);                 // activar fisicas
        this.setCollideWorldBounds(true);                      // colision con bordes
        this.setGravityY(1000);                                // gravedad

        // vida
        this.health = 5;                                       // vida actual
        this.maxHealth = 5;                                    // vida maxima
        this.dead = false;                                     // estado muerto

        // ataque
        this.damage = 3;                                       // daño melee
        this.rangeDamage = 1;                                  // daño a distancia
        this.meleeAttackDist = 100;                            // distancia hitbox
        this.meleeAttackWidge = 120;                           // ancho hitbox
        this.meleeAttackHeight = 70;                           // alto hitbox
        this.attackCooldown = 300;                             // cooldown melee
        this.attackDuration = 200;                             // duracion hitbox
        this.isAttacking = false;                              // esta atacando

        // ataque rango
        this.rangeAttackDuration = 3000;                       // duracion del proyectil
        this.rangeAttackSpeed = 800;                           // velocidad proyectil
        this.rangeAttackCooldownTimer = 0;                     // cooldown restante
        this.rangeAttackCooldown = 500;                        // cooldown ataque rango

        // movimiento
        this.direction = 1;                                    // direccion horizontal
        this.grounded = false;                                 // si toca el suelo
        this.movementSpeed = 300;                              // velocidad movimiento
        this.maxVelocityX = 1000;                              // vmax x
        this.maxVelocityY = 1000;                              // vmax y
        this.canMove = true;                                   // puede moverse

        // salto
        this.jumpSpeed = 800;                                  // velocidad salto
        this.canPogoJump = false;                              // pogo jump activo
        this.pogoJumpJudgeTime = 100;                          // ventana pogo
        this.pogoJumpSpeed = 600;                              // fuerza pogo
        this.jumpBufferTime = 200;                             // tiempo buffer salto
        this.jumpBufferTimer = 0;                              // timer buffer salto
        this.speedReduceRatioAtJump = 0.8;                     // reduccion velocidad

        // dash
        this.canDash = false;                                  // tiene dash
        this.isDashing = false;                                // estado dash
        this.dashSpeed = 800;                                  // velocidad dash
        this.dashDuration = 200;                               // duracion dash
        this.dashCooldown = 500;                               // cooldown dash
        this.dashCooldownTimer = 0;                            // timer cooldown dash

        // escudo
        this.canShield = false;                                // tiene escudo
        this.hasShield = false;                                // escudo activo
        this.shieldCooldown = 5000;                            // cooldown escudo
        this.shieldCooldownTimer = 0;                          // timer cooldown escudo

        // invulnerable
        this.invulnerable = false;                             // estado invulnerable
        this.invulnerableTime = 1000;                          // duracion invulnerable
        this.knockbackTime = 200;                              // tiempo knockback
        this.knockbackDistance = 200;                          // distancia knockback

        // orbes
        this.orbs = [];                                        // lista orbes recogidos
        this.equippedOrbs = [null, null];                      // orbes equipados
        this.activeOrbIndex = 0;                               // orbe activo
        this.damageMultiplier = 1.0;                           // multiplicador daño
        this.speedMultiplier = 1.0;                            // multiplicador velocidad
        this.bloodStealAmount = 0;                             // robo de vida
        this.jumpSpeedModifier = 1.0;                          // modificador salto
        this.attackRangeMultiplier = 1.0;                      // modificador rango melee
        this.orbTint = 0xffffff;                               // color original

        // respawn
        this.respawnPoint = { x: 0, y: 0 };                    // punto respawn

        // render
        this.setDepth(5);                                      // profundidad sprite

        // input
        this.keys = scene.inputManager.keys;                   // teclas jugador

        // estados
        this.stateMachine = new StateMachine(this, 'player');
        this.stateMachine
            .addState('idle', new PlayerIdleState())
            .addState('move', new PlayerMoveState())
            .addState('jump', new PlayerJumpState())
            .addState('knockback', new PlayerKnockbackState())
            .addState('dead', new PlayerDeathState())
            .addState('dash', new PlayerDashState())
            .setState('idle');

        this.keys.changeOrb.on('down', () => {
            this.switchActiveOrb();                            // cambiar orbe
        });

        this.createSFX();                                      // cargar sonidos

        this.shieldAura = this.scene.add.image(this.x, this.y, 'playerShieldAura')
            .setDepth(this.depth + 1)
            .setAlpha(0.8)
            .setVisible(false)
            .setScale(1.2);

        this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY);


        this.timeline = this.scene.tweens.createTimeline();

        // Primer tween (sube un poco)
        this.timeline.add({
            targets: this,
            y: '-=120',     // relativo a su posición actual
            duration: 700,
            ease: 'Quad.Out'
        });

        // Segundo tween (cae fuera de cámara)
        this.timeline.add({
            targets: this,
            y: '+=500',     // relativo a su posición final del primer tween
            duration: 900,
            ease: 'Quad.In'
        });

        this.deadtexture = 'defeat_player';
    }

    /**
  * crea los sonidos del jugador
  */
    createSFX() {

        // sonido ataque melee
        this.attackSound = this.scene.sound.add('PlayerAttack_sound', { volume: 0.6 });

        // sonido impacto del ataque melee
        this.attackHitSound = this.scene.sound.add('PlayerAttack_sound', { volume: 0.6 });

        // sonido salto
        this.jumpSound = this.scene.sound.add('PlayerJump_sound', { volume: 3 });

        // sonido activacion del escudo
        this.shieldSound = this.scene.sound.add('PlayerShield_sound', { volume: 0.9 });

        // sonido cuando bloquea un golpe
        this.shieldBlockSound = this.scene.sound.add('PlayerShieldBlock_sound', { volume: 0.9 });

        // sonido al terminar salto
        this.jumpEndSound = this.scene.sound.add('PlayerJumpEnd_sound', { volume: 0.6 });

        // sonido daño recibido
        this.damagedSound = this.scene.sound.add('PlayerDamaged_sound', { volume: 0.9 });

        // sonido recoger orbe
        this.takeOrbSound = this.scene.sound.add('PlayerTakeOrb_sound', { volume: 0.9 });

        // sonido cambiar orbe
        this.changeOrbSound = this.scene.sound.add('PlayerChangeOrb_sound', { volume: 0.9 });

        // sonido ataque rango
        this.rangeAttackSound = this.scene.sound.add('PlayerRangeAttack_sound', { volume: 3 });

        // sonido dash
        this.dashSound = this.scene.sound.add('PlayerDash_sound', { volume: 0.9 });
        
    }

    /**
  * update principal del jugador
  * controla inputs, estado, ataques, timers y efectos
  */
    update(time, delta) {

        if (this.dead || !this.body) return;

        // si un efecto impide movimiento, cancelar input
        if (!this.canMove) {
            this.setVelocityX(0);
            return;
        }

        // avanzar maquina de estados
        this.stateMachine.step(time, delta);

        // detectar direccion de ataque cuerpo a cuerpo
        this.attackDir = this.getAttackDirection();

        // manejo de orbes
        if (Phaser.Input.Keyboard.JustDown(this.keys.useOrb)) {

            // prioridad 1: dash
            if (this.canDash && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.stateMachine.setState('dash');
            }

            // prioridad 2: ataque a distancia
            else if (this.canRangeAttack && this.rangeAttackCooldownTimer <= 0 && !this.isAttacking) {
                this.performRangeAttack();
            }

            // prioridad 3: escudo
            else if (this.canShield && !this.hasShield && this.shieldCooldownTimer <= 0) {
                this.shieldAura.setVisible(true);
                this.hasShield = true;
                this?.shieldSound?.play();
            }
        }

        // ataque melee
        if (this.attackDir && !this.isDashing) {
            this.performMeleeAttack(this.attackDir);
        }

        // buffer de salto, permite saltar unos ms despues de pulsar
        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
            Phaser.Input.Keyboard.JustDown(this.keys.space)) {

            this.jumpBufferTimer = this.jumpBufferTime;

        } else {
            this.jumpBufferTimer -= delta;
        }

        // reducir timers (enfriamientos)
        this.dashCooldownTimer -= delta;
        this.shieldCooldownTimer -= delta;
        this.rangeAttackCooldownTimer -= delta;

        // seguir el jugador con el aura del escudo
        if (this.shieldAura) {
            this.shieldAura.x = this.x;
            this.shieldAura.y = this.y;
        }
    }

    /**
     * aplica daño al jugador
     */
    takeDamage(damage, knockbackdirection) {

        // si esta invulnerable, ignorar daño
        if (this.invulnerable) return;

        // tint rojo breve para feedback visual
        this.setTint(0xff0000);

        // quitar tinte un poco antes de que acabe la invulnerabilidad
        this.safeDelay(this.invulnerableTime * 0.8, () => this.setTint(this.orbTint));

        // activar invulnerabilidad temporal
        this.invulnerable = true;
        this.safeDelay(this.invulnerableTime, () => this.invulnerable = false);

        // escudo bloqueador
        // solo bloquea daño leve (1)
        if (this.hasShield && damage === 1) {

            this.shieldCooldownTimer = this.shieldCooldown; // poner cooldown
            this.hasShield = false;                         // quitar escudo
            this.shieldAura.setVisible(false);              // ocultar efecto

            this?.shieldBlockSound?.play();
            return;
        }

        // sonido daño
        this?.damagedSound?.play();

        // aplicar daño real
        this.health -= damage;

        // notificar al HUD
        this.emit('updateHearts', this.health, true);

        // si muere, ejecutar muerte
        if (this.health <= 0) {
            this.die();
        }

        // si no ha muerto, aplicar knockback
        if (knockbackdirection && !this.dead) {
            this.stateMachine.setState('knockback', knockbackdirection);
        }
    }


    /**
  * el jugador recoge un orbe del suelo
  */
    collectOrb(orb) {

        // si nunca lo tenia, agregarlo a la lista
        if (!this.orbs.includes(orb)) {
            this.orbs.push(orb);
            this?.takeOrbSound?.play();
        }

        // intentar autoequiparlo en el primer hueco libre
        for (let i = 0; i < this.equippedOrbs.length; i++) {

            // si la casilla esta vacia
            if (!this.equippedOrbs[i]) {

                this.equipOrb(i, orb);   // equiparlo

                // si es el primer orbe recogido, activarlo automaticamente
                if (this.activeOrbIndex === i) {
                    this.ActivateOrb(i);
                }

                return;
            }
        }
    }


    /**
  * equipa un orbe en un slot concreto
  */
    equipOrb(slotIndex, orb) {

        // validaciones basicas
        if (!orb) return;
        if (slotIndex < 0 || slotIndex > 1) return;
        if (!this.orbs.includes(orb)) return;

        // si habia un orbe equipado, ejecutar su salida
        if (this.equippedOrbs[slotIndex]) {
            this.equippedOrbs[slotIndex].onDesequip(this);
            this.equippedOrbs[slotIndex].onDesactivate(this);
        }

        // equipar nuevo orbe
        this.equippedOrbs[slotIndex] = orb;

        // aplicar efectos pasivos
        orb.onEquip(this);

        // notificar a la UI
        this.emit('orbChanged');
    }


    /**
     * dessequipar orbe
     */
    desEquipOrb(slotIndex) {

        if (!this.equippedOrbs[slotIndex]) return;

        this.equippedOrbs[slotIndex].onDesequip(this);
        this.equippedOrbs[slotIndex].onDesactivate(this);
        this.equippedOrbs[slotIndex] = null;

        this.switchActiveOrb();
        this.emit('orbChanged');
    }

    /**
     * cambiar orbe activo
     */
    switchActiveOrb() {
        let nextIndex = (this.activeOrbIndex + 1) % this.equippedOrbs.length;
        this.ActivateOrb(nextIndex);
        this?.changeOrbSound?.play();
    }

    /**
  * activa el orbe del slot especificado
  */
    ActivateOrb(slotIndex) {

        let currentOrb = this.equippedOrbs[this.activeOrbIndex];
        let nextOrb = this.equippedOrbs[slotIndex];

        // si no hay orbe en ese slot, cancelar
        if (!nextOrb) return;

        // desactivar orbe actual (si hay)
        if (currentOrb) {
            currentOrb.onDesactivate(this);
        }

        // activar nuevo orbe
        nextOrb.onActivate(this);

        // guardar indice activo
        this.activeOrbIndex = slotIndex;

        // actualizar UI
        this.emit('orbChanged');
    }


    /**
     * muerte del jugador
     */
    die() {
        if (this.dead) return;

        if (this.shieldAura) this.shieldAura.setVisible(false);

        this.health = this.maxHealth;
        this.dead = true;
        this.canMove = false;
        this.isAttacking = false;
        this.isDashing = false;
        this.anims.stop();
        this.setTexture(this.deadtexture);
        this.scene.cameras.main.stopFollow();
        this.timeline.play();

        // Retrasar lo siguiente 3 segundos (3000 ms)
        this.scene.time.delayedCall(1500, () => {
            this.scene.scene.stop();
            this.scene.scene.launch('GameOver');


            this.setVelocity(0, 0);
            this.stateMachine.setState('dead');
        });
    }

    /**
     * jugador esta tocando el suelo
     */
    isGrounded() {
        return this.body.onFloor();
    }

    /**
     * direccion de ataque
     */
    getAttackDirection() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.upArrow)) return 'up';
        if (Phaser.Input.Keyboard.JustDown(this.keys.downArrow)) return 'down';
        if (Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)) return 'left';
        if (Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)) return 'right';

        return null;
    }

    /**
   * ataque cuerpo a cuerpo
   */
    performMeleeAttack(direction) {

        // si ya esta atacando, cancelar
        if (this.isAttacking) return;

        // sonido ataque
        this?.attackSound?.play();

        // activar estado de ataque
        this.isAttacking = true;

        // terminar ataque tras cooldown
        this.safeDelay(this.attackCooldown, () => this.isAttacking = false);

        // calcular offset del hitbox
        let offsetX = 0, offsetY = 0;
        let w = this.meleeAttackWidge;
        let h = this.meleeAttackHeight * this.attackRangeMultiplier;

        switch (direction) {
            case 'left': offsetX = -this.meleeAttackDist; break;
            case 'right': offsetX = this.meleeAttackDist; break;
            case 'up': offsetY = -this.meleeAttackDist;[w, h] = [h, w]; break;
            case 'down': offsetY = this.meleeAttackDist;[w, h] = [h, w]; break;
        }

        // crear hitbox
        let hitbox = this.scene.add.rectangle(this.x + offsetX, this.y + offsetY, h, w, 0xff0000, 0.5);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        let hitEnemies = new Set(); // prevenir multigolpes

        // detectar colisiones con enemigos
        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {

            if (hitEnemies.has(enemy)) return;
            hitEnemies.add(enemy);

            enemy.takeDamage(this.damage * this.damageMultiplier);

            // pogo jump al atacar hacia abajo
            if (direction === 'down') {
                this.canPogoJump = true;
                this.safeDelay(this.pogoJumpJudgeTime, () => this.canPogoJump = false);
            }
        });


        // animacion de ataque
        let meleeSprite;

        if (this.attackRangeMultiplier != 1) {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee_Ampliado');
            meleeSprite.play({ key: 'melee_ampliado_anim' });
        } else {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee');
            meleeSprite.play({ key: 'melee_anim' });
        }

        meleeSprite.setDepth(10);

        // rotacion segun direccion
        switch (direction) {
            case 'right': meleeSprite.setFlipX(false); meleeSprite.setAngle(0); break;
            case 'left': meleeSprite.setFlipX(true); meleeSprite.setAngle(0); break;
            case 'up': meleeSprite.setAngle(-90); break;
            case 'down': meleeSprite.setAngle(90); break;
        }

        // destruir hitbox y sprite
        this.safeDelay(this.attackDuration, () => {
            hitbox.destroy();
            meleeSprite.destroy();
        });
    }

    /**
     * delay seguro
     */
    safeDelay(time, callback) {
        if (!this.scene || !this.scene.time) return;
        this.scene.time.delayedCall(time, () => {
            if (this.scene) callback();
        });
    }

    /**
    * ataque a distancia usando un proyectil del pool
    */
    performRangeAttack() {

        // no puede atacar si no tiene orbe o esta atacando
        if (!this.canRangeAttack) return;
        if (this.isAttacking) return;

        // sonido ataque rango
        this?.rangeAttackSound?.play();

        // iniciar cooldown del ataque
        this.rangeAttackCooldownTimer = this.rangeAttackCooldown;
        this.isAttacking = true;

        // dejar de estar en estado atacando tras cooldown
        this.safeDelay(this.rangeAttackCooldown, () => this.isAttacking = false);

        // lanzar proyectil desde el pool
        this.scene.playerProjectilePool.fire(
            this.x,
            this.y,
            this.direction,
            this.rangeAttackDuration,
            this.rangeAttackSpeed,

            // funcion callback al impactar
            enemy => enemy.takeDamage(this.rangeDamage * this.damageMultiplier)
        );
    }

}

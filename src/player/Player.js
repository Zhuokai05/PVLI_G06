import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerDeathState from './States/PlayerDeathState.js';
import PlayerDashState from './States/PlayerDashState.js';
import PlayerKnockbackState from './States/PlayerKnockbackState.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

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
        this.damage = 10;                                      // daño melee
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
    }

    /**
     * crea los sonidos
     */
    createSFX() {
        this.attackSound = this.scene.sound.add('PlayerAttack_sound', { volume: 0.2 });
        this.attackHitSound = this.scene.sound.add('PlayerAttack_sound', { volume: 0.2 });
        this.jumpSound = this.scene.sound.add('PlayerJump_sound', { volume: 1 });
        this.shieldSound = this.scene.sound.add('PlayerShield_sound', { volume: 0.3 });
        this.shieldBlockSound = this.scene.sound.add('PlayerShieldBlock_sound', { volume: 0.3 });
        this.jumpEndSound = this.scene.sound.add('PlayerJumpEnd_sound', { volume: 0.2 });
        this.damagedSound = this.scene.sound.add('PlayerDamaged_sound', { volume: 0.3 });
        this.takeOrbSound = this.scene.sound.add('PlayerTakeOrb_sound', { volume: 0.3 });
        this.changeOrbSound = this.scene.sound.add('PlayerChangeOrb_sound', { volume: 0.3 });
        this.rangeAttackSound = this.scene.sound.add('PlayerRangeAttack_sound', { volume: 1 });
        this.dashSound = this.scene.sound.add('PlayerDash_sound', { volume: 0.3 });
    }

    /**
     * update principal
     */
    update(time, delta) {

        this.stateMachine.step(time, delta);                  // avanzar estado
        this.attackDir = this.getAttackDirection();           // direccion ataque

        if (Phaser.Input.Keyboard.JustDown(this.keys.useOrb)) {

            if (this.canDash && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.stateMachine.setState('dash');           // ejecutar dash
            }

            else if (this.canRangeAttack && this.rangeAttackCooldownTimer <= 0 && !this.isAttacking) {
                this.performRangeAttack();                    // ataque distancia
            }

            else if (this.canShield && !this.hasShield && this.shieldCooldownTimer <= 0) {
                this.shieldAura.setVisible(true);             // activar escudo
                this.hasShield = true;
                this?.shieldSound?.play();
            }
        }

        if (this.attackDir && !this.isDashing) {
            this.performMeleeAttack(this.attackDir);          // ataque melee
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
            Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.jumpBufferTimer = this.jumpBufferTime;       // buffer salto
        } else {
            this.jumpBufferTimer -= delta;
        }

        this.dashCooldownTimer -= delta;
        this.shieldCooldownTimer -= delta;
        this.rangeAttackCooldownTimer -= delta;

        if (this.shieldAura) {
            this.shieldAura.x = this.x;                       // mover aura
            this.shieldAura.y = this.y;
        }
    }

    /**
     * aplicar daño
     */
    takeDamage(damage, knockbackdirection) {

        if (this.invulnerable) return;

        this.setTint(0xff0000);
        this.safeDelay(this.invulnerableTime * 0.8, () => this.setTint(this.orbTint));

        this.invulnerable = true;
        this.safeDelay(this.invulnerableTime, () => this.invulnerable = false);

        if (this.hasShield && damage === 1) {
            this.shieldCooldownTimer = this.shieldCooldown;
            this.hasShield = false;
            if (this.shieldAura) this.shieldAura.setVisible(false);
            this?.shieldBlockSound?.play();
            return;
        }

        this?.damagedSound?.play();
        this.health -= damage;
        this.emit('updateHearts', this.health, true);

        if (this.health <= 0) this.die();

        if (knockbackdirection && !this.dead) {
            this.stateMachine.setState('knockback', knockbackdirection);
        }
    }

    /**
     * recoger orbe
     */
    collectOrb(orb) {

        if (!this.orbs.includes(orb)) {
            this.orbs.push(orb);
            this?.takeOrbSound?.play();
        }

        for (let i = 0; i < this.equippedOrbs.length; i++) {
            if (!this.equippedOrbs[i]) {
                this.equipOrb(i, orb);
                if (this.activeOrbIndex === i) {
                    this.ActivateOrb(i);
                }
                return;
            }
        }
    }

    /**
     * equipar orbe
     */
    equipOrb(slotIndex, orb) {

        if (!orb) return;
        if (slotIndex < 0 || slotIndex > 1) return;
        if (!this.orbs.includes(orb)) return;

        if (this.equippedOrbs[slotIndex]) {
            this.equippedOrbs[slotIndex].onDesequip(this);
            this.equippedOrbs[slotIndex].onDesactivate(this);
        }

        this.equippedOrbs[slotIndex] = orb;
        orb.onEquip(this);
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
     * activar orbe
     */
    ActivateOrb(slotIndex) {

        let currentOrb = this.equippedOrbs[this.activeOrbIndex];
        let nextOrb = this.equippedOrbs[slotIndex];

        if (!nextOrb) return;

        if (currentOrb) currentOrb.onDesactivate(this);

        nextOrb.onActivate(this);
        this.activeOrbIndex = slotIndex;

        this.emit('orbChanged');
    }

    /**
     * muerte del jugador
     */
    die() {
        if (this.dead) return;

        if (this.shieldAura) this.shieldAura.setVisible(false);

        this.health = this.maxHealth;
        this.scene.scene.stop();
        this.scene.scene.launch('GameOver');

        this.dead = true;
        this.setVelocity(0, 0);
        this.stateMachine.setState('dead');
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
     * ataque melee
     */
    performMeleeAttack(direction) {

        if (this.isAttacking) return;

        this?.attackSound?.play();
        this.isAttacking = true;

        this.safeDelay(this.attackCooldown, () => this.isAttacking = false);

        let offsetX = 0, offsetY = 0;
        let w = this.meleeAttackWidge;
        let h = this.meleeAttackHeight * this.attackRangeMultiplier;

        switch (direction) {
            case 'left': offsetX = -this.meleeAttackDist; break;
            case 'right': offsetX = this.meleeAttackDist; break;
            case 'up': offsetY = -this.meleeAttackDist; [w,h]=[h,w]; break;
            case 'down': offsetY = this.meleeAttackDist; [w,h]=[h,w]; break;
        }

        let hitbox = this.scene.add.rectangle(this.x + offsetX, this.y + offsetY, h, w, 0xff0000, 0.5);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        let hitEnemies = new Set();

        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {

            if (hitEnemies.has(enemy)) return;
            hitEnemies.add(enemy);

            enemy.takeDamage(this.damage * this.damageMultiplier);

            if (direction === 'down') {
                this.canPogoJump = true;
                this.safeDelay(this.pogoJumpJudgeTime, () => this.canPogoJump = false);
            }
        });

        let meleeSprite;

        if (this.attackRangeMultiplier != 1) {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee_Ampliado');
            meleeSprite.play({ key: 'melee_ampliado_anim', repeat: 0 });
        } else {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee');
            meleeSprite.play({ key: 'melee_anim', repeat: 0 });
        }

        meleeSprite.setDepth(10);

        switch (direction) {
            case 'right': meleeSprite.setFlipX(false); meleeSprite.setAngle(0); break;
            case 'left': meleeSprite.setFlipX(true); meleeSprite.setAngle(0); break;
            case 'up': meleeSprite.setAngle(-90); break;
            case 'down': meleeSprite.setAngle(90); break;
        }

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
     * ataque distancia
     */
    performRangeAttack() {

        if (!this.canRangeAttack) return;
        if (this.isAttacking) return;

        this?.rangeAttackSound?.play();

        this.rangeAttackCooldownTimer = this.rangeAttackCooldown;
        this.isAttacking = true;

        this.safeDelay(this.rangeAttackCooldown, () => this.isAttacking = false);

        let projectile = this.scene.physics.add.sprite(this.x, this.y, 'plume');
        projectile.setDepth(4);
        projectile.body.allowGravity = false;

        let direction = this.direction;

        projectile.setVelocityX(this.rangeAttackSpeed * direction);
        projectile.setFlipX(direction === -1);

        this.safeDelay(this.rangeAttackDuration, () => {
            if (projectile.active) projectile.destroy();
        });

        if (this.scene.ground) {
            this.scene.physics.add.collider(projectile, this.scene.ground, () => {
                projectile.destroy();
            });
        }

        this.scene.physics.add.overlap(projectile, this.scene.enemies, (proj, enemy) => {
            enemy.takeDamage(this.rangeDamage * this.damageMultiplier);
            proj.destroy();
        });
    }
}

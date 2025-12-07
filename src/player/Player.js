import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerDeathState from './States/PlayerDeathState.js';
import PlayerDashState from './States/PlayerDashState.js';
import PlayerKnockbackState from './States/PlayerKnockbackState.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';



/**
 * @Class Player
 * Clase del objeto Player 
 */


export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'angel_sword_idle');

        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true); //poder chocar con los bordes del mundo

        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5; //vida actual
        this.maxHealth = 5; //vida maxima
        this.dead = false;
        this.damage = 10; //daño que causa su ataque cuerpo a cuerpo
        this.rangeDamage = 1; //daño que cause su ataque a distancia
        this.direction = 1; // 1 derecha, -1 izquierda
        this.grounded = false;
        this.respawnPoint = { x: 0, y: 0 }; //punto de respawn

        this.maxVelocityX = 1000; //velocidad maxima en X
        this.maxVelocityY = 1000;//velocidad maxima en Y
        //booleanas segun el orbe que esta activado
        this.canDash = false;
        this.canShield = false;
        this.canRangeAttack = false;
        this.canShield = false;

        this.hasShield = false; //si esta activado su escudo
        this.shieldCooldown = 5000; //cooldown de su escudo
        this.shieldCooldownTimer = 0;

        this.movementSpeed = 300; //velocidad de movimiento
        this.jumpSpeed = 800; //velocidad de salto
        this.canPogoJump = false;
        this.pogoJumpJudgeTime = 100; //tiempo que puedes hacer pogo jump tras atacar hacia abajo y dar a un enemigo
        this.pogoJumpSpeed = 600; //velocidad de pogo jump 
        this.jumpBufferTime = 200; //tiempo de margen de salto
        this.jumpBufferTimer = 0;
        this.speedReduceRatioAtJump = 0.8; //la velocidad que reduce el juagdor durante su salto

        this.isDashing = false;
        this.dashSpeed = 800; //velocidad del dash
        this.dashDuration = 200; //tiempo que dura el dash
        this.dashCooldown = 500; //tiempo que hay que esperar el jugador entre dashes
        this.dashCooldownTimer = 0;

        this.meleeAttackDist = 100; //distancia entre el jugador y su hitbox de ataque
        this.meleeAttackWidge = 120;
        this.meleeAttackHeight = 70;
        this.attackCooldown = 300; //el tiempo que debe de pasar tras un ataque para poder atacar otra vez 
        this.attackDuration = 200; //cuanto dura el hitbox de su ataque
        this.isAttacking = false; //si esta atacando

        this.rangeAttackDuration = 3000; //en cuanto tiempo se destruye el projectile invocado
        this.rangeAttackSpeed = 800; //la velocidad del projectile que lanza
        this.rangeAttackCooldownTimer = 0;
        this.rangeAttackCooldown = 500; //el cooldown de su ataque a distancia

        this.invulnerable = false;
        this.invulnerableTime = 1000; //tiempo invulnerable despues de recibir daño
        this.knockbackTime = 200; // tiempo de su knockback
        this.knockbackDistance = 200; //distancia de su knockback

        this.orbs = [];                 //  orbes recogidos
        this.equippedOrbs = [null, null]; // orbes 2 equipados
        this.activeOrbIndex = 0;        // indice del orbe activo (0 o 1)
        this.damageMultiplier = 1.0;    // modificador de daño 
        this.speedMultiplier = 1.0;     //modificador de velocidad
        this.bloodStealAmount = 0;
        this.jumpSpeedModifier = 1.0;
        this.attackRangeMultiplier = 1.0;    //modificador rango de ataque melee
        this.orbTint = 0xffffff;     //color original del jugador

        this.setDepth(5);

        this.keys = scene.inputManager.keys;

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
            this.switchActiveOrb();
        });

        this.createSFX();

        //aura del escudo cuando tiene el escudo activado
        this.shieldAura = this.scene.add.image(this.x, this.y, 'playerShieldAura')
            .setDepth(this.depth + 1)           // delante del jugador
            .setAlpha(0.8)                      // semitransparente
            .setVisible(false)                  // oculto por defecto
            .setScale(1.2);

        this.setMaxVelocity(this.maxVelocityX, this.maxVelocityY);   //velocidad maxima
    }

    createSFX(){
          // Sonidos
        this.attackSound = this.scene.sound.add('PlayerAttack_sound', {
            volume: 0.2,
            loop: false
        });

        this.jumpSound = this.scene.sound.add('PlayerJump_sound', {
            volume: 1,
            loop: false
        });

        this.shieldSound = this.scene.sound.add('PlayerShield_sound', {
            volume: 0.3,
            loop: false
        });

        this.shieldBlockSound = this.scene.sound.add('PlayerShieldBlock_sound', {
            volume: 0.3,
            loop: false
        });

        this.jumpEndSound = this.scene.sound.add('PlayerJumpEnd_sound', {
            volume: 0.2,
            loop: false
        });

        this.damagedSound = this.scene.sound.add('PlayerDamaged_sound', {
            volume: 0.3,
            loop: false
        })

        this.takeOrbSound = this.scene.sound.add('PlayerTakeOrb_sound', {
            volume: 0.3,
            loop: false
        })

        this.changeOrbSound = this.scene.sound.add('PlayerChangeOrb_sound', {
            volume: 0.3,
            loop: false
        })

        this.rangeAttackSound = this.scene.sound.add('PlayerRangeAttack_sound', {
            volume: 1,
            loop: false
        })

        this.dashSound = this.scene.sound.add('PlayerDash_sound', {
            volume: 0.3,
            loop: false
        })
    }
    
    update(time, delta) {
        this.stateMachine.step(time, delta);

        this.attackDir = this.getAttackDirection();

        if (Phaser.Input.Keyboard.JustDown(this.keys.useOrb)) {
            if (this.canDash && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.stateMachine.setState('dash');
            }
            else if (this.canRangeAttack && this.rangeAttackCooldownTimer <= 0 && !this.isAttacking) {
                this.performRangeAttack();
            }
            else if (this.canShield && !this.hasShield && this.shieldCooldownTimer <= 0) {
                this.shieldAura.setVisible(true);
                this.hasShield = true;
                this?.shieldSound?.play();
                console.log("escudo activado")
            }
        }

        // ataques cuerpo a cuerpo (si hay direccion de ataque)
        if (this.attackDir && !this.isDashing) {
            this.performMeleeAttack(this.attackDir);
        }

        // manejo del buffer de salto (se comprueba siempre)
        if (Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            this.jumpBufferTimer = this.jumpBufferTime;
        } else {
            this.jumpBufferTimer -= delta;
        }

        // reducir timers independientes de si atacamos o no
        this.dashCooldownTimer -= delta;
        this.shieldCooldownTimer -= delta;
        this.rangeAttackCooldownTimer -= delta;

        //movemos al sprite de escudo
        if (this.shieldAura) {
            this.shieldAura.x = this.x;
            this.shieldAura.y = this.y;
        }
    }

    /**
        * @param {int} damage daño que recibe el jugador
        * @param {int} knockbackdirection direccion que empuja al jugador, 1 derecha y -1 izquierda   
        */
    takeDamage(damage, knockbackdirection) {

        if (this.invulnerable) return;

        this.setTint(0xff0000);
        this.safeDelay(this.invulnerableTime * 0.8, () => this.setTint(this.orbTint));

        this.invulnerable = true;
        this.safeDelay(this.invulnerableTime, () => (this.invulnerable = false));

        if (this.hasShield && damage === 1) { // si tiene escudo, bloquea los daños no mortales
            this.shieldCooldownTimer = this.shieldCooldown;
            this.hasShield = false;
            if (this.shieldAura) this.shieldAura.setVisible(false);
            console.log("daño bloqueado")
            this?.shieldBlockSound?.play();
            return;
        }

        this?.damagedSound?.play();

        this.health -= damage;
        this.emit('updateHearts', this.health, true);
        console.log(damage + ' daño recibido. Vida: ', + this.health);




        if (this.health <= 0) {
            this.die();
        }

        if (knockbackdirection && !this.dead) {
            this.stateMachine.setState('knockback', knockbackdirection);
        }
    }

    // recoge el orbe si no lo tiene ya el player

    /**
     * 
     * @param {Orb} orb orbe que recoge el jugador  
     */
    collectOrb(orb) {
        if (!this.orbs.includes(orb)) {
            this.orbs.push(orb);
            console.log('orbe recogido: ' + orb.name);
            this?.takeOrbSound?.play();
        }

        for (let i = 0; i < this.equippedOrbs.length; i++) { //si hay algun slot libre, se autoequipa el orbe recogido
            if (!this.equippedOrbs[i]) {
                this.equipOrb(i, orb)
                console.log('orbe equipado automaticamente en slot: ' + i);

                if (this.activeOrbIndex === i) { //se autoactiva el primer orbe que recoges
                    this.ActivateOrb(i)
                }
                return;
            }
        }
    }

    //equipar orbe orb en el slot slotIndex

    /**
     * 
     * @param {Int} slotIndex index de donde coloca el orbe, puede ser 0 o 1  
     * @param {Orb} orb orbe que equipa
     */
    equipOrb(slotIndex, orb) {

        if (!orb) return;
        if (slotIndex < 0 || slotIndex > 1) return;

        if (!this.orbs.includes(orb)) {
            return;
        }

        if (this.equippedOrbs[slotIndex]) {
            this.equippedOrbs[slotIndex].onDesequip(this);
            this.equippedOrbs[slotIndex].onDesactivate(this);
        }

        this.equippedOrbs[slotIndex] = orb;
        orb.onEquip(this);
        console.log('orbe equipado en slot ' + slotIndex + ' ' + orb.name);
        this.emit('orbChanged');
    }

    desEquipOrb(slotIndex) {
        if ((this.equippedOrbs[slotIndex] === null)) return;
        if (slotIndex < 0 || slotIndex > 1) return;

        this.equippedOrbs[slotIndex].onDesequip(this);
        this.equippedOrbs[slotIndex].onDesactivate(this);

        this.equippedOrbs[slotIndex] = null;

        this.switchActiveOrb()
        console.log('orbe desquipado en slot ' + slotIndex);
        this.emit('orbChanged');
    }

    //cambiar orbe activo al siguiente slot
    switchActiveOrb() {
        let nextIndex = (this.activeOrbIndex + 1) % this.equippedOrbs.length;
        this.ActivateOrb(nextIndex);
        this?.changeOrbSound?.play();
    }

    //cambiar orbe activo introduciendo manualmente el slot como parametro
    /**
     * 
     * @param {int} slotIndex index del orbe que quieres activar, puede ser 0 o 1. 
     */
    ActivateOrb(slotIndex) {
        let currentOrb = this.equippedOrbs[this.activeOrbIndex];
        let nextOrb = this.equippedOrbs[slotIndex];

        if (nextOrb) {
            if (currentOrb) currentOrb.onDesactivate(this);
            nextOrb.onActivate(this);
            this.activeOrbIndex = slotIndex;
            console.log('orbe activo: ' + nextOrb.name + ' efecto: ' + nextOrb.description);
            this.emit('orbChanged');
        }
    }



    die() {
        if (this.dead) return;
        if (this.shieldAura) this.shieldAura.setVisible(false);
        console.log('Intentando cambiar a GameOver scene...');
        this.health = this.maxHealth;
        this.scene.scene.stop();
        this.scene.scene.launch('GameOver');
        this.dead = true;
        console.log('jugador muerto');
        this.setVelocity(0, 0);
        this.stateMachine.setState('dead');
    }


    //comprueba si el jugador esta en el suelo
    isGrounded() {
        return this.body.onFloor();
    }

    //detecta si el jugador ha pulsado alguna tecla de ataque y si es el caso devuelve en que direccion
    getAttackDirection() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.upArrow)) return 'up';
        if (Phaser.Input.Keyboard.JustDown(this.keys.downArrow)) return 'down';
        if (Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)) return 'left';
        if (Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)) return 'right';

        return null;
    }

    //realiza el ataque segun la direccion
    /**
     * 
     * @param {string} direction direccion en la que ataca el jugador: left, right, up, down
     */
    performMeleeAttack(direction) {
        //comprueba si puede atacar
        if (this.isAttacking) return;

        this?.attackSound?.play();

        console.log('attack');

        this.isAttacking = true;
        //cooldown entre ataques
        this.safeDelay(this.attackCooldown, () => {
            this.isAttacking = false;
        });


        let offsetX = 0, offsetY = 0;
        let w = this.meleeAttackWidge;
        let h = this.meleeAttackHeight * this.attackRangeMultiplier;

        //calculamos el offset del hitbox segun la direccion
        switch (direction) {
            case 'left': offsetX = -this.meleeAttackDist; break;
            case 'right': offsetX = this.meleeAttackDist; break;
            case 'up': offsetY = -this.meleeAttackDist;[w, h] = [h, w]; break;
            case 'down': offsetY = this.meleeAttackDist;[w, h] = [h, w]; break;
        }

        //creamos el hitbox de ataqeu rectangular
        let hitbox = this.scene.add.rectangle(this.x + offsetX, this.y + offsetY, h, w, 0xff0000, 0.5);
        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        let hitEnemies = new Set(); // guarda enemigos dañados

        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {
            //no hacer daño varias veces al mismo enemigo
            if (hitEnemies.has(enemy)) return;
            hitEnemies.add(enemy);
            enemy.takeDamage(this.damage * this.damageMultiplier);

            if (direction === 'down') {
                this.canPogoJump = true;

                this.safeDelay(this.pogoJumpJudgeTime, () => {
                    this.canPogoJump = false;
                });
            }
        });

        // SPRITE DE ATAQUE MELEE
        let meleeSprite;
        if (this.attackRangeMultiplier != 1) {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee_Ampliado');
            meleeSprite.setDepth(10);
            meleeSprite.play({ key: 'melee_ampliado_anim', repeat: 0 });
        }
        else {
            meleeSprite = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, 'melee');
            meleeSprite.setDepth(10);
            meleeSprite.play({ key: 'melee_anim', repeat: 0 });
        }
        // Ajustar rotación / flip
        switch (direction) {
            case 'right':
                meleeSprite.setFlipX(false);
                meleeSprite.setAngle(0);
                break;

            case 'left':
                meleeSprite.setFlipX(true);
                meleeSprite.setAngle(0);
                break;

            case 'up':
                meleeSprite.setFlipX(false);
                meleeSprite.setAngle(-90);
                break;

            case 'down':
                meleeSprite.setFlipX(false);
                meleeSprite.setAngle(90);
                break;
        }


        // Destruir hitbox y sprite después de la duración del ataque
        this.safeDelay(this.attackDuration, () => {
            hitbox.destroy();
            meleeSprite.destroy();
        });
    }


    safeDelay(time, callback) {
        if (!this.scene || !this.scene.time) return;
        this.scene.time.delayedCall(time, () => {
            if (this.scene) callback();
        });

    }

    //performRangeAttack(direction) {
    //}

    performRangeAttack() {
        if (!this.canRangeAttack) return;
        if (this.isAttacking) return;

        this?.rangeAttackSound?.play();

        this.rangeAttackCooldownTimer = this.rangeAttackCooldown;
        this.isAttacking = true;

        this.safeDelay(this.rangeAttackCooldown, () => this.isAttacking = false);

        // crear proyectil
        let projectile = this.scene.physics.add.sprite(this.x, this.y, 'plume');
        projectile.setDepth(4);
        projectile.body.allowGravity = false;

        // Determinar la dirección del proyectil basada en la dirección del jugador
        let direction = this.direction; // 1 para derecha, -1 para izquierda

        // Velocidad según la dirección del jugador
        projectile.setVelocityX(this.rangeAttackSpeed * direction);

        // Rotar el sprite si está disparando a la izquierda
        if (direction === -1) {
            projectile.setFlipX(true);
        } else {
            projectile.setFlipX(false);
        }


        // destruir despues de su duracion
        this.safeDelay(this.rangeAttackDuration, () => {
            if (projectile.active) projectile.destroy();
        });

        //destruye al chocar una pared
        if (this.scene.ground) {
            this.scene.physics.add.collider(projectile, this.scene.ground, () => {
                projectile.destroy();
            });
        }

        // hace daño a enemigos
        this.scene.physics.add.overlap(projectile, this.scene.enemies, (proj, enemy) => {
            enemy.takeDamage(this.rangeDamage * this.damageMultiplier);
            proj.destroy();
        });
    }
}
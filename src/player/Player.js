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

        this.setCollideWorldBounds(true);

        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5;
        this.maxHealth = 5;
        this.dead = false;
        this.damage = 10;
        this.rangeDamage = 1;
        this.direction = 1; // 1 derecha, -1 izquierda
        this.grounded = false;
        this.respawnPoint = { x: 0, y: 0 };

        this.canDash = false;
        this.canShield = false;
        this.canRangeAttack = false;


        this.movementSpeed = 300;
        this.jumpSpeed = 800;
        this.canPogoJump = false;
        this.pogoJumpJudgeTime = 100; //tiempo que puedes hacer pogo jump tras atacar hacia abajo y dar a un enemigo
        this.pogoJumpSpeed = 600; //velocidad de pogo jump 
        this.jumpBufferTime = 200; //tiempo de margen de salto
        this.jumpBufferTimer = 0;
        this.speedReduceRatioAtJump = 0.8;

        this.isDashing = false;
        this.dashSpeed = 1300;
        this.dashDuration = 200;
        this.dashCooldown = 500;
        this.dashCooldownTimer = 0;

        this.meleeAttackDist = 100;
        this.meleeAttackWidge = 120;
        this.meleeAttackHeight = 70;
        this.attackCooldown = 300; //el tiempo que debe de pasar tras un ataque para poder atacar otra vez 
        this.attackDuration = 100; //cuanto dura el hitbox de su ataque
        this.isAttacking = false; //si esta atacando

        this.rangeAttackDuration = 3000;
        this.rangeAttackSpeed = 800;
        this.rangeAttackCooldown = 300;

        this.invulnerable = false;
        this.invulnerableTime = 1000; //tiempo invulnerable despues de recibir daño
        this.knockbackTime = 200; // tiempo de su knockback
        this.knockbackDistance = 200; //distancia de su knockback

        this.orbs = [];                 //  orbes recogidos
        this.equippedOrbs = [null, null]; // orbes 2 equipados
        this.activeOrbIndex = 0;        // indice del orbe activo (0 o 1)
        this.damageMultiplier = 1.0;    // modificador de daño 
        this.speedMultiplier = 1.0;
        this.orbTint = 0xffffff;

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

        // Sonidos
        this.jumpSound = this.scene.sound.add('jump_sound', {
            volume: 0.5,
            loop: false
        });

        this.damageSound = this.scene.sound.add('damage_sound', {
            volume: 0.5,
            loop: false
        });
    }

    update(time, delta) {
        this.stateMachine.step(time, delta);

        this.attackDir = this.getAttackDirection();
        if (Phaser.Input.Keyboard.JustDown(this.keys.useOrb)) {
            if (this.canDash && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.stateMachine.setState('dash');
            }
            else if (this.canRangeAttack && this.dashCooldownTimer <= 0 && !this.isDashing) {
                this.performRangeAttack();
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
    }

    /**
        * @param {int} damage daño que recibe el jugador
        * @param {int} knockbackdirection direccion que empuja al jugador, 1 derecha y -1 izquierda   
        */
        takeDamage(damage, knockbackdirection) {

            if (this.invulnerable) return;

            if (this.damageSound) {
                this.damageSound.play();
            }

            this.setTint(0xff0000);
            this.safeDelay(this.invulnerableTime * 0.8, () => this.setTint(this.orbTint));

            this.scene.time.delayedCall(this.invulnerableTime * 0.8, () => this.setTint(this.orbTint));


            this.invulnerable = true;


            this.health -= damage;
            this.emit('updateHearts', this.health, true);
            console.log(damage + ' daño recibido. Vida: ', + this.health);

            this.safeDelay(this.invulnerableTime, () => (this.invulnerable = false));


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
            }


            for (let i = 0; i < this.equippedOrbs.length; i++) {
                if (!this.equippedOrbs[i]) {
                    this.equipOrb(i, orb)
                    console.log('orbe equipado automaticamente en slot: ' + i);

                    if (this.activeOrbIndex === i) {
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
                this.equippedOrbs[slotIndex].onUnequip(this);
                this.equippedOrbs[slotIndex].onDeactivate(this);
            }

            this.equippedOrbs[slotIndex] = orb;
            orb.onEquip(this);
            console.log('orbe equipado en slot ' + slotIndex + ' ' + orb.name);
            this.emit('orbChanged');
        }


        //cambiar orbe activo al siguiente slot
        switchActiveOrb() {
            let nextIndex = (this.activeOrbIndex + 1) % this.equippedOrbs.length;
            this.ActivateOrb(nextIndex);
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
                if (currentOrb) currentOrb.onDeactivate(this);
                nextOrb.onActivate(this);
                this.activeOrbIndex = slotIndex;
                console.log('orbe activo: ' + nextOrb.name + ' efecto: ' + nextOrb.description);
                this.emit('orbChanged');
            }
        }


    
        die() {
            if (this.dead) return;
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

            console.log('attack');

            this.isAttacking = true;
            //cooldown entre ataques
            this.safeDelay(this.attackCooldown, () => {
                this.isAttacking = false;
            });


            let offsetX = 0, offsetY = 0;
            let w = this.meleeAttackWidge;
            let h = this.meleeAttackHeight;

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

            //destruir el hitbox tras attackduration
            this.safeDelay(this.attackDuration, () => hitbox.destroy());
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

            this.isAttacking = true;

            this.safeDelay(this.rangeAttackCooldown, () => this.isAttacking = false);

            // crear proyectil
            let projectile = this.scene.physics.add.sprite(this.x, this.y, 'range_projectile');
            projectile.setDepth(4);
            projectile.body.allowGravity = false;

            // velocidad segun su direccion
            projectile.setVelocityX(this.rangeAttackSpeed * this.direction);

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
import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerDeathState from './States/PlayerDeathState.js';
import PlayerKnockbackState from './States/PlayerKnockbackState.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'angel_sword_idle'); 

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setGravityY(1000);

        this.scene = scene;

        this.health = 5;
        this.maxHealth = 5;
        this.damage = 1;
        this.direction = 1; // 1 derecha, -1 izquierda
        this.hasDash = false;
        this.hasShield = false;
        this.grounded = false;
        this.movementSpeed = 300;
        this.jumpSpeed = 800;
        this.canPogoJump = false;
        this.pogoJumpJudgeTime = 200; //tiempo que puedes hacer pogo jump tras atacar hacia abajo y dar a un enemigo
        this.pogoJumpSpeed = 600; //velocidad de pogo jump 
        this.dead = false;


        this.meleeAttackDist = 100;
        this.meleeAttackWidge = 120;
        this.meleeAttackHeight = 70;
        this.attackCooldown = 300; //el tiempo que debe de pasar tras un ataque para poder atacar otra vez 
        this.attackDuration = 100; //cuanto dura el hitbox de su ataque
        this.isAttacking = false; //si esta atacando

        this.invulnerableTime = 1000; //tiempo invulnerable despues de recibir daño
        this.knockbackTime = 200; // tiempo de su knockback
        this.knockbackDistance = 200; //distancia de su knockback

        this.orbs = [];                 //  orbes recogidos
        this.equippedOrbs = [null, null]; // orbes 2 equipados
        this.activeOrbIndex = 0;        // indice del orbe activo (0 o 1)
        this.damageMultiplier = 1.0;    // modificador de daño 
        this.speedMultiplier = 1.0;
        this.orbTint = 0xffffff;


        this.keys = scene.inputManager.keys;

       this.stateMachine = new StateMachine(this, 'player');
       this.stateMachine
        .addState('idle', new PlayerIdleState())
        .addState('move', new PlayerMoveState())
        .addState('jump', new PlayerJumpState())
        .addState('knockback', new PlayerKnockbackState())
        .addState('dead', new PlayerDeathState())
        .setState('idle');


        this.keys.changeOrb.on('down', () => {
            this.switchActiveOrb();
        });

    }

    update(time, delta) {
        this.stateMachine.step(time, delta);

        this.attackDir = this.getAttackDirection();
        if (this.attackDir) {
            this.performAttack(this.attackDir);
        }
    }

    takeDamage(damage,knockbackdirection) {

        if (this.invulnerable) return;

        this.setTint(0xff0000);
        this.scene.time.delayedCall(this.invulnerableTime*0.8, () => this.setTint(this.orbTint));

        this.invulnerable = true;


        this.health -= damage;
        this.emit('removeHealth', this.health);
        console.log(damage + ' daño recibido. Vida: ', + this.health);

        this.scene.time.delayedCall(this.invulnerableTime, () => (this.invulnerable = false));

        if (this.health <= 0) {
        this.die();
        }

        if (knockbackdirection && !this.dead){
            this.stateMachine.setState('knockback', knockbackdirection);
        }
    }

    // recoge el orbe si no lo tiene ya el player
    collectOrb(orb) {
        if (!this.orbs.includes(orb)) {
            this.orbs.push(orb);
            console.log('orbe recogido: ' + orb.name);
        }


        for (let i=0; i<this.equippedOrbs.length; i++){
            if (!this.equippedOrbs[i]) {
                this.equipOrb(i,orb)
                console.log('orbe equipado automaticamente en slot: ' + i);

                if (this.activeOrbIndex === i){
                    this.ActivateOrb(i)
                }
                return; 
            }
        }
    }

    //equipar orbe orb en el slot slotIndex
    equipOrb(slotIndex, orb) {
        if(!orb) return;
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
        console.log('orbe equipado en slot ' +slotIndex + ' ' + orb.name);
        this.emit('orbChanged');
    }


    //cambiar orbe activo al siguiente slot
    switchActiveOrb() {
        let nextIndex = (this.activeOrbIndex + 1) % this.equippedOrbs.length;
        this.ActivateOrb(nextIndex);
   }

   //cambiar orbe activo introduciendo manualmente el slot como parametro
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


   //funcion que se llama cuando el jugador muere
    die() {
        if (this.dead) return;
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

        if (Phaser.Input.Keyboard.JustDown(this.keys.upArrow))   return 'up';
        if (Phaser.Input.Keyboard.JustDown(this.keys.downArrow)) return 'down';
        if (Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)) return 'left';
        if (Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)) return 'right';

        return null;
    }

    //realiza el ataque segun la direccion
    performAttack(direction) {
        //comprueba si puede atacar
        if (this.isAttacking) return;

        console.log('attack');

        //cooldown entre ataques
        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.isAttacking = false;
        });

        let offsetX = 0, offsetY = 0;
        let w = this.meleeAttackWidge;
        let h = this.meleeAttackHeight;

        //calculamos el offset del hitbox segun la direccion
        switch (direction) {
            case 'left':  offsetX = -this.meleeAttackDist; break;
            case 'right': offsetX = this.meleeAttackDist;  break;
            case 'up':    offsetY = -this.meleeAttackDist; [w, h] = [h, w]; break;
            case 'down':  offsetY = this.meleeAttackDist;  [w, h] = [h, w]; break;
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

            if (direction === 'down' && enemy.active && !enemy.dead) {
            this.canPogoJump = true;
            this.scene.time.delayedCall(this.pogoJumpJudgeTime, () => this.canPogoJump = false);
        }
        });

        //destruir el hitbox tras attackduration
        this.scene.time.delayedCall(this.attackDuration, () => hitbox.destroy());
    }

}
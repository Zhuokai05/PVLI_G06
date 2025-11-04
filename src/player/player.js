import StateMachine from '../stateMachine/StateMachine.js';
import PlayerIdleState from './States/PlayerIdleState.js';
import PlayerMoveState from './States/PlayerMoveState.js';
import PlayerJumpState from './States/PlayerJumpState.js';
import PlayerMeleeAttackState from './States/PlayerMeleeAttackState.js';
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

        this.attackCooldown = 300; 
        this.meleeAttackDist = 80;
        this.meleeAttackWidge = 120;
        this.meleeAttackHeight = 70;
        this.attackDuration = 100; //cuanto dura el hitbox de su ataque

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
        .addState('attack', new PlayerMeleeAttackState())
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
    }

    takeDamage(damage,knockbackdirection) {

        if (this.invulnerable) return;

        this.setTint(0xff0000);
        this.scene.time.delayedCall(this.invulnerableTime*0.8, () => this.setTint(this.orbTint));

        this.invulnerable = true;

        if (knockbackdirection){
            this.stateMachine.setState('knockback', knockbackdirection);
        }

        this.health -= damage;
        this.emit('removeHealth', this.health);
        console.log(damage + ' daño recibido. Vida: ', + this.health);

        this.scene.time.delayedCall(this.invulnerableTime, () => (this.invulnerable = false));

        if (this.health <= 0) {
        this.die();
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


    die() {
        console.log('jugador muerto');
        this.setVelocity(0, 0);
        this.stateMachine.setState('dead');
    }

    isGrounded() {
        return this.body.onFloor();
    }

    getAttackDirection() {

        if (Phaser.Input.Keyboard.JustDown(this.keys.upArrow))   return 'up';
        if (Phaser.Input.Keyboard.JustDown(this.keys.downArrow)) return 'down';
        if (Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)) return 'left';
        if (Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)) return 'right';

        return null;
    }
}
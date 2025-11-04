import BaseState from '../../stateMachine/BaseState.js';

export default class PlayerAttackState extends BaseState {
  enter(player) {
    this.player = player;
    player.isAttacking = true;

    this.meleeAttack(player.attackDir);
  }

  execute(player, time, delta) {

    if (!player.isAttacking) {
      player.stateMachine.setState('idle');
    }
  }

  meleeAttack(direction) {

    if (this.player.attackCooldownTimer > 0) return;

    console.log('attack')

    this.player.attackCooldownTimer = this.player.attackCooldown; 

    this.player.scene.time.delayedCall(this.player.attackCooldown, () => {
        this.player.isAttacking = false;
        this.player.attackCooldownTimer = 0;
    });

    let offsetX = 0, offsetY = 0;

    let w = this.player.meleeAttackWidge;
    let h = this.player.meleeAttackHeight;

    switch (direction) {
        case 'left': 
            offsetX = -this.player.meleeAttackDist; 
            break;
        case 'right': 
            offsetX = this.player.meleeAttackDist; 
            break;
        case 'up': 
            offsetY = -this.player.meleeAttackDist; 
            [w,h] = [h,w]   
            break;
        case 'down': 
            offsetY = this.player.meleeAttackDist; 
            [w,h] = [h,w] 
            break;
    }

    let hitbox = this.player.scene.add.rectangle(this.player.x + offsetX, this.player.y + offsetY, h, w, 0xff0000, 0.5);
    this.player.scene.physics.add.existing(hitbox);
    hitbox.body.allowGravity = false;

    let hitEnemies = new Set();
    this.player.scene.physics.add.overlap(hitbox, this.player.scene.enemies, (hb, enemy) => {

        if (hitEnemies.has(enemy)) return; 
        hitEnemies.add(enemy);

        enemy.takeDamage(this.player.damage *this.player.damageMultiplier);

    });

    this.player.scene.time.delayedCall(this.player.attackDuration, () => hitbox.destroy());
  }

}
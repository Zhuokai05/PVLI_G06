import BaseEnemyAttackState from './BaseEnemyAttackState.js';

export default class BasicMeleeEnemyAttackState extends BaseEnemyAttackState {
  
    enter (enemy){
        super.enter(enemy);
        let direction = enemy.player.x > enemy.x ? 1 : -1;
        this.meleeAttack(direction);
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta); 
        }


    meleeAttack(direction) {

        if (this.enemy.attackCooldownTimer > 0) return;

        console.log('enemy attack')

        this.enemy.attackCooldownTimer = this.enemy.attackCooldown; 

        this.enemy.scene.time.delayedCall(this.enemy.attackCooldown, () => {
            this.enemy.isAttacking = false;
            this.enemy.attackCooldownTimer = 0;
        });


        let w = this.enemy.meleeAttackWidge;
        let h = this.enemy.meleeAttackHeight;

        let offsetX = direction * this.enemy.meleeAttackDist;
        let hitbox = this.enemy.scene.add.rectangle(this.enemy.x + offsetX, this.enemy.y, h, w, 0xff0000, 0.5);
        this.enemy.scene.physics.add.existing(hitbox);

        hitbox.body.allowGravity = false;

        let damaged = false;
        this.enemy.scene.physics.add.overlap(hitbox, this.enemy.player, (hb, player) => {

            if (damaged) return; 
            damaged = true;
            player.takeDamage(this.enemy.damage);

        });

        this.enemy.scene.time.delayedCall(this.enemy.attackDuration, () => hitbox.destroy());
    }
}

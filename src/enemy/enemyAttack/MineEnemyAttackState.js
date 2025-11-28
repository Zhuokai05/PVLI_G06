import BaseEnemyAttackState from './BaseEnemyAttackState.js';

export default class MineEnemyAttackState extends BaseEnemyAttackState {
  
    enter (enemy){
        super.enter(enemy);
        this.Explode();

    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta); //Cambia de estado si no esta atacando
    }

    //explota el enemigo y hace un daño en area
    Explode() {

        let w = this.enemy.meleeAttackWidge;
        let h = this.enemy.meleeAttackHeight;

        //creamos hitbox rectangular como rango de ataque
        let hitbox = this.enemy.scene.add.circle(this.enemy.x, this.enemy.y, w,h, 0xff0000, 0.5);
        this.enemy.scene.physics.add.existing(hitbox);

        hitbox.body.allowGravity = false;

        //destruir hitbox tras attackduration
        this.enemy.scene.time.delayedCall(this.enemy.attackDuration, () => 
            {
                let damaged = false;
                this.enemy.scene.physics.add.overlap(hitbox, this.enemy.player, (hb, player) => {

                    //no aplicar daño otra vez si ya esta dañado
                    if (damaged) return; 
                    damaged = true;
                    let knockbackDirection = player.x < this.enemy.x ? -1 : 1;
                    player.takeDamage(this.enemy.damage,knockbackDirection);
                    this.enemy.isAttacking = false;
                });
            }
        );
    }

    exit(enemy){
        enemy.health = 0;
        enemy.die();
    }
}

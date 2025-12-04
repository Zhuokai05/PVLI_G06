import BaseEnemyAttackState from './BaseEnemyAttackState.js';

export default class MeleeEnemyAttackState extends BaseEnemyAttackState {
  
    enter (enemy){
        super.enter(enemy);
        this.hasAttacked = false;
        let direction = enemy.player.x > enemy.x ? 1 : -1;
        
        if(!this.hasAttacked){
            this.meleeAttack(direction);
            this.hasAttacked = true; 
        }  

    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta); //Cambia de estado si no esta atacando
    }


    /**
     * 
     * @param {int} direction direccion que ataca el enemigo, 1 derecha, -1 izquierda  
     */
    meleeAttack(direction) {

        let w = this.enemy.meleeAttackWidge;
        let h = this.enemy.meleeAttackHeight;

        let offsetX = direction * this.enemy.meleeAttackDist;

        //creamos hitbox rectangular como rango de ataque
        this.hitbox = this.enemy.scene.add.rectangle(this.enemy.x + offsetX, this.enemy.y, h, w, 0xff0000, 0.5);
        this.enemy.scene.physics.add.existing(this.hitbox);

        this.hitbox.body.allowGravity = false;

        let damaged = false;

        this.enemy.scene.physics.add.overlap(this.hitbox, this.enemy.player, (hb, player) => {

            //no aplicar daño otra vez si ya esta dañado
            if (damaged) return; 
            damaged = true;
            let knockbackDirection = player.x < this.enemy.x ? -1 : 1;
            player.takeDamage(this.enemy.damage,knockbackDirection);

        });

    }

    exit(enemy){
        //destruir hitbox 
        this.hitbox.destroy();
    }
}

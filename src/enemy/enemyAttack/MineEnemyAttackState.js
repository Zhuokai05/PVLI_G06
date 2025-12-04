import BaseEnemyAttackState from './BaseEnemyAttackState.js';

export default class MineEnemyAttackState extends BaseEnemyAttackState {
  
    enter(enemy){
        super.enter(enemy);
        this.Explode(enemy);
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);
    }

    Explode(enemy) {

        // hitbox del area de ataque
        this.hitbox = enemy.scene.add.rectangle(enemy.x, enemy.y, enemy.meleeAttackWidge,enemy.meleeAttackHeight, 0xff0000, 0.4);

        enemy.scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;

    }

    exit(enemy){
        //cuando termina el ataque, mira si esta el jugador dentro y le hace daño
        enemy.scene.physics.overlap(this.hitbox, enemy.player, (hb, player) => {
            let knockbackDirection = player.x < enemy.x ? -1 : 1;
            player.takeDamage(enemy.damage, knockbackDirection);
        });

        //destruye el hitbox y muere tras explotar
        this.hitbox.destroy();
        enemy.health = 0;
        enemy.die();
    }
}

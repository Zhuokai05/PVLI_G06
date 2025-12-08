import BaseEnemyAttackState from './BaseEnemyAttackState.js';

/**
 * estado de explosion para enemigo mina
 */
export default class MineEnemyAttackState extends BaseEnemyAttackState {
  
    enter(enemy) {
        super.enter(enemy);
        this.Explode(enemy);                     // crear hitbox de explosion
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);
    }

    /**
     * crea el hitbox de explosion
     */
    Explode(enemy) {

        this.hitbox = enemy.scene.add.rectangle(
            enemy.x,
            enemy.y,
            enemy.meleeAttackWidge,
            enemy.meleeAttackHeight,
            0xff0000,
            0.4
        );

        enemy.scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;
    }

    exit(enemy) {

        // aplicar danio si jugador esta dentro
        enemy.scene.physics.overlap(
            this.hitbox,
            enemy.player,
            (hb, player) => {
                let knockDir = player.x < enemy.x ? -1 : 1;
                player.takeDamage(enemy.damage, knockDir);
            }
        );

        this.hitbox.destroy();
        enemy.die();                             // mina muere tras explotar
    }
}

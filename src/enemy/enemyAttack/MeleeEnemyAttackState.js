import BaseEnemyAttackState from './BaseEnemyAttackState.js';

/**
 * estado de ataque melee
 */
export default class MeleeEnemyAttackState extends BaseEnemyAttackState {
  
    enter(enemy) {
        super.enter(enemy);
        this.hasAttacked = false;               // evita doble ataque
        let direction = enemy.player.x > enemy.x ? 1 : -1;

        if (!this.hasAttacked) {
            this.meleeAttack(direction);
            this.hasAttacked = true;
        }
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);       // termina ataque si ya acabo
    }

    /**
     * ataque melee con hitbox
     */
    meleeAttack(direction) {

        let w = this.enemy.meleeAttackWidge;     // ancho hitbox
        let h = this.enemy.meleeAttackHeight;    // alto hitbox
        let offsetX = direction * this.enemy.meleeAttackDist;

        // crear hitbox
        this.hitbox = this.enemy.scene.add.rectangle(
            this.enemy.x + offsetX,
            this.enemy.y,
            h,
            w,
            0xff0000,
            0.5
        );

        this.enemy.scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;

        let damaged = false;

        // colision con jugador
        this.enemy.scene.physics.add.overlap(
            this.hitbox,
            this.enemy.player,
            (hb, player) => {
                if (damaged) return;
                damaged = true;

                let knockDir = player.x < this.enemy.x ? -1 : 1;
                player.takeDamage(this.enemy.damage, knockDir);
            }
        );
    }

    exit(enemy) {
        this.hitbox.destroy();                  // eliminar hitbox al salir
    }
}

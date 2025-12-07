import BaseEnemyAttackState from './BaseEnemyAttackState.js';
import RangedEnemyProjectile from '../Proyectile/RangedEnemyProjectile.js';

/**
 * estado de ataque para enemigos a distancia
 */
export default class RangedEnemyAttackState extends BaseEnemyAttackState {

    enter(enemy) {
        super.enter(enemy);
        this.hasAttacked = false;

        if (!this.hasAttacked) {
            this.shootProjectile(enemy);
            this.hasAttacked = true;
        }

        enemy.body.allowGravity = false;         // no caer durante ataque
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);
    }

    /**
     * dispara proyectil hacia el jugador
     */
    shootProjectile(enemy) {

        let projectile = new RangedEnemyProjectile(
            enemy.scene,
            enemy.x,
            enemy.y,
            enemy,
            enemy.projectileTexture,
            enemy.projectileTextureFrame,
            enemy.scene.player
        );
    }
}

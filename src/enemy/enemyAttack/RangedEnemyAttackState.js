import BaseEnemyAttackState from './BaseEnemyAttackState.js';
import RangedEnemyProjectile from '../Proyectile/RangedEnemyProjectile.js';

export default class RangedEnemyAttackState extends BaseEnemyAttackState {

    enter (enemy){
        super.enter(enemy);
        this.shootProjectile(enemy);
        console.log("shot")

    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta); 
    }


    /**
     * 
     * @param {BaseEnemy} enemy El enemigo que dispara la bala
     */
    shootProjectile(enemy) {
        let projectile = new RangedEnemyProjectile(
            enemy.scene,
            enemy.x,
            enemy.y,
            enemy,
            enemy.scene.player,
        );

    }
    exit (enemy){
        super.exit(enemy);
    }
}

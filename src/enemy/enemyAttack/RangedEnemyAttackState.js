import BaseEnemyAttackState from './BaseEnemyAttackState.js';
import RangedEnemyProjectile from '../Proyectile/RangedEnemyProjectile.js';

export default class RangedEnemyAttackState extends BaseEnemyAttackState {

    enter (enemy){
        super.enter(enemy);
        this.hasAttacked = false;

        if(!this.hasAttacked){
            this.shootProjectile(enemy);
            this.hasAttacked = true; 
        }  
        enemy.body.allowGravity = false; 
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta); //Cambia de estado si no esta atacando
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
            'orbDamage',
            enemy.scene.player,
        );

    }
}

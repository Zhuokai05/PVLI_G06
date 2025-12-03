import BaseEnemy from './BaseEnemy.js';
import GroundEnemyMoveState from './enemyMove/GroundEnemyMoveState.js';
import MineEnemyAttackState from './enemyAttack/MineEnemyAttackState.js';

export default class MineEnemy extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 120;
    this.attackRange = 50; //rango de ataque
    this.attackDuration = 1000; //cuanto tarda su ataque en explotar

    this.meleeAttackWidge = 60; //ancho del hitbox de ataque 
    this.meleeAttackHeight = 60;// alto del hitbox de ataque
    this.meleeAttackDist = 0; //distancia de su ataque
    this.startAttackTime = 0; //no se puede cancelar su ataque por lo que no hay que cargarlo

    this.stateMachine
      .addState('move', new GroundEnemyMoveState())
      .addState('attack', new MineEnemyAttackState())
      .setState('move');
  }

   CollisionWithPlayer(player, enemy) {
    //lo dejamos vacio para que no dañe al jugador en colision, ya que puede hacer doble daño con la de explosion
  }

  playMoveAnimation(){
    this.play('Fire_Mine_Move', true);
    console.log("Playmove")
  }
}


  
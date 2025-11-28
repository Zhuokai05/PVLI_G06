import BaseEnemyMoveState from './BaseEnemyMoveState.js';

export default class BasicMeleeEnemyMoveState extends BaseEnemyMoveState {
  enter(enemy){
    super.enter(enemy)
  }
  
  execute(enemy, time, delta) {
    super.execute(enemy, time, delta); 
  }

  exit(enemy) {
    super.exit(enemy)
  }
}
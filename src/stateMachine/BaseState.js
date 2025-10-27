export default class BaseState {
  constructor() {
    this.stateMachine = null; 
  }

  enter(player) {}


  execute(player, time, delta) {}

  exit(player) {}
}
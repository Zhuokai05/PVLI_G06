export default class BaseState {
  constructor() {
    this.stateMachine = null; 
  }

  enter(context) {}


  execute(context, time, delta) {}

  exit(context) {}
}
export default class BaseState {
  constructor() {
    this.stateMachine = null; 
  }

  enter(context) {} //lo que hace al entrar en el estado


  execute(context, time, delta) {} //el update propio del estado

  exit(context) {} // lo que hace al salir del estado
}
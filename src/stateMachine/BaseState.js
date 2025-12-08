/**
 * clase base para estados de la maquina
 * cada estado hereda esto y redefine enter, execute y exit
 */
export default class BaseState {

  constructor() {
    this.stateMachine = null;            // referencia a la maquina que lo usa
  }

  /**
   * se ejecuta al entrar en el estado
   * @param {object} context objeto que usa el estado (player, enemigo, etc)
   */
  enter(context) {}                      // acciones al entrar

  /**
   * se ejecuta cada frame mientras este estado esta activo
   * @param {object} context objeto que usa el estado
   * @param {number} time tiempo actual
   * @param {number} delta tiempo entre frames
   */
  execute(context, time, delta) {}       // update del estado

  /**
   * se ejecuta antes de salir del estado
   * @param {object} context objeto que usa el estado
   */
  exit(context) {}                       // acciones al salir
}

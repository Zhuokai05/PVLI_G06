/**
 * maquina de estados finita
 * controla que estado esta activo y realiza enter/exit/execute
 */
export default class StateMachine {

    /**
     * @param {object} context objeto que usa la maquina (player, enemigo, etc)
     * @param {string} id etiqueta de la maquina
     */
    constructor(context, id) {
        this.id = id;                         // identificador del sistema
        this.context = context;               // objeto dueno de la maquina
        this.states = new Map();              // mapa de estados registrados
        this.currentState = null;             // estado activo actual
        this.previousState = null;            // estado previo
    }

    /**
     * registra un nuevo estado en la maquina
     * @param {string} name nombre del estado
     * @param {BaseState} state instancia del estado
     */
    addState(name, state) {
        this.states.set(name, state);         // guardar en el mapa
        state.stateMachine = this;            // asignar referencia inversa
        return this;                          // permite encadenar llamadas
    }

    /**
     * cambia el estado actual
     * @param {string} name nombre del nuevo estado
     * @param {*} data datos opcionales para enter
     */
    setState(name, data) {

        let newState = this.states.get(name); // buscar estado
        if (!newState) {
            console.warn('estado no encontrado');
            return;
        }

        // salir del estado anterior
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit(this.context);
        }

        this.previousState = this.currentState; // guardar referencia
        this.currentState = newState;           // actualizar estado activo

        // entrar en el nuevo estado
        if (this.currentState.enter) {
            this.currentState.enter(this.context, data);
        }
    }

    /**
     * ejecuta el estado actual cada frame
     */
}
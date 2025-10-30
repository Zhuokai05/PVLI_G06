 //Clase base maquina de estados que controla que estado esta activo.
 
export default class StateMachine {
    constructor(context, id) {
        this.id = id;                 // identificador, la etiqueta
        this.context = context;       // objeto que la usa, ej: player
        this.states = new Map();      // todos los estados registrados
        this.currentState = null;     // estado actual
        this.previousState = null;    // estado anterior
    }

    addState(name, state) {
        this.states.set(name, state);
        state.stateMachine = this; 
        return this
    }

    setState(name,data) {
        let newState = this.states.get(name);
        if (!newState) {
            console.warn('estado no encontrado');
            return;
        }

        // llama exit del estado actual
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit(this.context);
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        // llamar enter del nuevo estado
        if (this.currentState.enter) {
            this.currentState.enter(this.context,data);
        }

        console.log(`State of ${this.id}: ${name}`);
    }

    step(time, delta) {
        if (this.currentState && this.currentState.execute) {
            this.currentState.execute(this.context, time, delta);
        }
    }

    getStateName() {
        for (let [name, state] of this.states.entries()) {
            if (state === this.currentState) return name;
        }
        return null;
    }
}
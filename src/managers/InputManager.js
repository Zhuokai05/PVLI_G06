/**
 * clase inputmanager
 * gestiona y mapea las teclas de entrada del usuario en la escena
 */
export default class InputManager {

    /**
     * constructor del gestor de entrada
     * @param {object} scene - escena de phaser actual
     */
    constructor(scene) {
        this.scene = scene // referencia a la escena
        
        // mapeo de teclas utilizando codigos de phaser
        this.keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,         // mover a la izquierda
            right: Phaser.Input.Keyboard.KeyCodes.D,        // mover a la derecha
            jump: Phaser.Input.Keyboard.KeyCodes.W,         // saltar (w)
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,    // saltar (barra espaciadora)
            interact: Phaser.Input.Keyboard.KeyCodes.E,     // interaccion
            useOrb: Phaser.Input.Keyboard.KeyCodes.C,       // usar habilidad/ataque a distancia
            pause: Phaser.Input.Keyboard.KeyCodes.ESC,      // pausar
            upArrow: Phaser.Input.Keyboard.KeyCodes.UP,     // flecha arriba (para ataque/movimiento)
            downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN, // flecha abajo (para ataque/movimiento)
            leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT, // flecha izquierda (para ataque/movimiento)
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT, // flecha derecha (para ataque/movimiento)
            changeOrb:Phaser.Input.Keyboard.KeyCodes.Q,     // cambiar orbe activo
        });
    }
}
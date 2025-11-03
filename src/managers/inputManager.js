export default class InputManager {
    constructor(scene) {
        this.scene = scene
        
        this.keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            dash: Phaser.Input.Keyboard.KeyCodes.L,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC,
            upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
            downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
            leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            changeOrb:Phaser.Input.Keyboard.KeyCodes.Q,
        });
    }
}
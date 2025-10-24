export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = scene.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
            attack: Phaser.Input.Keyboard.KeyCodes.J,
            dash: Phaser.Input.Keyboard.KeyCodes.L,
            pause: Phaser.Input.Keyboard.KeyCodes.ESC,
        });
    }
}
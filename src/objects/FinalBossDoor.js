import DoorBoss from '../objects/BossDoor.js';
import PlayerDataManager from '../managers/PlayerDataManager.js';

export default class FinalBossDoor extends DoorBoss {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }

    openDoor() {
        if (!PlayerDataManager.data.bossStatus.sadness || !PlayerDataManager.data.bossStatus.anger) {
            console.log("No se puede abrir la puerta: te falta matar dos bosses");
            this.showMessage("Necesitas derrotar como mínimo dos bosses, IRA y TRISTEZA");
            return;
        }

        super.openDoor();
    }

    showMessage(text) {
        // Create temporary text on screen
        const textStyle = {
            font: '24px Arial',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
            align: 'center'
        };

        // Show text at door position
        const message = this.scene.add.text(
            this.x,
            this.y - 100,
            text,
            textStyle
        ).setOrigin(0.5).setDepth(1000);

        // Make text disappear after 3 seconds
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            duration: 1000,
            delay: 2000,
            onComplete: () => {
                message.destroy();
            }
        });
    }
}

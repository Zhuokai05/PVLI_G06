import PlayerDataManager from "../managers/PlayerDataManager.js";

export default class InvisibleTrigger extends Phaser.GameObjects.Zone {

    constructor(scene, x, y) {
        super(scene, x, y, 256, 256);

        this.scene = scene;
        this.doors = [];

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        this.setVisible(false); // invisible REAL

        this.boss = null;
    }

    getBoss(boss) {
        this.boss = boss;
    }

    getDoors(doorsArray) {
        this.doors = doorsArray;
    }

    llamar() {
        if (this.boss && !PlayerDataManager.data.bossStatus[this.boss.bossName]) {
            console.log("EL BOSS DE LA PUERTA REGISTRADO ES", this.boss);
            this.boss.setLife();

            this.doors.getChildren().forEach(door => {
                door.cerrarPuerta();
            });
        }
    }
}

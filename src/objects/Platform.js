export default class BasePlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2.5, 1);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.body.moves = false;

        this.active = true;
        this.visible = true;

        // Nueva propiedad para rastrear si está desactivada
        this.isDeactivated = false;
    }

    // Método para desactivar la plataforma (por colisión con puño)
    deactivateByPunch() {
        if (this.isDeactivated) return; // Si ya está desactivada, no hacer nada

        this.isDeactivated = true;
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        // Reactivar después de X segundos
        this.scene.time.delayedCall(4000, () => {
            this.reactivate();
        });
    }

    // Método para reactivar la plataforma
    reactivate() {
        this.isDeactivated = false;
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.body.moves = false;
    }

    action() {
        if (!this.active || this.isDeactivated) return;

        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;

        this.scene.time.delayedCall(10000, () => {
            this.setActive(true);
            this.setVisible(true);
            this.body.enable = true;
            this.body.setAllowGravity(false);
            this.setImmovable(true);
            this.body.moves = false;
        });
    }
}

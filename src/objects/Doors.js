export default class Door extends Phaser.Physics.Arcade.Sprite
{

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.abrir = false;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setAllowGravity(false); // Desactiva gravedad
        this.body.setGravity(0);      // Asegura que no tenga gravedad residual
    }


    changeOpen()
    {
        this.abrir = !this.abrir;

    }

    openDoor()
    {
        // Se sobreescribirá en clases hijas
        console.log("Puerta abierta");
    }

    closeDoor()
    {
        // Se sobreescribirá en clases hijas
        console.log("Puerta cerrada");
    }
}

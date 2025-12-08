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


    cambiarAbrir()
    {
        this.abrir = !this.abrir;

    }

    abrirPuerta()
    {
        // Se sobreescribirá en clases hijas
        console.log("Puerta abierta");
    }

    cerrarPuerta()
    {
        // Se sobreescribirá en clases hijas
        console.log("Puerta cerrada");
    }
}

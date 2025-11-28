export default class Door extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture)
    {
        super(scene, x, y, texture);

        this.scene = scene;
        this.abrir = false; 

        this.body.setAllowGravity(false);
    }

    cambiarAbrir()
    {
        this.abrir = !this.abrir;
        if (this.abrir) this.abrirPuerta();
        else this.cerrarPuerta();
    }

    abrirPuerta()
    {
       
    }

    cerrarPuerta()
    {
        
    }
}

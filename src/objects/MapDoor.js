import Door from "./Doors.js";

export default class MapDoor extends Door
{
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);

        this.setVisible(true);
        this.setActive(true);
    }

    cambiarAbrir()
    {
        this.abrir = !this.abrir;

        if (this.abrir) {
            this.abrirPuerta();
        } else {
            this.cerrarPuerta();
        }
    }

    abrirPuerta()
    {
        this.disableBody(true, true);  
        console.log("MapDoor abierta y desactivada");
    }

    cerrarPuerta()
    {
        this.enableBody(false, this.x, this.y, true, true);
        console.log("MapDoor cerrada y reactivada");
    }
}
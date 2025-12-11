import Door from "./Doors.js";

export default class MapDoor extends Door
{
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);

        this.setVisible(true);
        this.setActive(true);
        this.abrir = true;
    }

    changeOpen()
    {
        this.abrir = !this.abrir;

        if (this.abrir) {
            this.abrirPuerta();
        } else {
            this.cerrarPuerta();
        }
    }

    openDoor()
    {
        this.disableBody(true, true);  
        this.setVisible(false);
        console.log("MapDoor abierta y desactivada");
    }

    closeDoor()
    {
        this.enableBody(false, this.x, this.y, true, true);
        this.setVisible(true);
        console.log("MapDoor cerrada y reactivada");
    }


}
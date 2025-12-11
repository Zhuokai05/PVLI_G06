import Door from "./Doors.js";

/**
 * clase mapdoor
 * puerta simple que se activa y desactiva fisicamente
 * utilizada para bloquear o desbloquear caminos en el mapa
 */
export default class MapDoor extends Door
{
    /**
     * constructor de la puerta del mapa
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} texture - clave de textura
     */
    constructor(scene, x, y, texture) 
    {
        super(scene, x, y, texture);

        this.setVisible(true);                  // visible por defecto
        this.setActive(true);                   // activa por defecto
        this.abrir = true;                      // estado inicial: abierta (desactivada)
    }

    /**
     * alterna el estado de apertura y llama a la funcion correspondiente
     */
    changeOpen()
    {
        this.abrir = !this.abrir;               // invertir estado

        if (this.abrir) {
            this.openDoor();                    // si debe abrirse, abrir
        } else {
            this.closeDoor();                   // si debe cerrarse, cerrar
        }
    }

    /**
     * abre la puerta
     * desactiva su cuerpo fisico y la oculta
     */
    openDoor()
    {
        this.disableBody(true, true);           // deshabilitar cuerpo fisico y ocultar
        this.setVisible(false);                 // asegurar que no es visible
        console.log("MapDoor abierta y desactivada");
    }

    /**
     * cierra la puerta
     * activa su cuerpo fisico y la muestra
     */
    closeDoor()
    {
        // habilitar cuerpo fisico en la posicion actual, hacerlo visible y activar
        this.enableBody(false, this.x, this.y, true, true);
        this.setVisible(true);                  // hacer visible
        console.log("MapDoor cerrada y reactivada");
    }
}
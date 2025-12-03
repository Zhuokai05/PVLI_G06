import Door from '../managers/Doors.js';

export default class DoorBoss extends Door
{
    constructor(scene, x, y, texture)
    {
        super(scene, x, y, texture);

        this.contrary = null; 
        
    }

    getPosition()
    {
        return { x: this.x, y: this.y };
    }

    setContrary(contraryDoor)
    {
        this.contrary = contraryDoor;
    }

    abrirPuerta()
    {
        if (!this.contrary)
        {
            console.warn("DoorBoss: no tiene puerta contraria asignada.");
            return;
        }

        const destino = this.contrary.getPosition();

        const player = this.scene.player;

        if (player)
        {
            player.setPosition(destino.x, destino.y);
        }
    }
}

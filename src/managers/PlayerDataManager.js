/**
 * clase playerdatamanager
 * gestiona el estado persistente del jugador entre escenas
 * almacena vida, orbes, puntos de respawn y progreso de jefes/puzles
 */
export default class PlayerDataManager {
    /**
     * datos estaticos del jugador
     */
    static data = {
        health: 5,
        maxHealth: 5,
        position: { x: 0, y: 0 },
        orbs: [],
        // nombres de orbes recogidos (strings)
        collectedOrbs: [],
        // nombres de orbes equipados en los slots (strings o null)
        equippedOrbs: [null, null],
        activeOrbIndex: 0,
        respawnPoint: { x: 0, y: 0 },
        bossStatus: {
            tutorial: false,
            sadness: false, // ejemplo: boss tristeza
            anger: false,   // ejemplo: boss ira
            fear: false     // ejemplo: boss miedo
        },
        buttonStatus: {
            red: false,
            blue: false,
            green: false
        }
    };

    /**
     * guarda datos del jugador en el manager
     * @param {object} player - referencia al objeto jugador (player)
     */
    static saveDataFromPlayer(player) {

        this.data.health = player.health;           // guardar vida actual
        this.data.maxHealth = player.maxHealth;     // guardar vida maxima
        this.data.orbs = player.orbs;               // guardar lista de orbes (referencia)

        // guardar la copia de orbes recogidos (copia superficial)
        this.data.collectedOrbs = [...player.orbs];

        // guardar la copia de orbes equipados (copia superficial)
        this.data.equippedOrbs = [...player.equippedOrbs];
        this.data.activeOrbIndex = player.activeOrbIndex; // guardar indice de orbe activo

        // registro en consola
        console.log("guardando datos del jugador en playerdatamanager:",
            this.data.health, this.data.maxHealth, this.data.collectedOrbs,
            this.data.equippedOrbs, this.data.activeOrbIndex, this.data.respawnPoint);
        console.log(player.respawnPoint);
    }

    /**
     * lee los datos guardados y los aplica a una nueva instancia de jugador
     * @param {object} player - nueva instancia del objeto jugador (player)
     */
    static applyDataToPlayer(player) {
        player.health = this.data.health;           // cargar vida actual
        player.maxHealth = this.data.maxHealth;     // cargar vida maxima

        // como al cambiar de escena se crea un nuevo player, hay que
        // reasignar la referencia del player en cada orbe
        for (let orb of this.data.collectedOrbs) {
            // el orbe mantiene su estado, pero su referencia al player debe ser la nueva instancia
            orb.setPlayer(player);
        }

        // cargar los orbes recogidos
        player.orbs = [...this.data.collectedOrbs];

        // cargar los orbes equipados
        player.equippedOrbs = [...this.data.equippedOrbs];

        player.activeOrbIndex = this.data.activeOrbIndex;

        // aplicar efecto de orbe equipado
        if (player.equippedOrbs[player.activeOrbIndex]) {
            player.equippedOrbs[player.activeOrbIndex].onActivate(player);
        }
        
        // emitir eventos para actualizar la ui (hud)
        player.emit('updateHearts', this.data.health);
        player.emit('orbChanged');

        // registro en consola
        console.log("aplicando a jugador:",
            this.data.health, this.data.maxHealth, this.data.collectedOrbs,
            this.data.equippedOrbs, this.data.activeOrbIndex, this.data.respawnPoint);
        console.log(player.respawnPoint);
    }

    /**
     * marca un jefe como derrotado en el estado persistente
     * @param {string} bossName - nombre del jefe
     */
    static killBoss(bossName) {
        // comprobar si el jefe existe en la lista de estados
        if (this.data.bossStatus.hasOwnProperty(bossName)) {
            this.data.bossStatus[bossName] = true; // marcar como derrotado
            console.log(`boss ${bossName} derrotado. progreso guardado.`);
        }
    }

}
export default class PlayerDataManager {
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
    respawnPoint: { x: 0, y: 0 }
  };

  // guardar datos del jugador
  static saveDataFromPlayer(player) {

    this.data.health = player.health;
    this.data.maxHealth = player.maxHealth;    
    this.data.orbs = player.orbs;

    // guardar la copia de orbes recogidos 
    this.data.collectedOrbs =[...player.orbs];

    // guardar la copia de orbes equipados 
    this.data.equippedOrbs = [...player.equippedOrbs];
    this.data.activeOrbIndex = player.activeOrbIndex;

    
    console.log("Guardando datos del jugador en PlayerDataManager:",
      this.data.health, this.data.maxHealth, this.data.collectedOrbs,
      this.data.equippedOrbs, this.data.activeOrbIndex, this.data.respawnPoint);
    console.log(player.respawnPoint);
  }

  // lee los datos guardados y lo aplica al nuevo jugador
  static applyDataToPlayer(player) {
    console.log("hola");
    player.health = this.data.health;
    player.maxHealth = this.data.maxHealth;
    


    //como al cambiar de escena se crea un nuevo player, hay que poner el player del orbe como el nuevo player
    for (let orb of this.data.collectedOrbs){
      orb.setPlayer(player);
    }

    // carga los orbes recogidos de player
    player.orbs = [...this.data.collectedOrbs];


    // carga los orbes quipados de player
    player.equippedOrbs = [...this.data.equippedOrbs];

    player.activeOrbIndex = this.data.activeOrbIndex;

    // Aplicar efecto de orbe equipado
    player.ActivateOrb(player.activeOrbIndex);

    player.emit('updateHearts', this.data.health);
    player.emit('orbChanged');
    console.log("Aplicando a Jugador:",
      this.data.health, this.data.maxHealth, this.data.collectedOrbs,
      this.data.equippedOrbs, this.data.activeOrbIndex, this.data.respawnPoint);
    console.log(player.respawnPoint);
  }

}

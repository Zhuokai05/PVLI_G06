export default class PlayerDataManager {
  static data = {
    health: 5,
    maxHealth: 5,
    position: { x: 0, y: 0 },
    orbs: [],
    equippedOrbs: [null, null], // solo nombres o IDs simples
    activeOrbIndex: 0,
  };

  // guardar datos del jugador
  static saveFromPlayer(player) {
    this.data.health = player.health;
    this.data.maxHealth = player.maxHealth;
    this.data.position = { x: player.x, y: player.y };
    this.data.orbs = player.orbs;

    // guardar los orbes equipados
    this.data.equippedOrbs = player.equippedOrbs;
    this.data.activeOrbIndex = player.activeOrbIndex;
  }

  // lee los datos guardados y lo aplica al nuevo jugador
  static applyToPlayer(player) {
    player.health = this.data.health;
    player.maxHealth = this.data.maxHealth;

    player.orbs = this.data.orbs;
    player.equippedOrbs = this.data.equippedOrbs;
    player.activeOrbIndex = this.data.activeOrbIndex;
    player.ActivateOrb(player.activeOrbIndex);
    player.emit('updateHearts',this.data.health);
    player.emit('orbChanged');
  }
}

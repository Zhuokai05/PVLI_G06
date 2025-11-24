export default class PlayerDataManager {
  static data = {
    health: 5,
    maxHealth: 5,
    position: { x: 0, y: 0 },
    orbs: [],
    // nombres de orbes recogidos (strings)
    collectedOrbNames: [],
    // nombres de orbes equipados en los slots (strings o null)
    equippedOrbNames: [null, null],
    activeOrbIndex: 0,
    respawnPoint: null,
  };

  // guardar datos del jugador
  static saveFromPlayer(player) {
    this.data.health = player.health;
    this.data.maxHealth = player.maxHealth;
    this.data.position = { x: 100, y: 100 };
    this.data.orbs = player.orbs;
    this.data.respawnPoint = player.respawnPoint;
    console.log("Guardando datos del jugador en PlayerDataManager:",
      this.data.health, this.data.maxHealth, this.data.position, this.data.collectedOrbNames,
      this.data.equippedOrbNames, this.data.activeOrbIndex, this.data.respawnPoint);
    console.log(player.respawnPoint);

    // guardar lista de nombres de orbes recogidos si el player la tiene
    this.data.collectedOrbNames = player.collectedOrbNames || this.data.collectedOrbNames;

    // guardar nombres de orbes equipados (no objetos)
    this.data.equippedOrbNames = player.equippedOrbNames || this.data.equippedOrbNames;
    this.data.activeOrbIndex = player.activeOrbIndex;
  }

  // lee los datos guardados y lo aplica al nuevo jugador
  static applyToPlayer(player) {
    player.health = this.data.health;
    player.maxHealth = this.data.maxHealth;
    if (player.dead) {
      player.setX = this.data.respawnPoint.x;
      player.setY = this.data.respawnPoint.y;
    }

    // conservar lista de orbes como nombres recogidos
    player.collectedOrbNames = this.data.collectedOrbNames || [];

    // aplicar orbes equipados por nombre: guardamos array de names en player
    player.equippedOrbNames = this.data.equippedOrbNames || [null, null];
    player.activeOrbIndex = this.data.activeOrbIndex;

    // Aplicar efectos de orbes equipados (sin crear sprites)
    this._applyEquippedOrbEffects(player);

    player.emit('updateHearts', this.data.health);
    player.emit('orbChanged');
    console.log("Aplicando a Jugador:",
      this.data.health, this.data.maxHealth, this.data.position, this.data.collectedOrbNames,
      this.data.equippedOrbNames, this.data.activeOrbIndex, this.data.respawnPoint);
    console.log(player.respawnPoint);
  }

  static _applyEquippedOrbEffects(player) {
    // reset relevant flags
    player.canDash = false;
    player.canRangeAttack = false;
    player.orbTint = 0xffffff;

    const applyByName = (name) => {
      if (!name) return;
      switch (name) {
        case 'Orb Ira':
          player.canDash = true;
          player.orbTint = 0xff9900;
          break;
        case 'Orb Tristeza':
          player.canRangeAttack = true;
          player.orbTint = 0x9fc5e8;
          break;
        default:
          break;
      }
    };

    if (player.equippedOrbNames && player.equippedOrbNames.length) {
      player.equippedOrbNames.forEach(name => applyByName(name));
    }

    // apply tint if any
    player.setTint(player.orbTint);
  }

  static createPlayer(x, y) {
    this.player = new Player(this, 0, 0);
    this.applyToPlayer(this.player);
    if (!this.data.respawnPoint) {
      this.data.respawnPoint = { x: x, y: y };
    }else {
      x = this.data.respawnPoint.x;
      y = this.data.respawnPoint.y;
    }
    this.player.setX(x);
    this.player.setY(y);
  }

  // Resetea el estado guardado para un reintento (retry) desde Game Over.
  // Actualmente solo resetea la vida al máximo, pero se puede ampliar
  // para limpiar otros estados si fuera necesario.
  /*static resetForRetry() {
    player.health = this.data.maxHealth;
  }*/
}

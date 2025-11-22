import PlayerDataManager from '../managers/PlayerDataManager.js';

export default class BaseOrb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, name, description) {
    super(scene, x, y, texture);

    this.scene = scene;
    this.name = name;
    this.description = description;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    this.setScale(0.3);
    this.setInteractive();
    
  }

  //cuando el jugador recoge este orbe
  collect(player) {
    player.collectOrb(this);

    // registrar nombre en el PlayerDataManager para persistencia
    if (this.name) {
      const arr = PlayerDataManager.data.collectedOrbNames || [];
      if (!arr.includes(this.name)) {
        arr.push(this.name);
        PlayerDataManager.data.collectedOrbNames = arr;
      }
      // también mantener en player.collectedOrbNames
      player.collectedOrbNames = player.collectedOrbNames || [];
      if (!player.collectedOrbNames.includes(this.name)) player.collectedOrbNames.push(this.name);
    }

    this.destroy();
  }

  //funcion que se llama cuando el jugador equipa el orbe
  onEquip(player) {}
    //funcion que se llama cuando el jugador desequipa el orbe
  onUnequip(player) {}
    //funcion que se llama cuando el jugador activa el orbe
  onActivate(player) {}
    //funcion que se llama cuando el jugador desactiva el orbe
  onDeactivate(player) {}
}

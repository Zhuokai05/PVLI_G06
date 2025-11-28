import PlayerDataManager from '../managers/PlayerDataManager.js';

export default class BaseOrb extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, name, description) {
    super(scene, x, y, texture);

    this.scene = scene;
    this.name = name;
    this.description = description;
    this.equipped = false;

    this.player = this.scene.player;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    this.setScale(0.3);
    this.setInteractive();
  
    //se destruye de la escena si el jugador ya tiene ese orbe
    for (let i = 0; i < PlayerDataManager.data.collectedOrbs.length; i++) {
        if (PlayerDataManager.data.collectedOrbs[i].name === this.name) {
            this.destroy();
        }
    }
  }

  //como al cambiar de escena se crea un nuevo player, podemos el dueño del orbe a ese player
  setPlayer(player){
    this.player = player;
  }

  //cuando el jugador recoge este orbe
  collect(player) {

    player.collectOrb(this);
    this.destroy();
  }

  //funcion que se llama cuando el jugador equipa el orbe
  onEquip() {
    this.equipped = true;
  }
    //funcion que se llama cuando el jugador desequipa el orbe
  onDesequip() {
    this.equipped = false;
  }
    //funcion que se llama cuando el jugador activa el orbe
  onActivate() {}
    //funcion que se llama cuando el jugador desactiva el orbe
  onDesactivate() {}
}

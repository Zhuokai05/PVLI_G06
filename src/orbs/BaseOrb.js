import PlayerDataManager from '../managers/PlayerDataManager.js';

/**
 * clase base de todos los orbes
 * controla datos, recogida y eventos de equipar / activar
 */
export default class BaseOrb extends Phaser.Physics.Arcade.Sprite {

  constructor(scene, x, y, texture, name, description) {
    super(scene, x, y, texture);

    this.scene = scene;                     // escena
    this.name = name;                       // nombre del orbe
    this.description = description;         // descripcion del orbe
    this.equipped = false;                  // si esta equipado por el jugador

    this.player = this.scene.player;        // referencia al jugador actual

    scene.add.existing(this);               // agregar sprite
    scene.physics.add.existing(this);       // fisicas

    this.body.setAllowGravity(false);       // sin gravedad
    this.body.setImmovable(true);           // no se mueve
    this.body.moves = false;                // sin movimiento por fisica
    this.setScale(0.3);                     // tamano reducido
    this.setInteractive();                  // permite clicks si se usa

    // destruir si ya lo tiene
    for (let i = 0; i < PlayerDataManager.data.collectedOrbs.length; i++) {
        if (PlayerDataManager.data.collectedOrbs[i].name === this.name) {
            this.destroy();
        }
    }
  }

  /**
   * reasigna el jugador dueno del orbe (se usa al cambiar de escena)
   */
  setPlayer(player) {
    this.player = player;                   // nuevo jugador
  }

  /**
   * cuando el jugador recoge el orbe
   */
  collect(player) {
    player.collectOrb(this);                // notificar al jugador
    this.destroy();                         // eliminar sprite
  }

  /**
   * cuando se equipa el orbe
   */
  onEquip() {
    this.equipped = true;                   // marcado como equipado
  }

  /**
   * cuando se desequipa el orbe
   */
  onDesequip() {
    this.equipped = false;                  // no equipado
  }

  // cuando se activa el orbe
  onActivate() {}

  // cuando se desactiva el orbe
  onDesactivate() {}
}

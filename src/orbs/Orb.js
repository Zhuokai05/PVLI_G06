export default class Orb extends Phaser.Physics.Arcade.Sprite {
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

  collect(player) {
    player.collectOrb(this);
    this.destroy();
  }

  onEquip(player) {}
  onUnequip(player) {}
  onActivate(player) {}
  onDeactivate(player) {}
}

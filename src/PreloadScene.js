export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('background', './assets/logo.png.png');
    this.load.image('jugar', './assets/jugar.png');
    this.load.image('name', './assets/name.png');
  }

  create() 
  {
    this.scene.start('MainMenu');
    this.scene.stop();
  }
}
export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('player', './assets/Player/Angel.png');
    this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
    this.load.image('background', './assets/Menu/logo.png.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
  }

  create() 
  {
    this.scene.start('MainMenu');
    this.scene.stop();
  }
}
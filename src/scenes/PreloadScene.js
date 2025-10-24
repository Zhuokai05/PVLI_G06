export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('player', './assets/Player/Angel.png');
    this.load.image('ground', './assets/Escena/Plataforma ira.png');
    this.load.image('background', './assets/Menu/logo.png.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
    this.load.image('basicEnemyAngry', './assets/Enemigos basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/Enemigos basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/Enemigos basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/Enemigos basicos/Ghost.png');
      this.load.image('angelHealth', './assets/UI/Ghost.png');
  }

  create() 
  {
    this.scene.stop();
    this.scene.start('MainMenu');
    
  }
}
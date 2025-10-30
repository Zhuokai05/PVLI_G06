export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    
    //imagenes  y sprites
    this.load.image('ground', './assets/Escena/Plataforma ira.png');
    this.load.image('background', './assets/Menu/logo.png.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
    this.load.image('basicEnemyAngry', './assets/Enemigos basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/Enemigos basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/Enemigos basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/Enemigos basicos/Ghost.png');
    this.load.image('angelHealth', './assets/UI/AngelHeart.png');
    this.load.image('angelEmptyHealth', './assets/UI/AngelEmptyHeart_PlaceHolder.png');

    this.load.image('angel_sword_idle', 'assets/Player/Angel Espada normal 1.png');
    this.load.image('angel_sword_walk_1', 'assets/Player/Angel Espada normal 1.png');
    this.load.image('angel_sword_walk_2', 'assets/Player/Angel Espada normal 2.png');
    this.load.image('angel_sword_walk_3', 'assets/Player/Angel Espada normal 3.png');
    this.load.image('angel_sword_jump', 'assets/Player/Angel Espada normal Salto.png');

    this.load.image('angel_idle', 'assets/Player/Angel inicial 1.png');
    this.load.image('angel_walk_1', 'assets/Player/Angel inicial 1.png');
    this.load.image('angel_walk_2', 'assets/Player/Angel inicial 2.png');
    this.load.image('angel_walk_3', 'assets/Player/Angel inicial 3.png');
    this.load.image('angel_jump', 'assets/Player/Angel inicial Salto.png');
  }

  create() 
  {
    this.scene.stop();
    this.scene.start('MainMenu');
    
  }
}
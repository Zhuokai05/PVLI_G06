export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('ground', './assets/Escena/Plataforma_ira.png');
    this.load.image('background', './assets/Menu/logo.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
    this.load.image('basicEnemyAngry', './assets/Enemigos basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/Enemigos basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/Enemigos basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/Enemigos basicos/Ghost.png');
    this.load.image('angelHealth', './assets/UI/AngelHeart.png');
    this.load.image('orbIra', './assets/UI/OrbeFuego.png');
    this.load.image('orbTristeza', './assets/UI/OrbeHielo.png');
    this.load.image('angelEmptyHealth', './assets/UI/AngelEmptyHeart_PlaceHolder.png');

    // Angel espada normal
    this.load.image('angel_sword_idle', 'assets/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_1', 'assets/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_2', 'assets/Player/Angel_Espada_normal_2.png');
    this.load.image('angel_sword_walk_3', 'assets/Player/Angel_Espada_normal_3.png');
    this.load.image('angel_sword_jump', 'assets/Player/Angel_Espada_normal_Salto.png');

    // Angel inicial
    this.load.image('angel_idle', 'assets/Player/Angel_inicial_1.png');
    this.load.image('angel_walk_1', 'assets/Player/Angel_inicial_1.png');
    this.load.image('angel_walk_2', 'assets/Player/Angel_inicial_2.png');
    this.load.image('angel_walk_3', 'assets/Player/Angel_inicial_3.png');
    this.load.image('angel_jump', 'assets/Player/Angel_inicial_Salto.png');

    // UI
    //this.load.image('angelHealth', './assets/UI/Ghost.png');
    this.load.spritesheet('heartbreak', './assets/UI/heartbreak.png',
    {frameWidth: 25,frameHeight: 25});

    // Boss
    this.load.image('ira', './assets/Bosses/ira.png');
    this.load.image('fire_ball', 'assets/Bosses/Fire_ball.png');
    this.load.image('punch', 'assets/Bosses/Angry_punch.png');

    // Menus
    this.load.image('defeat_background', './assets/Menu/Fondo_derrota.png');
    this.load.image('defeat_player', './assets/Menu/Player_derrota.png');

    // Tiles
    this.load.spritesheet('tiles', './assets/Escena/tiles.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.text('map', './assets/map.txt');
    }

  create() 
  {
    this.scene.stop();
    this.scene.start('MainMenu');
    
  }
  

}
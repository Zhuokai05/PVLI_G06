export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('ground', './assets/Escena/Plataforma_Ira.png');
    this.load.image('background', './assets/Menu/logo.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
    this.load.image('basicEnemyAngry', './assets/Enemigos_basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/Enemigos_basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/Enemigos_basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/Enemigos_basicos/Ghost.png');
    this.load.image('angelHealth', './assets/UI/AngelHeart.png');
    this.load.image('orbIra', './assets/UI/OrbeFuego.png');
    this.load.image('orbTristeza', './assets/UI/OrbeHielo.png');

    // Angel espada normal
    this.load.image('angel_sword_idle', 'assets/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_1', 'assets/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_2', 'assets/Player/Angel_Espada_normal_2.png');
    this.load.image('angel_sword_walk_3', 'assets/Player/Angel_Espada_normal_3.png');
    this.load.image('angel_sword_jump', 'assets/Player/Angel_Espada_normal_Salto.png');

    // Angel inicial
    this.load.image('angel_idle', 'assets/Player/Angel_Inicial_1.png');
    this.load.image('angel_walk_1', 'assets/Player/Angel_Inicial_1.png');
    this.load.image('angel_walk_2', 'assets/Player/Angel_Inicial_2.png');
    this.load.image('angel_walk_3', 'assets/Player/Angel_Inicial_3.png');
    this.load.image('angel_jump', 'assets/Player/Angel_Inicial_Salto.png');

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
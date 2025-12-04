export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('ground', './assets/Escena/Plataforma_Ira.png');
    this.load.image('background', './assets/Menu/logo.png');
    this.load.image('win', './assets/Menu/win.png');
    this.load.image('victoria', './assets/Menu/victory.png');
    this.load.image('jugar', './assets/Menu/jugar.png');
    this.load.image('name', './assets/Menu/name.png');
    this.load.image('basicEnemyAngry', './assets/Enemigos_basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/Enemigos_basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/Enemigos_basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/Enemigos_basicos/Ghost.png');
    this.load.image('angelHealth', './assets/UI/AngelHeart.png');
    this.load.image('orbSlot', './assets/UI/OrbSlot.png');
    this.load.image('orbDamage', './assets/UI/OrbeFuego.png');
    this.load.image('orbMoveSpeed', './assets/UI/OrbeHielo.png');
    this.load.image('orbRanged', './assets/UI/orbWings.png');
    this.load.image('orbDash', './assets/UI/orbVoid.png');
    this.load.image('checkpoint', './assets/Escena/AltarCheckpoint.png');

    this.load.image('rangedEnemy', './assets/Enemigos_ranged/RangedEnemyPlaceHolder.png');
    
    this.load.spritesheet('Phoenix', './assets/Enemigos_ranged/Phoenix_Sheet.png',
    {frameWidth: 64,frameHeight: 64});
    
    this.load.spritesheet('Fire_Mine', './assets/Enemigos_mina/Fire_mina_sheet.png',
    {frameWidth: 32,frameHeight: 32});

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
    this.load.image('ira_flap_1', './assets/Bosses/ira1.png');
    this.load.image('ira_flap_2', './assets/Bosses/ira2.png');
    this.load.image('ira_flap_3', './assets/Bosses/ira3.png');
    this.load.image('ira_flap_4', './assets/Bosses/ira4.png');
    this.load.image('fire_ball', 'assets/Bosses/Fire_ball.png');
    this.load.image('punch', 'assets/Bosses/Angry_punch.png');

    this.load.image('tristeza', './assets/Bosses/tristeza.png');
    this.load.image('icicle', './assets/Bosses/Sad_ice.png');
    this.load.image('water_ball', './assets/Bosses/Water_ball.png');

    this.load.image('mascara', './assets/Bosses/Mascara.png');
    this.load.image('garra', './assets/Bosses/Garra.png');
    this.load.image('corazon', './assets/Bosses/Corazon.png');
    this.load.image('vaso', './assets/Bosses/Vaso.png');

    this.load.image('tutorial', './assets/Bosses/bossTutorial.png');

    // Menus
    this.load.image('defeat_background', './assets/Menu/Fondo_derrota.png');
    this.load.image('defeat_player', './assets/Menu/Player_derrota.png');

    // Tiles
    this.load.spritesheet('tiles', './assets/Escena/tiles.png', {
            frameWidth: 32,
            frameHeight: 32
        });

   this.load.tilemapTiledJSON("mappy","./assets/Maps/map.json");

    // Efecto de sonidos
    this.load.audio('jump_sound', './assets/Efecto_sonido/jump.mp3');
    this.load.audio('damage_sound', './assets/Efecto_sonido/take_damage.mp3');

  }

  create() 
  {
    this.scene.stop();
    this.scene.start('MainMenu');
    
  }
}
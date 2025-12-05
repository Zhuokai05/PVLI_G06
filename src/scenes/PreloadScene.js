export class PreloadScene extends Phaser.Scene 
{
  preload() 
  {
    //imagenes  y sprites
    this.load.image('ground', './assets/sprites/Escena/Plataforma_Ira.png');
    this.load.image('background', './assets/sprites/Menu/logo.png');
    this.load.image('win', './assets/sprites/Menu/win.png');
    this.load.image('victoria', './assets/sprites/Menu/victory.png');
    this.load.image('jugar', './assets/sprites/Menu/jugar.png');
    this.load.image('name', './assets/sprites/Menu/name.png');

    //enemgigos melee
    this.load.image('basicEnemyAngry', './assets/sprites/Enemigos/Enemigos_basicos/Fire.png');
    this.load.image('basicEnemySad', './assets/sprites/Enemigos/Enemigos_basicos/Water.png');
    this.load.image('basicEnemyHappy', './assets/sprites/Enemigos/Enemigos_basicos/Sun.png');
    this.load.image('basicEnemyFear', './assets/sprites/Enemigos/Enemigos_basicos/Ghost.png');

    //enemigos rango
    // this.load.image('rangedEnemy', './assets/sprites/Enemigos/Enemigos_rango/RangedEnemyPlaceHolder.png');

    this.load.spritesheet('Ira_RangedEnemy', './assets/sprites/Enemigos/Enemigos_rango/Ira_RangedEnemy.png',
    {frameWidth: 160,frameHeight: 128});
    this.load.spritesheet('Tristeza_RangedEnemy', './assets/sprites/Enemigos/Enemigos_rango/Tristeza_RangedEnemy.png',
    {frameWidth: 160,frameHeight: 128});


    
    //enemigos voladores
    this.load.spritesheet('Ira_FlyingEnemy', './assets/sprites/Enemigos/Enemigos_voladores/Ira_FlyingEnemy.png',
    {frameWidth: 64,frameHeight: 64});
    this.load.spritesheet('Tristeza_FlyingEnemy', './assets/sprites/Enemigos/Enemigos_voladores/Tristeza_FlyingEnemy.png',
    {frameWidth: 64,frameHeight: 64});
    
    //enemigos mina
    this.load.spritesheet('Ira_MineEnemy', './assets/sprites/Enemigos/Enemigos_mina/Ira_MineEnemy.png',
    {frameWidth: 32,frameHeight: 32});
    this.load.spritesheet('Tristeza_MineEnemy', './assets/sprites/Enemigos/Enemigos_mina/Tristeza_MineEnemy.png',
    {frameWidth: 32,frameHeight: 32});

    //Ui
    this.load.image('orbSlot', './assets/sprites/UI/Orbes/OrbSlot.png');
    this.load.image('orbDamage', './assets/sprites/UI/Orbes/OrbeFuego.png');
    this.load.image('orbMoveSpeed', './assets/sprites/UI/Orbes/OrbeHielo.png');
    this.load.image('orbRanged', './assets/sprites/UI/Orbes/orbWings.png');
    this.load.image('orbDash', './assets/sprites/UI/Orbes/orbVoid.png');
    this.load.image('orbShield', './assets/sprites/UI/Orbes/orbShield.png');
    this.load.image('orbAttackRange', './assets/sprites/UI/Orbes/orbAttackRange.png');
    this.load.spritesheet('checkpoint', './assets/Escena/checkpointSheet.png', {
            frameWidth: 32,
            frameHeight: 40
        });


    


    // Angel espada normal
    this.load.image('angel_sword_idle', 'assets/sprites/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_1', 'assets/sprites/Player/Angel_Espada_normal_1.png');
    this.load.image('angel_sword_walk_2', 'assets/sprites/Player/Angel_Espada_normal_2.png');
    this.load.image('angel_sword_walk_3', 'assets/sprites/Player/Angel_Espada_normal_3.png');
    this.load.image('angel_sword_jump', 'assets/sprites/Player/Angel_Espada_normal_Salto.png');
    this.load.image('angelHealth', './assets/sprites/UI/AngelHeart.png');

    // Angel inicial
    this.load.image('angel_idle', 'assets/sprites/Player/Angel_Inicial_1.png');
    this.load.image('angel_walk_1', 'assets/sprites/Player/Angel_Inicial_1.png');
    this.load.image('angel_walk_2', 'assets/sprites/Player/Angel_Inicial_2.png');
    this.load.image('angel_walk_3', 'assets/sprites/Player/Angel_Inicial_3.png');
    this.load.image('angel_jump', 'assets/sprites/Player/Angel_Inicial_Salto.png');
    
    // Objetos angel
    this.load.image('plume', 'assets/sprites/Player/Pluma.png');
    this.load.spritesheet('melee', 'assets/sprites/Player/Melee.png',
    {frameWidth: 64,frameHeight: 64});
    this.load.image('playerShieldAura', 'assets/sprites/Player/PlayerShieldAura.png');

    // UI
    //this.load.image('angelHealth', './assets/UI/Ghost.png');
    this.load.spritesheet('heartbreak', './assets/sprites/UI/heartbreak.png',
    {frameWidth: 25,frameHeight: 25});

    // Boss
    this.load.image('ira_flap_1', './assets/sprites/Bosses/ira1.png');
    this.load.image('ira_flap_2', './assets/sprites/Bosses/ira2.png');
    this.load.image('ira_flap_3', './assets/sprites/Bosses/ira3.png');
    this.load.image('ira_flap_4', './assets/sprites/Bosses/ira4.png');
    this.load.image('fire_ball', 'assets/sprites/Bosses/Fire_ball.png');
    this.load.image('punch', 'assets/sprites/Bosses/Angry_punch.png');

    this.load.image('tristeza', './assets/sprites/Bosses/tristeza.png');
    this.load.image('icicle', './assets/sprites/Bosses/Sad_ice.png');
    this.load.image('water_ball', './assets/sprites/Bosses/Water_ball.png');

    this.load.image('mascara', './assets/sprites/Bosses/Mascara.png');
    this.load.image('garra', './assets/sprites/Bosses/Garra.png');
    this.load.image('corazon', './assets/sprites/Bosses/Corazon.png');
    this.load.image('vaso', './assets/sprites/Bosses/Vaso.png');

    this.load.image('tutorial', './assets/sprites/Bosses/bossTutorial.png');

    // Menus
    this.load.image('defeat_background', './assets/sprites/Menu/Fondo_derrota.png');
    this.load.image('defeat_player', './assets/sprites/Menu/Player_derrota.png');
    this.load.image('loading', './assets/sprites/Menu/carga.png');

    // Tiles
    this.load.spritesheet('tiles', './assets/sprites/Escena/tiles.png', {
            frameWidth: 32,
            frameHeight: 32
        });
   this.load.image('iceplatform', './assets/sprites/Escena/iceplatform.png');
   this.load.image('platform', './assets/sprites/Escena/platform.png');
   this.load.tilemapTiledJSON("mappy","./assets/Maps/map.json");

    // Efecto de sonidos
    this.load.audio('jump_sound', './assets/Sounds/Player/jump.mp3');
    this.load.audio('damage_sound', './assets/Sounds/Player/take_damage.mp3');

  }

  create() 
  {
    this.scene.stop();
    this.scene.start('MainMenu');
    
  }
}
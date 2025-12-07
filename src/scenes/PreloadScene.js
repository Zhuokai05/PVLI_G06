export class PreloadScene extends Phaser.Scene {
  preload() {
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
      { frameWidth: 160, frameHeight: 128 });
    this.load.spritesheet('Tristeza_RangedEnemy', './assets/sprites/Enemigos/Enemigos_rango/Tristeza_RangedEnemy.png',
      { frameWidth: 160, frameHeight: 128 });



    //enemigos voladores
    this.load.spritesheet('Ira_FlyingEnemy', './assets/sprites/Enemigos/Enemigos_voladores/Ira_FlyingEnemy.png',
      { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Tristeza_FlyingEnemy', './assets/sprites/Enemigos/Enemigos_voladores/Tristeza_FlyingEnemy.png',
      { frameWidth: 64, frameHeight: 64 });

    //enemigos mina
    this.load.spritesheet('Ira_MineEnemy', './assets/sprites/Enemigos/Enemigos_mina/Ira_MineEnemy.png',
      { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('Tristeza_MineEnemy', './assets/sprites/Enemigos/Enemigos_mina/Tristeza_MineEnemy.png',
      { frameWidth: 32, frameHeight: 32 });

    //Ui
    this.load.image('orbSlot', './assets/sprites/UI/Orbes/OrbSlot.png');
    this.load.image('orbDamage', './assets/sprites/UI/Orbes/OrbeFuego.png');
    this.load.image('orbMoveSpeed', './assets/sprites/UI/Orbes/OrbeHielo.png');
    this.load.image('orbRanged', './assets/sprites/UI/Orbes/orbWings.png');
    this.load.image('orbDash', './assets/sprites/UI/Orbes/orbVoid.png');
    this.load.image('orbBloodSteal', './assets/sprites/UI/Orbes/orbBloodSteal.png');
    this.load.image('orbShield', './assets/sprites/UI/Orbes/orbShield.png');
    this.load.image('orbJump', './assets/sprites/UI/Orbes/orbJump.png');
    this.load.image('orbAttackRange', './assets/sprites/UI/Orbes/orbAttackRange.png');

    //Objetos de la escena
    this.load.image('lava_tex', './assets/sprites/Escena/Plataforma_Ira.png');
    this.load.spritesheet('checkpoint', './assets/sprites/Escena/checkpointSheet.png', {
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
      { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('melee_Ampliado', 'assets/sprites/Player/Melee_Ancho.png',
      { frameWidth: 128, frameHeight: 64 });
    this.load.image('playerShieldAura', 'assets/sprites/Player/PlayerShieldAura.png');

    // UI
    //this.load.image('angelHealth', './assets/UI/Ghost.png');
    this.load.spritesheet('heartbreak', './assets/sprites/UI/heartbreak.png',
      { frameWidth: 25, frameHeight: 25 });
    this.load.image('boss_tracker_base', './assets/sprites/UI/BossTracker/BossesSlots.png');
    this.load.image('piece_anger', './assets/sprites/UI/BossTracker/AngerPiece.png');
    this.load.image('piece_sadness', './assets/sprites/UI/BossTracker/SadnessPiece.png');
    this.load.image('piece_fear', './assets/sprites/UI/BossTracker/FearPiece.png');

    // Boss
    this.load.spritesheet('IraSheet', 'assets/sprites/Bosses/IraSheet.png', {
      frameWidth: 256,
      frameHeight: 256
    });
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
    this.load.image('puertaira', './assets/sprites/Escena/PuertaIra.png');
    this.load.image('puertatriste', './assets/sprites/Escena/Puertatristeza.png');
    this.load.image('puertamiedo', './assets/sprites/Escena/Puertamiedo.png');
    this.load.image('platform', './assets/sprites/Escena/platform.png');

    //buttons
    this.load.image('rbutton', './assets/sprites/Escena/rbutton1.png');
    this.load.image('bbutton', './assets/sprites/Escena/bbutton1.png');
    this.load.image('gbutton', './assets/sprites/Escena/ybutton1.png');
    this.load.image('closedbutton', './assets/sprites/Escena/Closedbutton1.png');
    //shows   
    this.load.image('bshowA', './assets/sprites/Escena/Boton_Apagado_1.png');
    this.load.image('rshowA', './assets/sprites/Escena/Boton_Apagado_2.png');
    this.load.image('gshowA', './assets/sprites/Escena/Boton_Apagado_3.png');
    this.load.image('bshowE', './assets/sprites/Escena/Boton_Encendido_1.png');
    this.load.image('rshowE', './assets/sprites/Escena/Boton_Encendido_2.png');
    this.load.image('gshowE', './assets/sprites/Escena/Boton_Encendido_3.png');



    this.load.tilemapTiledJSON("mappy", "./assets/Maps/map.json");

    // Efecto de sonidos

    //player
    this.load.audio('PlayerJump_sound', './assets/Sounds/Player/PlayerJump.wav');
    this.load.audio('PlayerJumpEnd_sound', './assets/Sounds/Player/PlayerJumpEnd.wav');
    this.load.audio('PlayerAttack_sound', './assets/Sounds/Player/PlayerAttack.wav');
    this.load.audio('PlayerDamaged_sound', './assets/Sounds/Player/PlayerDamaged.wav');
    this.load.audio('PlayerTakeOrb_sound', './assets/Sounds/Player/PlayerTakeOrb.mp3');
    this.load.audio('PlayerChangeOrb_sound', './assets/Sounds/Player/PlayerChangeOrb.wav');
    this.load.audio('PlayerRangeAttack_sound', './assets/Sounds/Player/PlayerRangeAttack.wav');
    this.load.audio('PlayerDash_sound', './assets/Sounds/Player/PlayerDash.wav');
    this.load.audio('PlayerShield_sound', './assets/Sounds/Player/PlayerShield.wav');
    this.load.audio('PlayerShieldBlock_sound', './assets/Sounds/Player/PlayerShieldBlock.wav');

    //objetos
    this.load.audio('ActivateCheckpoint_sound', './assets/Sounds/Object/Checkpoint.wav');
    this.load.audio('Teleport_sound', './assets/Sounds/Object/OpenDoor.wav');

    //musica    
    this.load.audio('bg_Music', 'assets/Sounds/Music/MainMusic.wav');


  }

  create() {
    this.scene.stop();
    this.scene.start('MainMenu');

  }
}
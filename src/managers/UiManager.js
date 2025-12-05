import PlayerDataManager from "./PlayerDataManager.js";

export default class UIManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.hearts = [];
    this.heartSpacing = 60;  //espacio entre corazones
    this.heartX = 40;
    this.heartY = 40;
    this.maxHearts = player.maxHealth;

    this.orbs = [];
    this.orbSpacing = 60;  //espacio entre orbes 
    this.orbX = 45;
    this.orbY = 110;
    this.maxOrbs = player.equippedOrbs.length;

    this.bossTrackerX = 950; 
    this.bossTrackerY = 60;   
    this.bossPieces = {};     

    this.createHearts();
    this.createOrbSlots();
    this.createOrbs();
    this.createBossTracker();


    player.on('updateHearts', this.updateHearts, this);

    player.on('orbChanged', this.updateOrbs, this);

    this.scene.events.on('bossDefeated', this.updateBossTracker, this);
  }



  //crea la lista de corazones
  createHearts() {

    for (let i = 0; i < this.maxHearts; i++) {
      let x = this.heartX + i * this.heartSpacing;

      let heart = this.scene.add.sprite(x, this.heartY, 'heartbreak', 0)
        .setScrollFactor(0)
        .setScale(3);

      this.hearts.push(heart);
    }
  }

  //actualiza la lista de corazones 
  /**
   * 
   * @param {int} currentHealth corazones que pinta en la pantalla
   * @param {bool} removeHealthAnimation si reproduce la animacion de quitar corazon 
   */

  updateHearts(currentHealth, removeHealthAnimation = false) {

    for (let i = 0; i < this.hearts.length; i++) {
      let heart = this.hearts[i];

      if (i < currentHealth) {
        heart.setTexture('heartbreak', 0);
      }
      else if (i === currentHealth && removeHealthAnimation) {
        heart.setFrame(0);
        heart.play('UI_heartbreakAnimation', true);
        heart.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          heart.setTexture('heartbreak', 10);
        });
      }

      else {
        heart.setTexture('heartbreak', 10);
      }
    }
  }

  //crea la lista de orbes
  createOrbs() {
    this.orbs = [];

    for (let i = 0; i < this.maxOrbs; i++) {
      const x = this.orbX + i * this.orbSpacing;
      const orb = this.scene.add.image(x, this.orbY, '')
        .setScrollFactor(0)
        .setScale(0.25)
        .setAlpha(1);

      this.orbs.push(orb);
    }

    this.updateOrbs();
  }
  createOrbSlots() {
    for (let i = 0; i < this.maxOrbs; i++) {
      const x = this.orbX + i * this.orbSpacing;
      this.scene.add.image(x, this.orbY, 'orbSlot')
        .setScrollFactor(0)
        .setScale(0.25);
    }
  }

  //actualiza la lista de orbes
  updateOrbs() {
    for (let i = 0; i < this.orbs.length; i++) {
      let orb = this.orbs[i];

      if (this.player.equippedOrbs[i]) {
        orb.setTexture(this.player.equippedOrbs[i].texture.key);

        // oscurecer el orbe no activo
        if (i === this.player.activeOrbIndex) {
          orb.setAlpha(1);
        } else {
          orb.setAlpha(0.5);
        }
      } else {
        orb.setTexture('');
        orb.setAlpha(0.5);
      }
    }
  }
// Crea el rastreador de jefes en la UI
  createBossTracker() {
      this.trackerBase = this.scene.add.image(this.bossTrackerX, this.bossTrackerY, 'boss_tracker_base')
          .setScrollFactor(0) 
          .setDepth(10); 
          this.trackerBase.setScale(3);    

      this.bossPieces['anger'] = this.scene.add.image(this.bossTrackerX, this.bossTrackerY, 'piece_anger')
          .setScrollFactor(0)
          .setDepth(11) 
          .setVisible(false); 
          this.bossPieces['anger'].setScale(3);


      this.bossPieces['sadness'] = this.scene.add.image(this.bossTrackerX, this.bossTrackerY, 'piece_sadness')
          .setScrollFactor(0)
          .setDepth(11)
          .setVisible(false);
          this.bossPieces['sadness'].setScale(3);


      this.bossPieces['fear'] = this.scene.add.image(this.bossTrackerX, this.bossTrackerY, 'piece_fear')
          .setScrollFactor(0)
          .setDepth(11)
          .setVisible(false);
          this.bossPieces['fear'].setScale(3);

      this.updateBossTracker();
  }

  updateBossTracker() {
      const status = PlayerDataManager.data.bossStatus;

      if (this.bossPieces['anger'])   this.bossPieces['anger'].setVisible(status.anger);
      if (this.bossPieces['sadness']) this.bossPieces['sadness'].setVisible(status.sadness);
      if (this.bossPieces['fear'])    this.bossPieces['fear'].setVisible(status.fear);
  }

}

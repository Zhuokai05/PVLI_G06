export default class UIManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.hearts = [];
    this.heartSpacing = 60;  
    this.heartX = 40;
    this.heartY = 40;       
    this.maxHearts = player.maxHealth;

    this.orbs = [];
    this.orbSpacing = 60;  
    this.orbX = 40;
    this.orbY = 100;       
    this.maxOrbs = player.equippedOrbs.length;

    this.createHearts();
    this.createOrbs();

    player.on('healthChanged', this.updateHearts, this);

    player.on('orbChanged', this.updateOrbs, this);
  }

  

  createHearts() {

    for (let i = 0; i < this.maxHearts; i++) {
      let x = this.heartX + i * this.heartSpacing;

      let heart = this.scene.add.sprite(x, this.heartY, 'heartbreak', 0)
        .setScrollFactor(0)
        .setScale(3);

      this.hearts.push(heart);
    }
  }

  updateHearts(currentHealth) {

    for (let i = 0; i < this.hearts.length; i++) {
      let heart = this.hearts[i];

      if (i < currentHealth) {
        heart.setTexture('heartbreak', 0);
      } 

      else {
        if (i === currentHealth) {
          heart.setFrame(0);
          heart.play('heartbreakAnimation', true);
          heart.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            heart.setTexture('heartbreak', 10);
          });
        } 
        else {
          heart.setTexture('heartbreak', 10);
        }
    }
  }
}

  createOrbs() {
    this.orbs = [];

    for (let i = 0; i < this.maxOrbs; i++) {
      const x = this.orbX + i * this.orbSpacing;
      const orb = this.scene.add.image(x, this.orbY, '') 
        .setScrollFactor(0)
        .setScale(0.3)
        .setAlpha(1);

      this.orbs.push(orb);
    }

    this.updateOrbs();
  }

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

}

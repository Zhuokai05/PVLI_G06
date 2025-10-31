export default class UIManager {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.hearts = [];
    this.heartSpacing = 60;  
    this.heartY = 40;       
    this.maxHearts = player.maxHealth;

    this.createHearts();

    player.on('healthChanged', this.updateHearts, this);
  }

  

  createHearts() {

    for (let i = 0; i < this.maxHearts; i++) {
      let x = 40 + i * this.heartSpacing;

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
        heart.setFrame(0);
        heart.play('heartbreakAnimation',true);
        heart.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        heart.setTexture('angelEmptyHealth');
        heart.destroy();
        this.hearts.splice(i,1);
      });
    }
  }
}

  

}

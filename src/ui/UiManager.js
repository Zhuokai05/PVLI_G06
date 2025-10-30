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

      let heart = this.scene.add.image(x, this.heartY, 'angelHealth')
        .setScrollFactor(0)
        .setScale(0.5);

      this.hearts.push(heart);
    }
  }

  updateHearts(currentHealth) {
    
    for (let i = 0; i < this.hearts.length; i++) {

      if (i < currentHealth) {
        this.hearts[i].setTexture('angelHealth');
      } 
      else 
      {
        this.hearts[i].setTexture('angelEmptyHealth');
      }

    }
  }

}

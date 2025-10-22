class MainMenuScene extends Phaser.Scene 
{
    constructor() 
    {
        super('MainMenu'); 
        
    }

    create() 
    {
       this.background = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'background');
       this.background.setScale(1, 0.75);
       this.name = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 4,'name');
       this.name.setScale(0.5, 0.45);
       var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 1.25,'jugar');
       play.setScale(0.3);
       play.setInteractive();

        play.on('pointerdown', () => {
  
            this.scene.start('TestScene');
            this.scene.stop();
        });

    }

    update(time, delta) 
    {
        
    }
}
export {MainMenuScene}
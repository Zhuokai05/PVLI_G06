class PauseScene extends Phaser.Scene 
{
    constructor() 
    {
        super('Pause'); 
        
    }

    create() 
    {
        this.add.rectangle(
            this.cameras.main.width /2, this.cameras.main.height / 2,         // posición
            this.cameras.main.width, this.cameras.main.height,         // tamaño
            0x000000, 0.5     // color + opacidad
        );

        var play = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'jugar');
        play.setScale(0.3);
        play.setInteractive();

        play.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('TestScene')
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
            this.scene.resume('TestScene')    
        });
    }

    update(time, delta) 
    {
        
    }
}
export {PauseScene}
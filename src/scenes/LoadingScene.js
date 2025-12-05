
class LoadingScene extends Phaser.Scene 
{
    constructor() 
    {
        super('Loading'); 
        
    }

    create() 
    {
      

       this.background = this.add.image(this.cameras.main.width /2 ,this.cameras.main.height / 2,'loading');
       



             this.time.delayedCall(0, () => {

            const sceneKey = "TestPlayerScene";

            if (!this.scene.get(sceneKey)) {
                console.warn(`⚠️ ${sceneKey} no existe, creando...`);
                this.scene.launch(sceneKey);
            } else {
                console.log(`▶️ ${sceneKey} existe, iniciando...`);
                this.scene.start(sceneKey);
            }

            this.scene.stop('Loading');
        });

    }



    update(time, delta) 
    {


    }


    
}
export {LoadingScene}
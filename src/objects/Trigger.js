import MapDoor from '../objects/MapDoor.js';
export default class InvisibleTrigger extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, null); 

        this.scene = scene;
        this.doors = [];
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setVisible(true);
        this.body.setSize(256, 256);
        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.primer = true;
    }

    getBoss(boss) {

            this.boss = boss;
       
    }

    
    getDoors(doorsArray) {

            this.doors = doorsArray;
       
    }
    llamar() {

        if (this.primer) 
            {
                if (this.boss) 
                    {
                          this.boss.setLife();
                    }
                
       this.doors.getChildren().forEach(door => {          
    door.cambiarAbrir();         
});
            }
       this.primer = false;
    }
}

export default class RangedEnemyProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, enemy,sprite,frame,target) {
        super(scene, x, y, sprite,frame);

        this.enemy = enemy;
        this.scene = scene;
        this.target = target; // coge el objetivo
        this.speed = 250;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false; //ignora gravedad

        /* reducimos el collider a la mitad, ya que hay un proble con el spritesheet donde las celdas son de 64 
        pero el sprite solo esta en el medio, con un gran margen vacio */
        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setOffset(this.width / 4, this.height / 4);


        // daño al jugador
        enemy.scene.physics.add.overlap(
            this,
            enemy.player,
            () => {
                let knockbackDirection =  this.target.x < enemy.x ? -1 : 1;
                enemy.player.takeDamage(enemy.damage,knockbackDirection);
                this.destroy();
            }
        );

        // coge la direccion al jugador
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;

  
        //calcula la longitud del vector
        let len = Math.sqrt(dx * dx + dy * dy);

        //lo convertimos en vertor unitario
        dx /= len;
        dy /= len;


        this.setVelocity(dx * this.speed, dy * this.speed);

        
        //lo rotamos segun la direccion que va
        this.rotation = Math.atan2(dy, dx) + Math.PI / 2;
        console.log("proyectile created")
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.target || !this.target.active) { // si no encuentra el jugador no hace nada 
            this.destroy();
        }

        // se destruye si sale fuera de la camara
        let cam = this.scene.cameras.main;
        if (this.x < cam.worldView.x - 100 ||
            this.x > cam.worldView.x + cam.worldView.width + 100 ||
            this.y < cam.worldView.y - 100 ||
            this.y > cam.worldView.y + cam.worldView.height + 100) {
            this.destroy();
        }
    }
}

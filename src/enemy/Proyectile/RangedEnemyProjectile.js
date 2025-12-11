export default class RangedEnemyProjectile extends Phaser.Physics.Arcade.Sprite {

    /**
     * proyectil disparado por un enemigo a distancia
     */
    constructor(scene, x, y, enemy, sprite, frame, target) {
        super(scene, x, y, sprite, frame);

        this.enemy = enemy;                       // enemigo que dispara
        this.scene = scene;                       // escena
        this.target = target;                     // objetivo (jugador)
        this.speed = 250;                         // velocidad proyectil

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.allowGravity = false;           // ignorar gravedad

        // collider reducido por sprite con margen vacio
        this.body.setSize(this.width / 2, this.height / 2);
        this.body.setOffset(this.width / 4, this.height / 4);

        // colision con jugador
        enemy.scene.physics.add.overlap(
            this,
            enemy.player,
            () => {
                let knockDir = this.target.x < enemy.x ? -1 : 1;
                enemy.player.takeDamage(enemy.damage, knockDir);
                this.destroy();
            }
        );

        enemy?.scene?.time.delayedCall(5000,()=>{
            this.destroy();
        })
        // vector hacia jugador
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let len = Math.sqrt(dx * dx + dy * dy);

        dx /= len;                                 // normalizar
        dy /= len;

        // aplicar velocidad
        this.setVelocity(dx * this.speed, dy * this.speed);

        // rotacion segun movimiento
        this.rotation = Math.atan2(dy, dx) + Math.PI / 2;

        console.log("proyectile created");
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.target || !this.target.active) {
            this.destroy();
        }

        // destruir si sale de la camara
        let cam = this.scene.cameras.main;

        if (this.x < cam.worldView.x - 100 ||
            this.x > cam.worldView.x + cam.worldView.width + 100 ||
            this.y < cam.worldView.y - 100 ||
            this.y > cam.worldView.y + cam.worldView.height + 100) 
        {
            this.destroy();
        }
    }
}

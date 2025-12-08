/**
 * pool de proyectiles reutilizables del jugador
 * evita crear y destruir proyectiles constantemente
 */
export default class PlayerProjectilePool {

    /**
     * constructor del pool
     * @param {Phaser.Scene} scene escena donde existe el pool
     * @param {string} textureKey textura usada para los proyectiles
     */
    constructor(scene, textureKey = "plume") {
        this.scene = scene;
        this.textureKey = textureKey;                    // clave de textura del proyectil

        // pool fisico de proyectiles
        this.pool = scene.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,      // tipo de objeto
            maxSize: 10,                                 // maximo de proyectiles simultaneos
            runChildUpdate: false                        // desactivar update de hijos
        });
    }

    /**
     * dispara un proyectil desde el pool
     * @param {number} x posicion x
     * @param {number} y posicion y
     * @param {number} direction 1 derecha, -1 izquierda
     * @param {number} duration ms antes de desaparecer
     * @param {number} speed velocidad del proyectil
     * @param {function} damageCallback funcion opcional al golpear enemigo
     */
    fire(x, y, direction, duration, speed, damageCallback = null) {

        let projectile = this.pool.get(x, y, this.textureKey);   // obtener del pool

        if (!projectile) return;                                 // pool lleno, no dispara

        projectile.setActive(true);                              // activar
        projectile.setVisible(true);                             // visible
        projectile.body.enable = true;                           // activar colisiones

        projectile.setDepth(4);                                  // profundidad
        projectile.setScale(1);                                  // escala
        projectile.body.allowGravity = false;                    // sin gravedad
        projectile.setFlipX(direction === -1);                   // flip segun direccion

        projectile.setVelocityX(speed * direction);              // aplicar velocidad

        // liberar despues de un tiempo
        this.scene.time.delayedCall(duration, () => {
            this.release(projectile);
        });

        // daño a enemigos
        this.scene.physics.add.overlap(
            projectile,
            this.scene.enemies,
            (proj, enemy) => {
                if (damageCallback) damageCallback(enemy);       // ejecutar callback de daño
                this.release(proj);                              // liberar proyectil
            }
        );

        return projectile;                                       // devolver proyectil activo
    }

    /**
     * devuelve un proyectil al pool
     * @param {Phaser.GameObjects.Image} projectile proyectil a reciclar
     */
    release(projectile) {
        if (!projectile.active) return;                          // no hacer nada si ya esta inactivo

        projectile.setActive(false);                             // desactivar
        projectile.setVisible(false);                            // ocultar
        projectile.body.enable = false;                          // quitar colisiones
        projectile.setVelocity(0, 0);                            // parar movimiento
    }
}

import BaseEnemyAttackState from './BaseEnemyAttackState.js';

/**
 * Estado de ataque cuerpo a cuerpo con animación
 * @class MeleeEnemyAttackState
 * @extends BaseEnemyAttackState
 */
export default class MeleeEnemyAttackState extends BaseEnemyAttackState {
    
    /**
     * Entra al estado de ataque cuerpo a cuerpo
     * @param {Object} enemy - Enemigo que ejecuta el ataque
     */
    enter(enemy) {
        super.enter(enemy);
        this.hasAttacked = false;               // evita doble ataque
        this.meleeSprite = null;                // referencia al sprite de ataque
        this.attackTween = null;
        let direction = enemy.player.x > enemy.x ? 1 : -1;

        if (!this.hasAttacked) {

            this.attackTween = this.enemy.scene.tweens.add({
                // tween animacion ataque
                targets: this.enemy,
                scaleX: 1.3,         
                scaleY: 0.7,         
                duration: enemy.attackDuration * 0.8,       
                yoyo: true,          // Vuelve a su forma original al terminar
                
                onYoyo: () => { 
                    // momento para soltar el golpe
                    if (this.enemy.active) {
                        this.meleeAttack(direction);
                        this.hasAttacked = true;
                    }
                },
                onComplete: () => {
                    // Limpiamos el tinte por seguridad al terminar todo
                    this.enemy.clearTint();
                }
            });
        }
    }

    /**
     * Ejecuta la lógica del estado de ataque
     * @param {Object} enemy - Enemigo que ejecuta el ataque
     * @param {number} time - Tiempo actual
     * @param {number} delta - Delta time
     */
    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);       // termina ataque si ya acabo
    }

    /**
     * Realiza ataque cuerpo a cuerpo con hitbox y animación
     * @param {number} direction - Dirección del ataque (1: derecha, -1: izquierda)
     */
    meleeAttack(direction) {
        let w = this.enemy.meleeAttackWidge;     // ancho hitbox
        let h = this.enemy.meleeAttackHeight;    // alto hitbox
        let offsetX = direction * this.enemy.meleeAttackDist;

        
        // Crear sprite de animación de ataque
        this.meleeSprite = this.enemy.scene.add.sprite(
            this.enemy.x + offsetX,
            this.enemy.y,
            this.enemy?.attackAnimationKey
        );
        
        let sprite = this.meleeSprite;
        sprite.setDepth(this.enemy.depth + 1); // Un nivel arriba del enemigo
           
        sprite.play(this.enemy.attackAnimationKey);

        // Ajustar dirección/flip de la animación
        
        this.meleeSprite.setFlipX(direction === -1);

        // Crear hitbox (puedes ajustar la posición según la animación)
        let hitbox = this.enemy.scene.add.rectangle(
            this.enemy.x + offsetX,
            this.enemy.y,
            h,
            w,
            0xff0000,
            0.3 // Alpha reducido para ver mejor la animación
        );

        this.enemy.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;

        sprite.once('animationcomplete', () => {
            sprite.destroy();
            if(hitbox) hitbox.destroy();
        })

        let damaged = false;

        // Colision con jugador
        this.enemy.scene.physics.add.overlap(
            hitbox,
            this.enemy.player,
            (hb, player) => {
                if (damaged) return;
                damaged = true;

                let knockDir = player.x < this.enemy.x ? -1 : 1;
                player.takeDamage(this.enemy.damage, knockDir);
            }
        );
    }

}
import BaseEnemyAttackState from './BaseEnemyAttackState.js';

/**
 * estado de ataque melee con animación
 */
export default class MeleeEnemyAttackState extends BaseEnemyAttackState {
    
    enter(enemy) {
        super.enter(enemy);
        this.hasAttacked = false;               // evita doble ataque
        this.meleeSprite = null;                // referencia al sprite de ataque
        let direction = enemy.player.x > enemy.x ? 1 : -1;

        if (!this.hasAttacked) {
            this.meleeAttack(direction);
            this.hasAttacked = true;
        }
    }

    execute(enemy, time, delta) {
        super.execute(enemy, time, delta);       // termina ataque si ya acabo
    }

    /**
     * ataque melee con hitbox y animación
     */
    meleeAttack(direction) {
        let w = this.enemy.meleeAttackWidge;     // ancho hitbox
        let h = this.enemy.meleeAttackHeight;    // alto hitbox
        let offsetX = direction * this.enemy.meleeAttackDist;

        // Determinar qué animación usar basado en el tipo de enemigo
        let meleeAnimationKey = '';
        let meleeTexture = '';
        
        // USAR LA TEXTURE KEY DIRECTAMENTE PARA DETERMINAR
        if (this.enemy.texture.key.includes('Angry') || this.enemy.texture.key === 'basicEnemyAngry') {
            meleeAnimationKey = 'basicEnemyAngry_melee_anim';
            meleeTexture = 'basicEnemyAngry_melee';
        } else if (this.enemy.texture.key.includes('Sad') || this.enemy.texture.key === 'basicEnemySad') {
            meleeAnimationKey = 'basicEnemySad_melee_anim';
            meleeTexture = 'basicEnemySad_melee';
        } else {
            // O usar una propiedad específica si existe
            if (this.enemy.meleeAttackAnimationKey) {
                meleeAnimationKey = this.enemy.meleeAttackAnimationKey;
                meleeTexture = this.enemy.meleeAttackAnimationKey.replace('_anim', '');
            } else {
                meleeAnimationKey = 'basicEnemyAngry_melee_anim';
                meleeTexture = 'basicEnemyAngry_melee';
            }
        }

        console.log(`Enemy texture key: ${this.enemy.texture.key}`);
        console.log(`Using animation: ${meleeAnimationKey}`);
        console.log(`Using texture: ${meleeTexture}`);

        // Crear sprite de animación de ataque
        this.meleeSprite = this.enemy.scene.add.sprite(
            this.enemy.x + offsetX,
            this.enemy.y,
            meleeTexture
        );
        
        this.meleeSprite.setDepth(this.enemy.depth + 1); // Un nivel arriba del enemigo
        
        // Verificar que la animación existe antes de reproducirla
        if (this.enemy.scene.anims.exists(meleeAnimationKey)) {
            this.meleeSprite.play(meleeAnimationKey);
        } else {
            console.error(`Animation ${meleeAnimationKey} does not exist!`);
            // Usar la textura estática como fallback
            this.meleeSprite.setFrame(0);
        }

        // Ajustar dirección/flip de la animación
        if (direction === -1) {
            this.meleeSprite.setFlipX(true);
        } else {
            this.meleeSprite.setFlipX(false);
        }

        // Crear hitbox (puedes ajustar la posición según la animación)
        this.hitbox = this.enemy.scene.add.rectangle(
            this.enemy.x + offsetX,
            this.enemy.y,
            h,
            w,
            0xff0000,
            0.3 // Alpha reducido para ver mejor la animación
        );

        this.enemy.scene.physics.add.existing(this.hitbox);
        this.hitbox.body.allowGravity = false;

        let damaged = false;

        // Colision con jugador
        this.enemy.scene.physics.add.overlap(
            this.hitbox,
            this.enemy.player,
            (hb, player) => {
                if (damaged) return;
                damaged = true;

                let knockDir = player.x < this.enemy.x ? -1 : 1;
                player.takeDamage(this.enemy.damage, knockDir);
            }
        );

        // Destruir sprite y hitbox cuando termine la animación
        this.meleeSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (this.meleeSprite) {
                this.meleeSprite.destroy();
                this.meleeSprite = null;
            }
        });

        // También destruir después de un tiempo por seguridad
        this.enemy.scene.time.delayedCall(500, () => {
            if (this.meleeSprite && this.meleeSprite.active) {
                this.meleeSprite.destroy();
                this.meleeSprite = null;
            }
        });
    }

    exit(enemy) {
        // Destruir hitbox y sprite si aún existen
        if (this.hitbox) {
            this.hitbox.destroy();
            this.hitbox = null;
        }
        
        if (this.meleeSprite) {
            this.meleeSprite.destroy();
            this.meleeSprite = null;
        }
    }
}
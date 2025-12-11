/**
 * clase baseplatform
 * plataforma que puede ser destruida temporalmente al ser golpeada
 */
export default class BasePlatform extends Phaser.Physics.Arcade.Sprite {

    /**
     * constructor de la plataforma base
     * @param {object} scene - escena actual
     * @param {number} x - posicion horizontal
     * @param {number} y - posicion vertical
     * @param {string} texture - clave de textura
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;                          // referencia a la escena

        scene.add.existing(this);                    // agregar a la escena
        scene.physics.add.existing(this);            // activar fisicas

        this.setScale(2.5, 1);                       // escala inicial

        this.body.setAllowGravity(false);            // sin gravedad
        this.setImmovable(true);                     // inmovible
        this.body.moves = false;                     // no se mueve por fisicas

        this.active = true;                          // estado activo
        this.visible = true;                         // estado visible

        // nueva propiedad para rastrear si esta desactivada
        this.isDeactivated = false;
        
        // propiedad para controlar si esta temblando
        this.isShaking = false;
        
        // propiedades para las particulas de rotura
        this.particles = null;
        
        // sonido
        this.breakSound = null;
    }

    /**
     * metodo para desactivar la plataforma (por colision con puño)
     */
    deactivateByPunch() {
        // evitar doble activacion o si ya esta temblando
        if (this.isDeactivated || this.isShaking) return;

        this.isShaking = true;
        
        // iniciar efecto de temblor
        this.startShakeEffect();
        
        // despues del temblor, romper la plataforma
        this.scene.time.delayedCall(800, () => {
            this.breakPlatform();
            
            // reactivar despues de x segundos
            this.scene.time.delayedCall(2500, () => {
                this.reactivate();
            });
        });
    }

    /**
     * efecto de temblor antes de romperse
     */
    startShakeEffect() {
        // guardar posicion original
        this.originalX = this.x;
        this.originalY = this.y;
        
        // configurar el temblor
        const shakeDuration = 800; // 0.8 segundos
        const shakeIntensity = 4; // intensidad del temblor
        
        // crear tween de temblor horizontal
        this.scene.tweens.add({
            targets: this,
            x: {
                from: this.originalX - shakeIntensity,
                to: this.originalX + shakeIntensity,
                duration: 50,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Math.floor(shakeDuration / 100)
            },
            // crear tween de temblor vertical
            y: {
                from: this.originalY - shakeIntensity / 2,
                to: this.originalY + shakeIntensity / 2,
                duration: 70,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Math.floor(shakeDuration / 140)
            },
            onComplete: () => {
                // volver a la posicion original
                this.x = this.originalX;
                this.y = this.originalY;
            }
        });
        
        // efecto visual adicional: parpadeo
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(shakeDuration / 200)
        });
        
        // reproducir sonido de temblor (si existe)
        if (this.scene.sound.get('platformShake')) {
            this.scene.sound.play('platformShake', { volume: 0.5 });
        }
    }

    /**
     * rompe la plataforma
     */
    breakPlatform() {
        this.isDeactivated = true;
        this.isShaking = false;
        
        // crear efecto de particulas para simular rotura
        this.createBreakParticles();
        
        // efecto de desvanecimiento y transformacion al "romperse"
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: this.scaleX * 1.2,
            scaleY: this.scaleY * 0.3,
            angle: Phaser.Math.Between(-10, 10),
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.setActive(false);          // desactivar logica
                this.setVisible(false);         // ocultar sprite
                this.body.enable = false;       // desactivar fisicas
            }
        });
        
        // reproducir sonido de rotura
        if (this.scene.sound.get('platformBreak')) {
            this.scene.sound.play('platformBreak', { volume: 0.7 });
        }
    }

    /**
     * crea particulas de rotura
     */
    createBreakParticles() {
        // usar el mismo color que la plataforma o un color de rotura
        const color = this.tint || 0xffffff;
        
        // crear emisor de particulas
        this.particles = this.scene.add.particles(this.x, this.y, null, {
            speed: { min: 50, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.3, end: 0 },
            gravityY: 300,
            lifespan: 1000,
            quantity: 15,
            emitting: false,
            tint: color
        });
        
        // emitir particulas una vez
        this.particles.emitParticle(15);
        
        // destruir particulas despues de un tiempo
        this.scene.time.delayedCall(1500, () => {
            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        });
    }

    /**
     * metodo para reactivar la plataforma
     */
    reactivate() {
        // animacion de reconstruccion
        this.setVisible(true);
        this.setAlpha(0);
        this.setScale(2.5 * 1.2, 1 * 0.3); // escala inicial deformada
        
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scaleX: 2.5,
            scaleY: 1,
            angle: 0,
            duration: 500,
            ease: 'Back.easeOut', // efecto de rebote
            onComplete: () => {
                // restaurar estados y fisicas
                this.isDeactivated = false;
                this.setActive(true);
                this.body.enable = true;
                this.body.setAllowGravity(false);
                this.setImmovable(true);
                this.body.moves = false;
                
                // efecto visual de parpadeo al reactivar
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0.8,
                    duration: 100,
                    yoyo: true,
                    repeat: 2
                });
            }
        });
    }

    /**
     * metodo action original modificado para usar la desactivacion
     */
    action() {
        if (!this.active || this.isDeactivated) return;

        // usar el mismo efecto que con el puño
        this.deactivateByPunch();
    }
}
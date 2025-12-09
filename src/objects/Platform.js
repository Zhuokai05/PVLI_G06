export default class BasePlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.scene = scene;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2.5, 1);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        this.body.moves = false;

        this.active = true;
        this.visible = true;

        // Nueva propiedad para rastrear si está desactivada
        this.isDeactivated = false;
        
        // Propiedad para controlar si está temblando
        this.isShaking = false;
        
        // Propiedades para las partículas de rotura
        this.particles = null;
        
        // Sonido (asegúrate de tener el sonido cargado en tu escena)
        this.breakSound = null;
    }

    // Método para desactivar la plataforma (por colisión con puño)
    deactivateByPunch() {
        if (this.isDeactivated || this.isShaking) return;

        this.isShaking = true;
        
        // Iniciar efecto de temblor
        this.startShakeEffect();
        
        // Después del temblor, romper la plataforma
        this.scene.time.delayedCall(800, () => {
            this.breakPlatform();
            
            // Reactivar después de X segundos
            this.scene.time.delayedCall(2500, () => {
                this.reactivate();
            });
        });
    }

    // Efecto de temblor
    startShakeEffect() {
        // Guardar posición original
        this.originalX = this.x;
        this.originalY = this.y;
        
        // Configurar el temblor
        const shakeDuration = 800; // 0.8 segundos
        const shakeIntensity = 4; // Intensidad del temblor
        
        // Crear tween de temblor
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
            y: {
                from: this.originalY - shakeIntensity / 2,
                to: this.originalY + shakeIntensity / 2,
                duration: 70,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: Math.floor(shakeDuration / 140)
            },
            onComplete: () => {
                // Volver a la posición original
                this.x = this.originalX;
                this.y = this.originalY;
            }
        });
        
        // Efecto visual adicional: parpadeo
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            repeat: Math.floor(shakeDuration / 200)
        });
        
        // Reproducir sonido de temblor (si existe)
        if (this.scene.sound.get('platformShake')) {
            this.scene.sound.play('platformShake', { volume: 0.5 });
        }
    }

    // Romper la plataforma
    breakPlatform() {
        this.isDeactivated = true;
        this.isShaking = false;
        
        // Crear efecto de partículas para simular rotura
        this.createBreakParticles();
        
        // Efecto de desvanecimiento mientras se "rompe"
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: this.scaleX * 1.2,
            scaleY: this.scaleY * 0.3,
            angle: Phaser.Math.Between(-10, 10),
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.setActive(false);
                this.setVisible(false);
                this.body.enable = false;
            }
        });
        
        // Reproducir sonido de rotura
        if (this.scene.sound.get('platformBreak')) {
            this.scene.sound.play('platformBreak', { volume: 0.7 });
        }
    }

    // Crear partículas de rotura
    createBreakParticles() {
        // Usar el mismo color que la plataforma o un color de rotura
        const color = this.tint || 0xffffff;
        
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
        
        // Emitir partículas una vez
        this.particles.emitParticle(15);
        
        // Destruir partículas después de un tiempo
        this.scene.time.delayedCall(1500, () => {
            if (this.particles) {
                this.particles.destroy();
                this.particles = null;
            }
        });
    }

    // Método para reactivar la plataforma
    reactivate() {
        // Animación de reconstrucción
        this.setVisible(true);
        this.setAlpha(0);
        this.setScale(2.5 * 1.2, 1 * 0.3);
        
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scaleX: 2.5,
            scaleY: 1,
            angle: 0,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.isDeactivated = false;
                this.setActive(true);
                this.body.enable = true;
                this.body.setAllowGravity(false);
                this.setImmovable(true);
                this.body.moves = false;
                
                // Efecto visual de parpadeo al reactivar
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

    // Método action original modificado
    action() {
        if (!this.active || this.isDeactivated) return;

        // Aquí podrías implementar un temblor diferente o similar
        this.deactivateByPunch(); // Usar el mismo efecto que con el puño
    }
}
import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadRadialState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 1200;
        this.attackDuration = 900;
        this.cooldownDuration = 1500;
        
        this.startWarningPhase();
        
        console.log("Ataque radial con warning");
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;

        // Crear advertencia circular alrededor del boss
        // Usamos un círculo en lugar de rectángulo para radial
        this.warningCircle = scene.add.circle(
            this.boss.x,
            this.boss.y,
            150, // Radio del área de advertencia
            0x4169e1, // Azul
            0.3
        );
        
        // También podemos añadir un borde para mayor visibilidad
        this.warningBorder = scene.add.circle(
            this.boss.x,
            this.boss.y,
            150,
            0x4169e1, // Azul
            0
        );
        this.warningBorder.setStrokeStyle(4, 0x87ceeb); // Borde azul claro
        
        // Efecto de pulso durante el warning
        scene.tweens.add({
            targets: [this.warningCircle, this.warningBorder],
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.5, to: 0.8 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.startAttackPhase();
                }
                break;
                
            case 'attack':
                if (this.stateTime >= this.attackDuration) {
                    this.startCooldownPhase();
                }
                break;
                
            case 'cooldown':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;
        
        // Destruir advertencias
        this.destroyWarning();
        
        // Lanzar carámbanos
        this.spawnRadialIcicles(12);
    }

    destroyWarning() {
        if (this.warningCircle && this.warningCircle.active) {
            this.warningCircle.destroy();
        }
        if (this.warningBorder && this.warningBorder.active) {
            this.warningBorder.destroy();
        }
    }

    spawnRadialIcicles(count) {
        const { scene, radialIcicles } = this.boss;
        
        // Posición de lanzamiento desde el boss
        const startX = this.boss.x;
        const startY = this.boss.y;
        const speed = this.boss.radialSpeed || 300;
        
        // Ángulo de dispersión (360 grados = círculo completo)
        const angleStep = (Math.PI * 2) / count;
        
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            
            // Calcular dirección
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            // Crear carámbano
            const icicle = radialIcicles.create(startX, startY, 'icicle');
            
            // Configurar física
            icicle.setVelocity(velocityX, velocityY);
            icicle.setScale(1);
            icicle.body.allowGravity = false;
            icicle.setTint(0xadd8e6);
            
            // Rotación
            const rotationAngle = Math.atan2(velocityY, velocityX);
            icicle.setRotation(rotationAngle);

            // Configurar cleanup
            this.setupIcicleCleanup(icicle);
        }
    }

    setupIcicleCleanup(icicle) {
        const scene = this.boss.scene;
        
        // Usar time.addEvent para checkear periódicamente
        scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (!icicle.active) return;
                
                // Destruir si está muy lejos del boss
                const distance = Phaser.Math.Distance.Between(
                    this.boss.x, this.boss.y,
                    icicle.x, icicle.y
                );
                
                if (distance > 800) {
                    icicle.destroy();
                }
                
                // También destruir si sale completamente de pantalla
                const cam = scene.cameras.main;
                const bounds = new Phaser.Geom.Rectangle(
                    cam.worldView.x - 200,
                    cam.worldView.y - 200,
                    cam.worldView.width + 400,
                    cam.worldView.height + 400
                );
                
                if (!bounds.contains(icicle.x, icicle.y)) {
                    icicle.destroy();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Asegurarse de limpiar las advertencias si aún existen
        this.destroyWarning();
    }
}
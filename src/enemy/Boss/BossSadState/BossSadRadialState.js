import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadRadialState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        this.attackDuration = 900;
        this.cooldownDuration = 1500;
        
        this.spawnRadialIcicles(12); // 12 carámbanos para mejor cobertura
        
        console.log("Ataque radial");
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
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

    spawnRadialIcicles(count) {
        const { scene, radialIcicles } = this.boss;
        
        // Posición de lanzamiento desde el boss
        const startX = this.boss.x;
        const startY = this.boss.y - 50;
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
            icicle.setScale(1.5);
            icicle.body.allowGravity = false;
            icicle.setTint(0xadd8e6);
            
            // **ROTACIÓN CORREGIDA**
            // Si el sprite apunta a la derecha por defecto:
            // - atan2(velocityY, velocityX) ya da el ángulo correcto
            // - NO sumamos Math.PI/2
            const rotationAngle = Math.atan2(velocityY, velocityX);
            icicle.setRotation(rotationAngle);
            
            console.log(`Carámbano ${i}: ángulo=${angle.toFixed(2)} rad, rotación=${rotationAngle.toFixed(2)} rad, velocidad=(${velocityX.toFixed(0)}, ${velocityY.toFixed(0)})`);

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
        // No necesitamos hacer nada especial aquí
    }
}
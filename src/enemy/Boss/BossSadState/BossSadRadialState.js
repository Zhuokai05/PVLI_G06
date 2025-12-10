import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

export default class BossSadRadialState extends BaseBossAttackState {
    constructor(texture = 'icicle') {
        super({
            texture: texture,
            attackName: 'Ataque Radial',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 1200,
            attackDuration: 900,
            cooldownDuration: 1500
        });
    }
    
    createWarning() {
        // Crear advertencia circular alrededor del boss
        const warningCircle = this.createWarningCircle(
            this.boss.x,
            this.boss.y,
            150,
            0x4169e1,
            0.3
        );
        
        // Borde para mayor visibilidad
        const warningBorder = this.scene.add.circle(
            this.boss.x,
            this.boss.y,
            150,
            0x4169e1,
            0
        );
        warningBorder.setStrokeStyle(4, 0x87ceeb);
        
        this.registerWarningElement('warningCircle', warningCircle);
        this.registerWarningElement('warningBorder', warningBorder);
        
        // Efecto de pulso
        this.createPulseEffect([warningCircle, warningBorder], 600, 0.5, 0.8, 1, 1.2);
    }
    
    createWarningCircle(x, y, radius, color, alpha) {
        const circle = this.scene.add.circle(x, y, radius, color, alpha);
        this.registerWarningElement('warningCircle', circle);
        return circle;
    }
    
    executeAttack() {
        this.spawnRadialIcicles(12);
    }
    
    spawnRadialIcicles(count) {
        const speed = this.boss.radialSpeed || 300;
        const angleStep = (Math.PI * 2) / count;
        
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            const icicle = this.boss.radialIcicles.create(
                this.boss.x,
                this.boss.y,
                this.config.texture
            );
            
            icicle.setVelocity(velocityX, velocityY);
            icicle.setScale(1);
            icicle.body.allowGravity = false;
            
            const rotationAngle = Math.atan2(velocityY, velocityX);
            icicle.setRotation(rotationAngle);
            
            this.setupIcicleCleanup(icicle);
        }
    }
    
    setupIcicleCleanup(icicle) {
        const cleanupEvent = this.scene.time.addEvent({
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
                    cleanupEvent.remove(false);
                }
                
                // Destruir si sale de pantalla
                const cam = this.scene.cameras.main;
                const bounds = new Phaser.Geom.Rectangle(
                    cam.worldView.x - 200,
                    cam.worldView.y - 200,
                    cam.worldView.width + 400,
                    cam.worldView.height + 400
                );
                
                if (!bounds.contains(icicle.x, icicle.y)) {
                    icicle.destroy();
                    cleanupEvent.remove(false);
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Registrar evento para limpieza
        if (!this.cleanupEvents) {
            this.cleanupEvents = [];
        }
        this.cleanupEvents.push(cleanupEvent);
    }
    
    destroyAllWarnings() {
        super.destroyAllWarnings();
        
        // Limpiar eventos de cleanup
        if (this.cleanupEvents) {
            this.cleanupEvents.forEach(event => {
                if (event) event.remove(false);
            });
            this.cleanupEvents = null;
        }
    }
}
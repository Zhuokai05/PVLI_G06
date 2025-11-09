import BaseState from '../../../stateMachine/BaseState.js';

export default class BossSadRadialState extends BaseState {
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'attack'; // attack -> cooldown
        this.attackDuration = 800;
        this.cooldownDuration = 500;
        
        this.spawnRadialIcicles(7); // 7 carámbanos en semicírculo
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
        const cam = scene.cameras.main;
        
        // Posición de lanzamiento: mitad en Y, extremo derecho
        const startX = cam.width;
        const startY = cam.height / 2;
        
        // Ángulo de dispersión (180 grados = semicírculo)
        const angleRange = 180;
        const angleStep = angleRange / (count - 1);
        const startAngle = -90; // Empezar desde arriba
        
        for (let i = 0; i < count; i++) {
            const angle = Phaser.Math.DegToRad(startAngle + (angleStep * i));
            const speed = 400;
            
            const velocityX = -Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            const icicle = radialIcicles.create(startX, startY, 'icicle');
            icicle.setVelocity(velocityX, velocityY);
            icicle.setScale(2);
            icicle.body.allowGravity = false;
            icicle.setTint(0xadd8e6); // Azul claro
            
            // Rotar el carámbano según la dirección del movimiento
            // El sprite original mira hacia la izquierda, así que lo rotamos según el ángulo
            const rotationAngle = Math.atan2(velocityY, velocityX);
            icicle.setRotation(rotationAngle);

            this.cleanupIcicle(icicle);
        }
    }

    cleanupIcicle(icicle) {
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!icicle.active) return;
            const cam = scene.cameras.main;
            if (icicle.x < -200 || icicle.x > cam.width + 200 || 
                icicle.y < -200 || icicle.y > cam.height + 200) {
                icicle.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Limpiar cualquier carámbano restante
    }
}
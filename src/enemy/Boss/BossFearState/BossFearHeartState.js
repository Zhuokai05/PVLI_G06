import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearHeartState extends BaseState {
    enter(context) {
        this.boss = context;
        console.log('FASE 1 - Corazón vulnerable');
        
        this.createHeart();
        this.setupCollision();
    }

    createHeart() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;
        
        // Crear corazón y guardarlo en el boss para que persista entre estados
        this.boss.heart = scene.physics.add.sprite(
            cam.width / 2,
            cam.height / 2,
            'corazon'
        );
        
        this.boss.heart.setScale(2);
        this.boss.heart.body.allowGravity = false;
        
        const heartWidth = this.boss.heart.displayWidth;
        const heartHeight = this.boss.heart.displayHeight;
        this.boss.heart.body.setSize(heartWidth * 0.4, heartHeight * 0.5);
        this.boss.heart.body.setOffset(heartWidth * 0.05, 0);
        
        this.boss.heart.body.debugShowBody = true;
        this.boss.heart.body.debugBodyColor = 0xff0000;
        
        console.log('Corazón Fase 1 creado');
        
        this.floatTween = scene.tweens.add({
            targets: this.boss.heart,
            y: '-=30',
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupCollision() {
        const { scene, player } = this.boss;
        
        this.heartCollider = scene.physics.add.overlap(
            player,
            this.boss.heart,
            this.onPlayerHitHeart,
            this.checkIfPlayerAttacking,
            this
        );
    }

    checkIfPlayerAttacking(player, heart) {
        return player.isAttacking;
    }

    onPlayerHitHeart(player, heart) {
        console.log('¡Golpe al corazón!');
        this.boss.takeDamage(1);
        this.showHitEffect(heart);
    }

    showHitEffect(heart) {
        const { scene } = this.boss;
        
        heart.setTint(0xff0000);
        
        scene.tweens.add({
            targets: heart,
            scaleX: 2.2,
            scaleY: 2.2,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                heart.setTint(0xffffff);
            }
        });
    }

    execute(context, time, delta) {
        // Lógica de Fase 1
    }

    exit(context) {
        console.log('Saliendo de Fase 1');
        
        if (this.floatTween) {
            this.floatTween.stop();
        }
        
        if (this.heartCollider) {
            this.heartCollider.destroy();
        }
        
        // El corazón se queda pero sin animación y sin colisión
        if (this.boss.heart) {
            this.boss.heart.body.debugShowBody = false;
            this.boss.heart.setTint(0x666666); // Gris para indicar inactivo
            this.boss.heart.body.enable = false; // Deshabilitar colisión
        }
    }
}
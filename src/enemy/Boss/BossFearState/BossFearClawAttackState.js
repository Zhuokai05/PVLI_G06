import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearClawAttackState extends BaseState {
    enter(context) {
        this.boss = context;
        console.log('ATAQUE DE GARRAS - Jugador falló');
        
        this.attackPlayer();
    }

    attackPlayer() {
        const { scene, player } = this.boss;
        
        // Buscar las garras por nombre
        this.setupClawsForAttack();
        
        if (this.leftClaw && this.rightClaw) {
            // Ataque rápido de ambas garras hacia el jugador
            this.attackWithClaw(this.leftClaw, player);
            this.attackWithClaw(this.rightClaw, player);
        }
        
        // Después del ataque, volver al Cup Game
        scene.time.delayedCall(1500, () => {
            this.boss.stateMachine.setState('cupGame');
        });
    }

    setupClawsForAttack() {
        const { scene, player } = this.boss;
        
        // Buscar las garras existentes en la escena por nombre
        this.leftClaw = scene.children.getByName('leftClaw');
        this.rightClaw = scene.children.getByName('rightClaw');
        
        if (!this.leftClaw || !this.rightClaw) {
            console.error('Garras no encontradas para el ataque');
            return;
        }
        
        // Añadir física a las garras temporalmente
        scene.physics.add.existing(this.leftClaw);
        scene.physics.add.existing(this.rightClaw);
        
        this.leftClaw.body.allowGravity = false;
        this.rightClaw.body.allowGravity = false;
        
        // Configurar colisión con el jugador
        scene.physics.add.overlap(player, this.leftClaw, this.onClawHit, null, this);
        scene.physics.add.overlap(player, this.rightClaw, this.onClawHit, null, this);
    }

    attackWithClaw(claw, player) {
        const { scene } = this.boss;
        
        // Guardar posición original
        const originalX = claw.x;
        const originalY = claw.y;
        
        // Ataque rápido hacia el jugador
        scene.tweens.add({
            targets: claw,
            x: player.x,
            y: player.y,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                // Volver a posición original
                scene.tweens.add({
                    targets: claw,
                    x: originalX,
                    y: originalY,
                    duration: 600,
                    ease: 'Back.easeOut'
                });
            }
        });
    }

    onClawHit(player, claw) {
        // El jugador recibe daño
        player.takeDamage(1, player.x < claw.x ? -1 : 1);
        
        // Efecto visual
        claw.setTint(0xff0000);
        this.boss.scene.time.delayedCall(200, () => {
            claw.clearTint();
        });
    }

    execute(context, time, delta) {
        // Lógica durante el ataque
    }

    exit(context) {
        console.log('Saliendo de Ataque de Garras');
        // Quitar física de las garras
        if (this.leftClaw && this.leftClaw.body) {
            this.leftClaw.body.destroy();
        }
        if (this.rightClaw && this.rightClaw.body) {
            this.rightClaw.body.destroy();
        }
    }
}
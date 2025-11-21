import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearPhase2State extends BaseState {
    enter(context) {
        this.boss = context;
        console.log('FASE 2 - Mascara y Garras');
        
        this.createPhase2Components();
        
        // Después de mostrar los componentes, iniciar Cup Game
        this.boss.scene.time.delayedCall(1000, () => {
            this.boss.stateMachine.setState('cupGame');
        });
    }

    createPhase2Components() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;
        
        // 1. MÁSCARA en medio arriba
        this.mask = scene.add.sprite(
            cam.width / 2,
            cam.height / 6,
            'mascara'
        );
        this.mask.setScale(4.3);
        
        // 2. GARRA IZQUIERDA - NUEVO: Asignar nombre para poder encontrarla después
        this.leftClaw = scene.add.sprite(
            cam.width / 8,
            cam.height / 3,
            'garra'
        );
        this.leftClaw.setScale(3);
        this.leftClaw.setName('leftClaw'); // NUEVO: Nombre para identificarla
        
        // 3. GARRA DERECHA - NUEVO: Asignar nombre para poder encontrarla después
        this.rightClaw = scene.add.sprite(
            cam.width * 7 / 8,
            cam.height / 3,
            'garra'
        );
        this.rightClaw.setScale(3);
        this.rightClaw.setName('rightClaw'); // NUEVO: Nombre para identificarla
        
        console.log('Fase 2: Máscara y garras creadas');
    }

    execute(context, time, delta) {
        // Transición rápida al Cup Game
    }

    exit(context) {
        console.log('Saliendo de Fase 2 inicial');
        // Los sprites de máscara y garras se mantienen durante todo el Cup Game
    }
}
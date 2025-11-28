import BaseState from '../../../stateMachine/BaseState.js';

export default class BossFearCupGameState extends BaseState {
    enter(context) {
        this.boss = context;
        console.log('CUP GAME - Iniciando juego de vasos');
        
        this.cups = [];
        this.heartUnderCup = null;
        this.cupGameActive = true;
        this.swapCount = 0;
        this.maxSwaps = 5;
        
        // OCULTAR el corazón existente al iniciar el Cup Game
        if (this.boss.heart) {
            this.boss.heart.setVisible(false);
        }
        
        this.createCups();
        this.startCupSwapping();
    }

    createCups() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;
        
        const cupPositions = [
            { x: cam.width / 2 - 250, y: -100 },
            { x: cam.width / 2, y: -100 },
            { x: cam.width / 2 + 250, y: -100 }
        ];
        
        const targetY = cam.height / 2;
        
        // Crear los tres vasos
        cupPositions.forEach((pos, index) => {
            const cup = scene.physics.add.sprite(pos.x, pos.y, 'vaso');
            cup.setScale(2);
            cup.body.allowGravity = false;
            cup.setImmovable(true);
            cup.setData('index', index);
            
            // MÁS LENTO: Caída de los vasos 
            scene.tweens.add({
                targets: cup,
                y: targetY,
                duration: 1200, // MÁS LENTO
                ease: 'Bounce.easeOut',
                onComplete: () => {
                    if (index === 2) {
                        this.setupCupCollisions();
                    }
                }
            });
            
            this.cups.push(cup);
        });
        
        // Elegir aleatoriamente qué vaso tendrá el corazón
        const heartIndex = Phaser.Math.Between(0, 2);
        this.heartUnderCup = this.cups[heartIndex];
        
        console.log(`Corazón bajo vaso: ${heartIndex}`);
    }

    setupCupCollisions() {
        const { scene, player } = this.boss;
        
        this.cups.forEach(cup => {
            scene.physics.add.overlap(
                player,
                cup,
                this.onCupHit,
                this.checkIfPlayerAttacking,
                this
            );
        });
        
        this.cupGameActive = true;
    }

    checkIfPlayerAttacking(player, cup) {
        return player.isAttacking && this.cupGameActive;
    }

    startCupSwapping() {
        const { scene } = this.boss;
        
        // MÁS LENTO: Esperar más antes de empezar a intercambiar
        scene.time.delayedCall(1500, () => { // 1500ms en lugar de 1000ms
            this.performCupSwap();
        });
    }

    performCupSwap() {
        if (this.swapCount >= this.maxSwaps || !this.cupGameActive) return;
        
        const { scene } = this.boss;
        this.swapCount++;
        
        const cupPositions = [
            { x: scene.cameras.main.width / 2 - 250, y: scene.cameras.main.height / 2 },
            { x: scene.cameras.main.width / 2, y: scene.cameras.main.height / 2 },
            { x: scene.cameras.main.width / 2 + 250, y: scene.cameras.main.height / 2 }
        ];
        
        const shuffledPositions = [...cupPositions];
        Phaser.Utils.Array.Shuffle(shuffledPositions);
        
        const swapSpeed = this.boss.getCupSpeed();
        
        console.log(`Intercambio ${this.swapCount} - Velocidad: ${swapSpeed}ms`);
        
        // Mover cada vaso a una nueva posición
        this.cups.forEach((cup, index) => {
            scene.tweens.add({
                targets: cup,
                x: shuffledPositions[index].x,
                y: shuffledPositions[index].y,
                duration: swapSpeed,
                ease: 'Back.easeOut'
            });
        });
        
        if (this.swapCount < this.maxSwaps) {
            // MÁS LENTO: Esperar más entre intercambios
            scene.time.delayedCall(swapSpeed + 400, () => { // 400ms en lugar de 200ms
                this.performCupSwap();
            });
        } else {
            console.log('Intercambios completados - Esperando selección del jugador');
        }
    }

    onCupHit(player, cup) {
        if (!this.cupGameActive) return;
        
        this.cupGameActive = false;
        console.log(`Vaso ${cup.getData('index')} golpeado`);
        
        this.revealCup(cup);
    }

    revealCup(selectedCup) {
        const { scene } = this.boss;
        
        // MÁS LENTO: Levantar el vaso seleccionado
        scene.tweens.add({
            targets: selectedCup,
            y: selectedCup.y - 120,
            duration: 800, // MÁS LENTO: 800ms en lugar de 500ms
            ease: 'Back.easeOut',
            onComplete: () => {
                this.checkCupResult(selectedCup);
            }
        });
    }

    checkCupResult(selectedCup) {
        if (selectedCup === this.heartUnderCup) {
            console.log('¡CORRECTO! Encontró el corazón');
            this.boss.takeDamage(2);
            this.showHeartUnderCup();
        } else {
            console.log('¡FALLÓ! No hay corazón');
            this.showEmptyCup(selectedCup);
            this.boss.stateMachine.setState('clawAttack');
        }
    }

    showHeartUnderCup() {
        const { scene } = this.boss;
        
        // MOSTRAR el corazón existente en la posición del vaso correcto
        if (this.boss.heart) {
            this.boss.heart.setVisible(true);
            this.boss.heart.setPosition(this.heartUnderCup.x, this.heartUnderCup.y - 80);
            this.boss.heart.clearTint(); // Quitar el tint gris
            
            // Efecto de corazón encontrado (más lento)
            scene.tweens.add({
                targets: this.boss.heart,
                scaleX: 2.2,
                scaleY: 2.2,
                duration: 500, // MÁS LENTO: 500ms en lugar de 300ms
                yoyo: true
            });
        }
        
        this.revealOtherCups();
    }

    showEmptyCup(selectedCup) {
        const { scene } = this.boss;
        
        // Mostrar que este vaso está vacío
        const emptyText = scene.add.text(
            selectedCup.x,
            selectedCup.y - 80,
            'VACÍO',
            { 
                fontSize: '24px', 
                fill: '#ff0000',
                fontStyle: 'bold'
            }
        );
        emptyText.setOrigin(0.5);
        
        // Efecto más lento
        scene.tweens.add({
            targets: emptyText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 500, // MÁS LENTO: 500ms en lugar de 300ms
            yoyo: true,
            onComplete: () => {
                emptyText.destroy();
            }
        });
        
        this.revealOtherCups();
    }

    revealOtherCups() {
        const { scene } = this.boss;
        const otherCups = this.cups.filter(cup => cup !== this.heartUnderCup);
        
        let revealedCount = 0;
        
        otherCups.forEach(cup => {
            // MÁS LENTO: Revelar otros vasos
            scene.tweens.add({
                targets: cup,
                y: cup.y - 120,
                duration: 800, // MÁS LENTO: 800ms en lugar de 500ms
                ease: 'Back.easeOut',
                onComplete: () => {
                    revealedCount++;
                    if (revealedCount === otherCups.length) {
                        this.resetCupGame();
                    }
                }
            });
        });

        if (otherCups.length === 0) {
            this.resetCupGame();
        }
    }

    resetCupGame() {
        const { scene } = this.boss;
        const targetY = scene.cameras.main.height / 2;
        
        // MÁS LENTO: Esperar más antes de bajar los vasos
        scene.time.delayedCall(2000, () => { // 2000ms en lugar de 1500ms
            let loweredCount = 0;
            
            this.cups.forEach(cup => {
                // MÁS LENTO: Bajar los vasos
                scene.tweens.add({
                    targets: cup,
                    y: targetY,
                    duration: 800, // MÁS LENTO: 800ms en lugar de 500ms
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        loweredCount++;
                        if (loweredCount === this.cups.length) {
                            // MOSTRAR el corazón nuevamente antes de reiniciar
                            if (this.boss.heart) {
                                this.boss.heart.setVisible(true);
                                this.boss.heart.setPosition(scene.cameras.main.width / 2, targetY);
                                this.boss.heart.setTint(0x666666); // Volver a poner tint gris
                            }
                            
                            // MÁS LENTO: Esperar más antes de reiniciar
                            scene.time.delayedCall(1500, () => { // 1500ms en lugar de 1000ms
                                this.cleanupAndRestart();
                            });
                        }
                    }
                });
            });
        });
    }

    cleanupAndRestart() {
        // Limpiar vasos
        this.cups.forEach(cup => {
            if (cup.active) {
                cup.destroy();
            }
        });
        this.cups = [];
        
        // OCULTAR el corazón nuevamente antes del siguiente Cup Game
        if (this.boss.heart) {
            this.boss.heart.setVisible(false);
        }
        
        // Reiniciar el estado
        this.boss.stateMachine.setState('cupGame');
    }

    execute(context, time, delta) {
        // Lógica de ejecución del Cup Game
    }

    exit(context) {
        console.log('Saliendo de Cup Game');
        this.cupGameActive = false;
        
        // Limpiar vasos pero mantener el corazón
        this.cups.forEach(cup => {
            if (cup.active) {
                cup.destroy();
            }
        });
        this.cups = [];
        
        // Asegurarse de que el corazón esté visible al salir
        if (this.boss.heart) {
            this.boss.heart.setVisible(true);
            this.boss.heart.setTint(0x666666);
        }
    }
}
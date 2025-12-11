class LoadingScene extends Phaser.Scene {
    constructor() {
        super('Loading');
    }

    create() {
        // Fondo
        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'loading');

        // Crear contenedor para la barra de carga
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Dimensiones del rectángulo 
        const barWidth = 600; 
        const barHeight = 80; 
        const borderThickness = 8; 
        
        // Crear rectángulo de fondo (borde)
        const border = this.add.rectangle(
            centerX, 
            centerY + 30, // Bajado menos
            barWidth + borderThickness * 2, 
            barHeight + borderThickness * 2, 
            0x000000
        ).setOrigin(0.5);
        
        // Crear rectángulo de fondo interior (blanco)
        const backgroundBar = this.add.rectangle(
            centerX, 
            centerY + 30, // Bajado menos
            barWidth, 
            barHeight, 
            0xFFFFFF
        ).setOrigin(0.5);
        
        // Crear rectángulo de progreso (rojo)
        this.progressBar = this.add.rectangle(
            centerX - barWidth / 2, 
            centerY + 30, 
            0, 
            barHeight, 
            0xFF0000 // Color rojo
        ).setOrigin(0, 0.5);
        
        // Texto del porcentaje 
        this.progressText = this.add.text(
            centerX,
            centerY + 30, 
            '0%',
            {
                fontFamily: 'Arial',
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 6 
            }
        ).setOrigin(0.5);
        
        // Texto de "Cargando..." 
        this.loadingText = this.add.text(
            centerX,
            centerY - barHeight/2 - 10, // Menos espacio arriba
            'CARGANDO......',
            {
                fontFamily: 'Arial',
                fontSize: '64px', 
                fontWeight: 'bold',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 8, 
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // Simular progreso de carga
        this.progress = 0;
        this.targetProgress = 1.0; // 100%
        
        // Temporizador para simular carga
        this.time.addEvent({
            delay: 80,
            callback: () => {
                if (this.progress < this.targetProgress) {
                    // Incrementar progreso
                    this.progress += Math.random() * 0.08 + 0.02;
                    
                    // Asegurarse de que no supere el 100%
                    if (this.progress > this.targetProgress) {
                        this.progress = this.targetProgress;
                    }
                    
                    // Actualizar barra de progreso
                    this.updateProgressBar();
                    
                    // Cuando llegue al 100%, iniciar la siguiente escena
                    if (this.progress >= this.targetProgress) {
                        this.startNextScene();
                    }
                }
            },
            loop: true
        });
        
        // Efecto de brillo para el texto de "CARGANDO"
        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (this.loadingText) {
                    this.tweens.add({
                        targets: this.loadingText,
                        alpha: { from: 0.8, to: 1 },
                        duration: 500,
                        ease: 'Sine.easeInOut'
                    });
                }
            },
            loop: true
        });
    }

    updateProgressBar() {
        // Calcular porcentaje entero
        const percentage = Math.floor(this.progress * 100);
        
        // Actualizar ancho de la barra
        const barWidth = 600;
        const currentWidth = barWidth * this.progress;
        this.progressBar.width = currentWidth;
        
        // Actualizar texto del porcentaje
        this.progressText.setText(`${percentage}%`);
        
        // Cambiar color del texto según progreso
        if (percentage > 50) {
            this.progressText.setColor('#FFFF00');
        }
        if (percentage > 80) {
            this.progressText.setColor('#00FF00');
        }
        if (percentage === 100) {
            this.progressText.setColor('#00FFFF');
        }
        
        // Efecto de pulso para el texto de porcentaje en múltiplos de 25
        if (percentage % 25 === 0 && percentage < 100) {
            this.tweens.add({
                targets: this.progressText,
                scale: { from: 1.03, to: 1 },
                duration: 200,
                ease: 'Power2'
            });
        }
    }

    startNextScene() {
        // Detener el loop de actualización
        this.time.removeAllEvents();
        
        // Efecto final para el 100%
        this.tweens.add({
            targets: [this.progressBar, this.progressText],
            scale: { from: 1, to: 1.1 },
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Cambiar el texto a "¡COMPLETO!"
                this.progressText.setText('¡COMPLETO!');
                this.progressText.setColor('#FFD700');
                
                // Cambiar a la siguiente escena
                const sceneKey = "PlayScene";

                if (!this.scene.get(sceneKey)) {
                    console.warn(`⚠️ ${sceneKey} no existe, creando...`);
                    this.scene.launch(sceneKey);
                } else {
                    console.log(`▶️ ${sceneKey} existe, iniciando...`);
                    this.scene.start(sceneKey);
                }

                this.scene.stop('Loading');
            }
        });
        
        // Cambiar el texto "CARGANDO" a "LISTO"
        this.loadingText.setText('¡LISTO!');
        this.loadingText.setColor('#00FF00');
    }

    update(time, delta) {
        // Efecto de pulso en el texto
        if (this.loadingText) {
            const pulse = Math.sin(time / 400) * 0.3 + 0.7;
            this.loadingText.setAlpha(pulse);
        }
    }
}

export { LoadingScene }
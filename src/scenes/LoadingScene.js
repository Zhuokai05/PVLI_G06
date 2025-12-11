/**
 * clase loadingscene
 * escena que simula el proceso de carga del juego
 */
class LoadingScene extends Phaser.Scene {

    /**
     * constructor de la escena de carga
     */
    constructor() {
        super('Loading'); // clave de la escena
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() {
        // fondo de la pantalla de carga
        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'loading');

        // crear contenedor para la barra de carga
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // dimensiones del rectangulo de la barra
        const barWidth = 600; 
        const barHeight = 80; 
        const borderThickness = 8; 
        
        // crear rectangulo de fondo (borde negro)
        const border = this.add.rectangle(
            centerX, 
            centerY + 30, // posicion y
            barWidth + borderThickness * 2, 
            barHeight + borderThickness * 2, 
            0x000000
        ).setOrigin(0.5);
        
        // crear rectangulo de fondo interior (blanco)
        const backgroundBar = this.add.rectangle(
            centerX, 
            centerY + 30, // posicion y
            barWidth, 
            barHeight, 
            0xFFFFFF
        ).setOrigin(0.5);
        
        // crear rectangulo de progreso (rojo), inicialmente con ancho 0
        this.progressBar = this.add.rectangle(
            centerX - barWidth / 2, // inicio en el borde izquierdo
            centerY + 30, 
            0,                      // ancho inicial cero
            barHeight, 
            0xFF0000 // color rojo de progreso
        ).setOrigin(0, 0.5); // origen en la izquierda central
        
        // texto del porcentaje
        this.progressText = this.add.text(
            centerX,
            centerY + 30, 
            '0%',
            {
                fontFamily: 'arial',
                fontSize: '48px', 
                fontWeight: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6 
            }
        ).setOrigin(0.5);
        
        // texto de "cargando..."
        this.loadingText = this.add.text(
            centerX,
            centerY - barHeight/2 - 10, // encima de la barra
            'cargando......',
            {
                fontFamily: 'arial',
                fontSize: '64px', 
                fontWeight: 'bold',
                color: '#ffffff',
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

        // --- simulacion de progreso ---
        this.progress = 0;
        this.targetProgress = 1.0; // 100%
        
        // temporizador para simular carga incremental
        this.time.addEvent({
            delay: 80,
            callback: () => {
                if (this.progress < this.targetProgress) {
                    // incrementar progreso con un valor aleatorio
                    this.progress += Math.random() * 0.08 + 0.02;
                    
                    // asegurarse de que no supere el 100%
                    if (this.progress > this.targetProgress) {
                        this.progress = this.targetProgress;
                    }
                    
                    // actualizar barra de progreso visual y texto
                    this.updateProgressBar();
                    
                    // cuando llegue al 100%, iniciar la siguiente escena
                    if (this.progress >= this.targetProgress) {
                        this.startNextScene();
                    }
                }
            },
            loop: true
        });
        
        // efecto de brillo/pulso para el texto de "cargando"
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

    /**
     * actualiza el ancho de la barra de progreso y el texto de porcentaje
     */
    updateProgressBar() {
        // calcular porcentaje entero
        const percentage = Math.floor(this.progress * 100);
        
        // actualizar ancho de la barra
        const barWidth = 600;
        const currentWidth = barWidth * this.progress;
        this.progressBar.width = currentWidth;
        
        // actualizar texto del porcentaje
        this.progressText.setText(`${percentage}%`);
        
        // cambiar color del texto segun progreso
        if (percentage > 50) {
            this.progressText.setColor('#FFFF00'); // amarillo
        }
        if (percentage > 80) {
            this.progressText.setColor('#00FF00'); // verde
        }
        if (percentage === 100) {
            this.progressText.setColor('#00FFFF'); // cian
        }
        
        // efecto de pulso para el texto de porcentaje en multiplos de 25
        if (percentage % 25 === 0 && percentage < 100) {
            this.tweens.add({
                targets: this.progressText,
                scale: { from: 1.03, to: 1 },
                duration: 200,
                ease: 'Power2'
            });
        }
    }

    /**
     * detiene la carga e inicia la escena de juego
     */
    startNextScene() {
        // detener el loop de actualizacion de progreso
        this.time.removeAllEvents();
        
        // efecto final para el 100%
        this.tweens.add({
            targets: [this.progressBar, this.progressText],
            scale: { from: 1, to: 1.1 },
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // cambiar el texto a "¡completo!"
                this.progressText.setText('¡completo!');
                this.progressText.setColor('#FFD700'); // dorado
                
                // cambiar a la siguiente escena
                const sceneKey = "PlayScene";

                if (!this.scene.get(sceneKey)) {
                    console.warn(`⚠️ ${sceneKey} no existe, creando...`);
                    // si la escena aun no existe (solo en desarrollo si falta el import)
                    this.scene.launch(sceneKey);
                } else {
                    console.log(`▶️ ${sceneKey} existe, iniciando...`);
                    // iniciar la escena de juego
                    this.scene.start(sceneKey);
                }

                this.scene.stop('Loading'); // detener la escena de carga
            }
        });
        
        // cambiar el texto "cargando" a "listo"
        this.loadingText.setText('¡listo!');
        this.loadingText.setColor('#00FF00');
    }

    /**
     * hook de phaser para la actualizacion logica
     * @param {number} time - tiempo total
     * @param {number} delta - delta de tiempo
     */
    update(time, delta) {
        // efecto de pulso en el texto "listo"
        if (this.loadingText && this.progress >= this.targetProgress) {
            const pulse = Math.sin(time / 400) * 0.3 + 0.7;
            this.loadingText.setAlpha(pulse);
        }
    }
}

export { LoadingScene }
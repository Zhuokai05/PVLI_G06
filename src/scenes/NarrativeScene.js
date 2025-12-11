import MusicManager from '../managers/MusicManager.js';

/**
 * clase narrativescene
 * escena que muestra una narrativa inicial en formato de scroll de texto
 * similar a un 'crawl' cinematografico, con la posibilidad de saltar
 */
class NarrativeScene extends Phaser.Scene {

    /**
     * constructor de la escena de narrativa
     */
    constructor() {
        super('Narrative');
    }

    /**
     * hook de phaser para la creacion de elementos de la escena
     */
    create() {
        // configurar fondo negro completo
        this.cameras.main.setBackgroundColor('#000000');

        // variable para controlar el estado de la narrativa
        this.narrativeIndex = 0;              // indice actual del texto
        this.texts = [];                      // array de objetos de texto
        this.isComplete = false;              // la narrativa ha terminado
        this.completedAnimations = 0;         // contador de animaciones finalizadas
        this.totalTextsToComplete = 0;        // total de lineas no vacias a animar
        this.isSkipping = false;              // el usuario ha saltado la escena
        this.isChangingScene = false;         // en proceso de transicion
        this.allAnimationsStarted = false;    // todas las llamadas a delayedcall se han hecho

        // configurar los textos narrativos (lineas que haran scroll)
        this.narrativeLines = [
            "un accidente celestial...",
            "el angel cayo al infierno...",
            "impacto con tal fuerza...",
            "que su poder se fragmento...",
            "tres emociones escaparon...",
            "tomando forma propia...",
            "la ira se volvio furia pura...",
            "la tristeza, dolor sin fin...",
            "el miedo, terror congelante...",
            "el angel quedo vacio...",
            "sin sentir lo que una vez sintio...",
            "para volver al cielo...",
            "debe recuperar sus fragmentos...",
            "cada victoria le devuelve...",
            "un pedazo de su esencia...",
            "pero al final del camino...",
            "al borde del regreso...",
            "su poder reunido le espera...",
            "un ser nacido de sus fragmentos...",
            "la fusion de ira, tristeza y miedo...",
            "el ultimo guardian...",
            "la prueba final...",
            "solo venciendo lo que fue...",
            "podra volver a ser completo."
        ];

        // contar solo textos no vacios para las animaciones
        this.narrativeLines.forEach((line, index) => {
            if (line.trim() !== "") {
                this.totalTextsToComplete++;
            }
        });

        // crear textos con posicion inicial (fuera de pantalla abajo)
        const centerX = this.cameras.main.width / 2;
        const screenHeight = this.cameras.main.height;
        const lineHeight = 80; // distancia vertical entre textos
        
        // punto de entrada (fuera de pantalla abajo)
        const startY = screenHeight + 50;
        
        // punto de salida (fuera de pantalla arriba)
        const exitY = -150;

        // crear todos los textos en sus posiciones iniciales
        this.narrativeLines.forEach((line, index) => {
            // calcular posicion inicial escalonada
            const initialY = startY + (index * lineHeight);
            
            // calcular posicion final
            const finalY = exitY;

            // crear el objeto de texto
            const text = this.add.text(
                centerX,
                initialY,
                line,
                {
                    fontFamily: 'arial, sans-serif',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: this.cameras.main.width - 100, useAdvancedWrap: true }
                }
            ).setOrigin(0.5);

            // inicialmente transparente
            text.setAlpha(0);
            text.setDepth(index);

            // efecto de sombra sutil
            text.setStroke('#000000', 4);
            text.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 4);

            // guardar datos del texto para control
            this.texts.push({
                object: text,
                initialY: initialY,
                finalY: finalY,
                index: index,
                line: line,
                isActive: false,
                hasCompleted: false,
                animation: null
            });
        });

        // texto de instruccion (solo para esc)
        this.instructionText = this.add.text(
            centerX,
            screenHeight - 50,
            'presiona esc o click para saltar al juego',
            {
                fontFamily: 'arial, sans-serif',
                fontSize: '28px',
                color: '#888888',
                align: 'center'
            }
        ).setOrigin(0.5);

        // efecto de parpadeo en el texto de instruccion
        this.tweens.add({
            targets: this.instructionText,
            alpha: { from: 0.3, to: 1 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });

        // controles para saltar
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.input.on('pointerdown', () => this.skipAll(), this);

        // iniciar musica
        MusicManager.play(this, 'bg_Music', 0.05);

        // iniciar la narrativa despues de un breve delay
        this.time.delayedCall(500, () => {
            this.startNarrative();
        });
    }

    /**
     * programa el inicio escalonado de las animaciones de los textos
     */
    startNarrative() {
        // configurar velocidad de movimiento (mas lento para mejor lectura)
        const speedPixelsPerSecond = 80; // velocidad de scroll
        
        // tiempo entre el inicio de cada linea
        const fadeInTime = 1000;
        const delayBetweenStarts = 1500; // 1.5 segundos entre textos
        
        // calcular duracion de movimiento basada en distancia
        const screenHeight = this.cameras.main.height;
        const distance = screenHeight + 200; // desde abajo hasta salir arriba
        const movementDuration = (distance / speedPixelsPerSecond) * 1000; // duracion en milisegundos

        console.log(`movement duration: ${movementDuration}ms, delay between: ${delayBetweenStarts}ms`);

        // programar inicio escalonado de cada texto
        this.texts.forEach((textData, index) => {
            // saltar lineas vacias pero mantener el tiempo
            if (textData.line.trim() === "") {
                textData.hasCompleted = true;
                return;
            }

            // delay escalonado para cada texto
            this.time.delayedCall(index * delayBetweenStarts, () => {
                if (this.isComplete || this.isSkipping) return;
                
                this.startSingleTextAnimation(textData, fadeInTime, movementDuration);
            });
        });

        // timer de seguridad: asegura que la escena termina aunque fallen los eventos oncomplete
        const totalDuration = (this.texts.length * delayBetweenStarts) + movementDuration + 2000;
        this.safetyTimer = this.time.delayedCall(totalDuration, () => {
            if (!this.isComplete && !this.isSkipping) {
                console.log('safety timer triggered - completing narrative');
                this.completeNarrative();
            }
        });
    }

    /**
     * inicia la animacion de una unica linea de texto
     * @param {object} textData - objeto que contiene la referencia al texto
     * @param {number} fadeInTime - duracion del fade in
     * @param {number} movementDuration - duracion del movimiento
     */
    startSingleTextAnimation(textData, fadeInTime, movementDuration) {
        const text = textData.object;
        textData.isActive = true;
        
        console.log(`starting text ${textData.index}: "${textData.line}"`);
        
        // 1. fade in
        const fadeInTween = this.tweens.add({
            targets: text,
            alpha: 1,
            duration: fadeInTime,
            ease: 'Power2',
            onComplete: () => {
                // 2. iniciar movimiento hacia arriba despues del fade in
                this.startTextMovement(textData, movementDuration);
            }
        });
        
        textData.fadeInTween = fadeInTween;
    }

    /**
     * inicia el movimiento de scroll hacia arriba de una linea de texto
     * @param {object} textData - objeto que contiene la referencia al texto
     * @param {number} movementDuration - duracion del movimiento
     */
    startTextMovement(textData, movementDuration) {
        const text = textData.object;
        
        // animacion de movimiento hacia arriba
        const movementTween = this.tweens.add({
            targets: text,
            y: textData.finalY, // posicion de salida
            duration: movementDuration,
            ease: 'Linear',
            onUpdate: () => {
                // control de opacidad basado en la posicion y para crear el efecto de fade in/out
                const currentY = text.y;
                const screenHeight = this.cameras.main.height;
                
                // zona de maxima legibilidad (centro de la pantalla)
                const visibleZoneStart = screenHeight * 0.3;
                const visibleZoneEnd = screenHeight * 0.7;
                
                let opacity = 0;
                
                if (currentY >= visibleZoneStart && currentY <= visibleZoneEnd) {
                    // en la zona central: opacidad maxima
                    opacity = 1;
                } else if (currentY > visibleZoneEnd) {
                    // abajo de la zona: fade in (aumenta opacidad al subir)
                    opacity = 1 - ((currentY - visibleZoneEnd) / (textData.initialY - visibleZoneEnd));
                } else {
                    // arriba de la zona: fade out (disminuye opacidad al subir)
                    opacity = (currentY - textData.finalY) / (visibleZoneStart - textData.finalY);
                }
                
                // limitar opacidad (asegurar que no sea negativo ni mayor a 1)
                opacity = Math.max(0.1, Math.min(1, opacity));
                text.setAlpha(opacity);
            },
            onComplete: () => {
                // animacion completada
                textData.hasCompleted = true;
                textData.isActive = false;
                this.completedAnimations++;
                
                // destruir el texto una vez que sale de pantalla
                text.destroy();
                
                console.log(`text ${textData.index} completed. total: ${this.completedAnimations}/${this.totalTextsToComplete}`);
                
                // verificar si todos los textos han terminado
                if (this.completedAnimations >= this.totalTextsToComplete) {
                    console.log('todos los textos completados');
                    this.time.delayedCall(500, () => {
                        this.completeNarrative();
                    });
                }
            }
        });
        
        textData.movementTween = movementTween;
        textData.animation = movementTween;
    }

    /**
     * salta toda la narrativa y pasa directamente a la escena de carga
     */
    skipAll() {
        // evitar multiples llamadas
        if (this.isSkipping || this.isComplete) return;
        
        this.isSkipping = true;
        console.log('narrative skipped by user');
        
        // detener timer de seguridad
        if (this.safetyTimer) {
            this.safetyTimer.remove();
        }
        
        // detener todas las animaciones de la escena
        this.tweens.killAll();
        
        // destruir todos los textos activos
        this.texts.forEach(textData => {
            if (textData.object && textData.object.active) {
                textData.object.destroy();
            }
        });
        
        // destruir el texto de instruccion
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        
        // ir directamente a loading
        this.proceedToLoading();
    }

    /**
     * marca la narrativa como completada (al llegar al final de las animaciones)
     */
    completeNarrative() {
        if (this.isComplete || this.isChangingScene) return;
        
        this.isComplete = true;
        console.log('narrative completed automatically');
        
        // cancelar timer de seguridad
        if (this.safetyTimer) {
            this.safetyTimer.remove();
        }
        
        // destruir el texto de instruccion
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        
        // pequena pausa antes de la transicion
        this.time.delayedCall(500, () => {
            this.proceedToLoading();
        });
    }

    /**
     * inicia la transicion a la escena de carga
     */
    proceedToLoading() {
        if (this.isChangingScene) return;
        
        this.isChangingScene = true;
        
        console.log('transitioning to loading scene...');
        
        // efecto de desvanecimiento
        this.cameras.main.fadeOut(600, 0, 0, 0);
        
        // cambiar a la escena de carga despues del fade out
        this.time.delayedCall(600, () => {
            this.scene.start('Loading');
        });
    }

    /**
     * hook de phaser para la actualizacion logica
     */
    update() {
        // verificar tecla esc para saltar todo
        if (Phaser.Input.Keyboard.JustDown(this.escKey) && !this.isComplete && !this.isSkipping) {
            this.skipAll();
        }
    }
}

export { NarrativeScene };
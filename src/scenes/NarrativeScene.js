import MusicManager from '../managers/MusicManager.js';

class NarrativeScene extends Phaser.Scene {
    constructor() {
        super('Narrative');
    }

    create() {
        // Configurar fondo negro completo
        this.cameras.main.setBackgroundColor('#000000');

        // Variable para controlar el estado de la narrativa
        this.narrativeIndex = 0;
        this.texts = [];
        this.isComplete = false;
        this.completedAnimations = 0;
        this.totalTextsToComplete = 0;
        this.isSkipping = false;
        this.isChangingScene = false;
        this.allAnimationsStarted = false;

        // Configurar los textos narrativos
        this.narrativeLines = [
            "Un accidente celestial...",
            "El ángel cayó al Infierno...",
            "Impactó con tal fuerza...",
            "que su poder se fragmentó...",
            "Tres emociones escaparon...",
            "Tomando forma propia...",
            "La IRA se volvió furia pura...",
            "La TRISTEZA, dolor sin fin...",
            "El MIEDO, terror congelante...",
            "El ángel quedó vacío...",
            "Sin sentir lo que una vez sintió...",
            "Para volver al Cielo...",
            "debe recuperar sus fragmentos...",
            "Cada victoria le devuelve...",
            "un pedazo de su esencia...",
            "Pero al final del camino...",
            "al borde del regreso...",
            "Su poder reunido le espera...",
            "Un ser nacido de sus fragmentos...",
            "La fusión de IRA, TRISTEZA y MIEDO...",
            "El último guardián...",
            "La prueba final...",
            "Solo venciendo lo que fue...",
            "podrá volver a ser completo."
        ];

        // Contar solo textos no vacíos para las animaciones
        this.narrativeLines.forEach((line, index) => {
            if (line.trim() !== "") {
                this.totalTextsToComplete++;
            }
        });

        // Crear textos con posición inicial (fuera de pantalla abajo)
        const centerX = this.cameras.main.width / 2;
        const screenHeight = this.cameras.main.height;
        const lineHeight = 80; // REDUCIDO: Distancia vertical entre textos
        
        // Punto de entrada (fuera de pantalla abajo)
        const startY = screenHeight + 50;
        
        // Punto de salida (fuera de pantalla arriba)
        const exitY = -150;

        // Crear todos los textos en sus posiciones iniciales
        this.narrativeLines.forEach((line, index) => {
            // Calcular posición inicial escalonada (menor separación)
            const initialY = startY + (index * lineHeight);
            
            // Calcular posición final
            const finalY = exitY;

            const text = this.add.text(
                centerX,
                initialY,
                line,
                {
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '40px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    align: 'center',
                    wordWrap: { width: this.cameras.main.width - 100, useAdvancedWrap: true }
                }
            ).setOrigin(0.5);

            // Inicialmente transparente
            text.setAlpha(0);
            text.setDepth(index);

            // Efecto de sombra sutil
            text.setStroke('#000000', 4);
            text.setShadow(2, 2, 'rgba(0, 0, 0, 0.5)', 4);

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

        // Texto de instrucción (solo para ESC)
        this.instructionText = this.add.text(
            centerX,
            screenHeight - 50,
            'Presiona ESC o Click para saltar al juego',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '28px',
                color: '#888888',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Efecto de parpadeo en el texto de instrucción
        this.tweens.add({
            targets: this.instructionText,
            alpha: { from: 0.3, to: 1 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });

        // Controles
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.input.on('pointerdown', () => this.skipAll(), this);

        // Iniciar música
        MusicManager.play(this, 'bg_Music', 0.05);

        // Iniciar la narrativa después de un breve delay
        this.time.delayedCall(500, () => {
            this.startNarrative();
        });
    }

    startNarrative() {
        // Configurar velocidad de movimiento (más lento para mejor lectura)
        const speedPixelsPerSecond = 80; // REDUCIDO: Más lento para mejor lectura
        
        // REDUCIDO: Menos tiempo entre textos
        const fadeInTime = 1000; // Más rápido
        const delayBetweenStarts = 1500; // REDUCIDO: Solo 1.5 segundos entre textos
        
        // Calcular duración de movimiento basada en distancia
        const screenHeight = this.cameras.main.height;
        const distance = screenHeight + 200; // Desde abajo hasta salir arriba
        const movementDuration = (distance / speedPixelsPerSecond) * 1000;

        console.log(`Movement duration: ${movementDuration}ms, Delay between: ${delayBetweenStarts}ms`);

        // Programar inicio escalonado de cada texto
        this.texts.forEach((textData, index) => {
            // Saltar líneas vacías pero mantener el tiempo
            if (textData.line.trim() === "") {
                textData.hasCompleted = true;
                return;
            }

            // Delay escalonado REDUCIDO para cada texto
            this.time.delayedCall(index * delayBetweenStarts, () => {
                if (this.isComplete || this.isSkipping) return;
                
                this.startSingleTextAnimation(textData, fadeInTime, movementDuration);
            });
        });

        // Timer de seguridad ajustado
        const totalDuration = (this.texts.length * delayBetweenStarts) + movementDuration + 2000;
        this.safetyTimer = this.time.delayedCall(totalDuration, () => {
            if (!this.isComplete && !this.isSkipping) {
                console.log('Safety timer triggered - completing narrative');
                this.completeNarrative();
            }
        });
    }

    startSingleTextAnimation(textData, fadeInTime, movementDuration) {
        const text = textData.object;
        textData.isActive = true;
        
        console.log(`Starting text ${textData.index}: "${textData.line}"`);
        
        // 1. Fade In más rápido
        const fadeInTween = this.tweens.add({
            targets: text,
            alpha: 1,
            duration: fadeInTime,
            ease: 'Power2',
            onComplete: () => {
                // 2. Iniciar movimiento hacia arriba
                this.startTextMovement(textData, movementDuration);
            }
        });
        
        textData.fadeInTween = fadeInTween;
    }

    startTextMovement(textData, movementDuration) {
        const text = textData.object;
        
        // Animación de movimiento hacia arriba
        const movementTween = this.tweens.add({
            targets: text,
            y: textData.finalY,
            duration: movementDuration,
            ease: 'Linear',
            onUpdate: () => {
                // Control de opacidad para mejor legibilidad
                const currentY = text.y;
                const screenHeight = this.cameras.main.height;
                
                // Zona de máxima legibilidad (centro de la pantalla)
                const visibleZoneStart = screenHeight * 0.3;
                const visibleZoneEnd = screenHeight * 0.7;
                
                let opacity = 0;
                
                if (currentY >= visibleZoneStart && currentY <= visibleZoneEnd) {
                    // En la zona central: opacidad máxima
                    opacity = 1;
                } else if (currentY < visibleZoneStart) {
                    // Abajo de la zona: fade in
                    opacity = (currentY - (visibleZoneStart - 200)) / 200;
                } else {
                    // Arriba de la zona: fade out
                    opacity = ((visibleZoneEnd + 200) - currentY) / 200;
                }
                
                // Limitar opacidad
                opacity = Math.max(0.1, Math.min(1, opacity));
                text.setAlpha(opacity);
            },
            onComplete: () => {
                // Animación completada
                textData.hasCompleted = true;
                textData.isActive = false;
                this.completedAnimations++;
                
                // Destruir el texto
                text.destroy();
                
                console.log(`Text ${textData.index} completed. Total: ${this.completedAnimations}/${this.totalTextsToComplete}`);
                
                // Verificar si todos los textos han terminado
                if (this.completedAnimations >= this.totalTextsToComplete) {
                    console.log('Todos los textos completados');
                    this.time.delayedCall(500, () => {
                        this.completeNarrative();
                    });
                }
            }
        });
        
        textData.movementTween = movementTween;
        textData.animation = movementTween;
    }

    skipAll() {
        // Evitar múltiples llamadas
        if (this.isSkipping || this.isComplete) return;
        
        this.isSkipping = true;
        console.log('Narrative skipped by user');
        
        // Detener timer de seguridad
        if (this.safetyTimer) {
            this.safetyTimer.remove();
        }
        
        // Detener todas las animaciones
        this.tweens.killAll();
        
        // Destruir todos los textos
        this.texts.forEach(textData => {
            if (textData.object && textData.object.active) {
                textData.object.destroy();
            }
        });
        
        // Destruir el texto de instrucción
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        
        // Ir directamente a Loading
        this.proceedToLoading();
    }

    completeNarrative() {
        if (this.isComplete || this.isChangingScene) return;
        
        this.isComplete = true;
        console.log('Narrative completed automatically');
        
        // Cancelar timer de seguridad
        if (this.safetyTimer) {
            this.safetyTimer.remove();
        }
        
        // Destruir el texto de instrucción
        if (this.instructionText) {
            this.instructionText.destroy();
        }
        
        // Pequeña pausa antes de la transición
        this.time.delayedCall(500, () => {
            this.proceedToLoading();
        });
    }

    proceedToLoading() {
        if (this.isChangingScene) return;
        
        this.isChangingScene = true;
        
        console.log('Transitioning to Loading scene...');
        
        // Efecto de desvanecimiento
        this.cameras.main.fadeOut(600, 0, 0, 0);
        
        // Detener música
        MusicManager.stop(this);
        
        // Cambiar a la escena de carga
        this.time.delayedCall(600, () => {
            this.scene.start('Loading');
        });
    }

    update() {
        // Verificar tecla ESC para saltar todo
        if (Phaser.Input.Keyboard.JustDown(this.escKey) && !this.isComplete && !this.isSkipping) {
            this.skipAll();
        }
    }
}

export { NarrativeScene };
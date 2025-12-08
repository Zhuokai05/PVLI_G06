export default class TutorialPanel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, tutorialText) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.tutorialText = tutorialText;
        this.isActive = false;
        this.playerInRange = false;
        
        // Panel de texto
        this.textPanel = null;
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.setImmovable(true);
        
        // Aumentar MUCHO el tamaño del cuerpo de colisión (200x200 píxeles)
        const collisionSize = 200; // Tamaño del área de detección
        this.body.setSize(collisionSize, collisionSize);
        this.body.setOffset(-collisionSize/2, -collisionSize/2); // Centrar el collider
        
        // Desactivar la visibilidad del sprite si es solo un trigger invisible
        this.setAlpha(0);
        this.setVisible(false); // También hacerlo invisible
        
        // Crear el panel de texto (inicialmente invisible)
        this.createTextPanel();
    }

    createTextPanel() {
        // Aumentar el tamaño del panel
        const panelWidth = 450; // Antes: 400
        const panelHeight = 130; // Antes: 100
        
        // Crear un panel gráfico como fondo con borde más grueso
        this.textPanel = this.scene.add.graphics();
        this.textPanel.fillStyle(0x000000, 0.85); // Un poco más opaco
        this.textPanel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15); // Bordes más redondeados
        this.textPanel.lineStyle(3, 0xffffff, 1); // Borde más grueso
        this.textPanel.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
        
        // Crear el texto con fuente más grande
        this.textObject = this.scene.add.text(0, 0, this.tutorialText, {
            font: '20px Arial', // Antes: 16px
            fill: '#ffffff',
            align: 'center',
            wordWrap: { 
                width: panelWidth - 40, // Más margen
                useAdvancedWrap: true 
            },
            lineSpacing: 6 // Espaciado entre líneas
        }).setOrigin(0.5);
        
        // Crear un contenedor para el panel y texto
        // Colocarlo más alto para que no interfiera con el jugador
        this.panelContainer = this.scene.add.container(this.x, this.y - 120); // Antes: y - 80
        this.panelContainer.add([this.textPanel, this.textObject]);
        this.panelContainer.setDepth(1000); // Mayor depth para estar por encima de todo
        this.panelContainer.setVisible(false);
        
        // Añadir animación de fade in/out
        this.panelContainer.setAlpha(0);
        
        // Añadir sombra al texto para mejor legibilidad
        this.textObject.setShadow(2, 2, 'rgba(0,0,0,0.8)', 3);
    }

    showTutorial() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.panelContainer.setVisible(true);
        
        // Animación de aparición más pronunciada
        this.scene.tweens.add({
            targets: this.panelContainer,
            alpha: 1,
            y: this.y - 140, // Antes: y - 100
            duration: 400, // Un poco más lento
            ease: 'Back.out' // Animación más "elástica"
        });
    }

    hideTutorial() {
        if (!this.isActive) return;
        
        // Animación de desaparición
        this.scene.tweens.add({
            targets: this.panelContainer,
            alpha: 0,
            y: this.y - 120, // Antes: y - 80
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.panelContainer.setVisible(false);
                this.isActive = false;
            }
        });
    }

    update(player) {
        // Verificar si el jugador está en el rango usando el collider
        if (player) {
            // Usar overlap en lugar de distancia para mejor precisión
            const isOverlapping = this.scene.physics.overlap(this, player);
            
            if (isOverlapping && !this.playerInRange) {
                this.playerInRange = true;
                this.showTutorial();
            } else if (!isOverlapping && this.playerInRange) {
                this.playerInRange = false;
                this.hideTutorial();
            }
        }
    }

    // Método alternativo más preciso usando overlap
    checkOverlap(player) {
        if (!player) return false;
        
        // Calcular overlap manualmente
        const bounds1 = this.getBounds();
        const bounds2 = player.getBounds();
        
        return Phaser.Geom.Rectangle.Overlaps(bounds1, bounds2);
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        
        // Actualizar posición del panel si existe
        if (this.panelContainer) {
            this.panelContainer.setPosition(x, y - 120);
        }
    }

    destroy() {
        // Limpiar el contenedor y objetos gráficos
        if (this.panelContainer) {
            this.panelContainer.destroy();
        }
        
        super.destroy();
    }
}
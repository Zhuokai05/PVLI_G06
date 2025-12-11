import Door from '../objects/Doors.js';

export default class DoorBoss extends Door {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.contrary = null;
        this.isOpening = false;
        this.setScale(4);
        this.body.setSize(this.width * 0.25, this.height * 0.9);
        this.body.setOffset(
            (this.width - this.body.width) / 2,
            this.height - this.body.height
        );

        // Sonidos
        this.tpSound = this.scene.sound.add('Teleport_sound', {
            volume: 0.3,
            loop: false
        });

        // Filtro temporal
        this.isAnimatedDoor = (texture === 'puertairaSheet');

        // Configuración específica para puertas animadas
        if (this.isAnimatedDoor) {

            this.animIdleKey = texture + '_idle';
            this.animOpenKey = texture + '_open';

            this.createAnimations(texture);

            // Intentar reproducir idle
            if (this.scene.anims.exists(this.animIdleKey)) {
                this.play(this.animIdleKey);
            }
        }
        else {
            // CONFIGURACIÓN PARA PUERTAS NORMALES
        }

        this.prompt = this.scene.add.text(this.x, this.y + (this.displayHeight/2) + 50, 'Presiona E para interactuar', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 0, y: 4 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

    }

    createAnimations(textureKey) {
        // Solo creamos animaciones si estamos en modo animado
        if (!this.isAnimatedDoor) return;

        if (!this.scene.anims.exists(this.animIdleKey)) {
            // IDLE
            this.scene.anims.create({
                key: this.animIdleKey,
                frames: this.scene.anims.generateFrameNumbers(textureKey, { start: 0, end: 5 }),
                frameRate: 6,
                repeat: -1
            });

            // OPEN
            this.scene.anims.create({
                key: this.animOpenKey,
                frames: this.scene.anims.generateFrameNumbers(textureKey, { start: 6, end: 23 }),
                frameRate: 12,
                repeat: 0
            });
        }
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setContrary(contraryDoor) {
        this.contrary = contraryDoor;
    }

    // Abrir la puerta y teletransportar al jugador
    openDoor() {
        if (!this.contrary) return;
        if (this.isOpening) return;

        this.prompt.setVisible(false);
        this.isOpening = true;
        this.tpSound?.play();

        if (this.scene.player) {
            this.scene.player.canMove = false;
            this.scene.player.setVelocity(0, 0);
            this.scene.player.play('Player_idle', true);
        }

        // Lógica de animación
        if (this.isAnimatedDoor && this.scene.anims.exists(this.animOpenKey)) {
            console.log("Abriendo puerta animada...");
            this.play(this.animOpenKey);

            this.once('animationcomplete', (animation) => {
                if (animation.key === this.animOpenKey) {
                    this.doTeleport();
                }
            });
        } else {
            // Si es puerta normal, teletransportamos directamente
            this.scene.player.canMove = false;
            this.doTeleport();
        }
    }

    doTeleport() {
        const destino = this.contrary.getPosition();
        const player = this.scene.player;

        if (player) {
            player.setPosition(destino.x, destino.y + 210);
            player.canMove = true;

            // Solo reseteamos animación si es la puerta animada
            if (this.isAnimatedDoor && this.scene.anims.exists(this.animIdleKey)) {
                this.play(this.animIdleKey);
            }

            this.isOpening = false;
            console.log("Teletransporte completado.");
        }
    }
}
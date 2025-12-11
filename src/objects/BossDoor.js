import Door from '../objects/Doors.js';

/**
 * clase doorboss
 * representa la puerta del jefe con logica de teletransporte
 */
export default class DoorBoss extends Door {

    /**
     * constructor de la puerta
     * @param {object} scene - escena actual
     * @param {number} x - posicion x
     * @param {number} y - posicion y
     * @param {string} texture - clave de textura
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.contrary = null;
        this.isOpening = false;
        this.setScale(4);

        // fisicas
        this.body.setSize(this.width * 0.25, this.height * 0.05);
        this.body.setOffset(
            (this.width - this.body.width) / 2,
            this.height - this.body.height
        );

        // sonidos
        this.tpSound = this.scene.sound.add('Teleport_sound', {
            volume: 0.6,
            loop: false
        });

        // filtro temporal para saber si es animada
        if (texture === 'puertairaSheet' || texture === 'puertatristezaSheet') {
            this.isAnimatedDoor = true;
        }

        // configuracion especifica para puertas animadas
        if (this.isAnimatedDoor) {

            this.animIdleKey = texture + '_idle';
            this.animOpenKey = texture + '_open';

            this.createAnimations(texture);

            // intentar reproducir idle
            if (this.scene.anims.exists(this.animIdleKey)) {
                this.play(this.animIdleKey);
            }
        }
        else {
            // configuracion para puertas normales
        }

        // texto de interaccion
        this.prompt = this.scene.add.text(this.x, this.y + (this.displayHeight / 2) + 50, 'Presiona E para interactuar', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 0, y: 4 }
        }).setOrigin(0.5).setDepth(10).setVisible(false);

    }

    /**
     * crea animaciones si la puerta es animada
     * @param {string} textureKey - clave de la textura
     */
    createAnimations(textureKey) {
        if (!this.isAnimatedDoor) return;

        // Evitar recrear animaciones si ya existen globalmente
        if (this.scene.anims.exists(this.animIdleKey)) return;

        // --- CONFIGURACIÓN DE FRAMES ---
        // Definimos valores por defecto (por si acaso)
        let idleConfig = { start: 0, end: 0 };
        let openConfig = { start: 0, end: 0 };

        // Puerta de Ira
        if (textureKey === 'puertairaSheet') {
            idleConfig = { start: 0, end: 5 };
            openConfig = { start: 6, end: 23 };
        }
        // Puerta de Tristeza
        else if (textureKey === 'puertatristezaSheet') {
            idleConfig = { start: 0, end: 6 };
            openConfig = { start: 7, end: 30 };
        }

        // Creacion de las animaciones

        // Animacion Idle
        this.scene.anims.create({
            key: this.animIdleKey,
            frames: this.scene.anims.generateFrameNumbers(textureKey, idleConfig),
            frameRate: 6,
            repeat: -1
        });

        // Animacion Open
        this.scene.anims.create({
            key: this.animOpenKey,
            frames: this.scene.anims.generateFrameNumbers(textureKey, openConfig),
            frameRate: 12,
            repeat: 0
        });
    }

    /**
     * obtiene la posicion actual
     * @returns {object} coordenadas x e y
     */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    /**
     * vincula la puerta de destino
     * @param {object} contraryDoor - puerta contraria
     */
    setContrary(contraryDoor) {
        this.contrary = contraryDoor;
    }

    /**
     * abrir la puerta y teletransportar al jugador
     */
    openDoor() {
        if (!this.contrary) return;
        if (this.isOpening) return;

        this.prompt.setVisible(false);
        this.isOpening = true;
        this.tpSound?.play();

        // detener jugador
        if (this.scene.player) {
            this.scene.player.canMove = false;
            this.scene.player.setVelocity(0, 0);
            this.scene.player.play('Player_idle', true);
        }

        // logica de animacion
        if (this.isAnimatedDoor && this.scene.anims.exists(this.animOpenKey)) {
            console.log("Abriendo puerta animada...");
            this.play(this.animOpenKey);

            this.once('animationcomplete', (animation) => {
                if (animation.key === this.animOpenKey) {
                    this.FadeOutTP();
                }
            });
        } else {
            // si es puerta normal, teletransportamos directamente
            this.scene.player.canMove = false;
            this.FadeOutTP();
        }
    }

    FadeOutTP() {
        this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
        this.scene.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.time.delayedCall(1000, () => {
                this.doTeleport();
            });
        });
    }

    /**
     * ejecuta el teletransporte fisico del jugador
     */
    doTeleport() {
        const destino = this.contrary.getPosition();
        const player = this.scene.player;

        if (player) {
            // Mover jugador al destino mas un offset en y
            player.setPosition(destino.x, destino.y + 210);
            this.scene.cameras.main.fadeIn(1000, 0, 0, 0);


            this.scene.cameras.main.once('camerafadeincomplete', () => {
                player.canMove = true;
            });

            // Reset animacion
            if (this.isAnimatedDoor && this.scene.anims.exists(this.animIdleKey)) {
                this.play(this.animIdleKey);
            }

            this.isOpening = false;
            console.log("Teletransporte completado.");
        }
    }
}
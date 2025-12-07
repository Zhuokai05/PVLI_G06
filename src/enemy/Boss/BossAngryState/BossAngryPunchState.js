import BaseState from '../../../stateMachine/BaseState.js';

export default class BossAngryPunchState extends BaseState {
    constructor(texture = 'punch') {
        super(); 
        this.texture = texture;
    }
    enter(context) {
        this.boss = context;
        this.stateTime = 0;
        this.currentPhase = 'warning'; // warning -> attack -> cooldown
        this.warningDuration = 2000;
        this.attackDuration = 500;
        this.cooldownDuration = 500;

        this.fixedSpawnY = this.boss.y + this.boss.distanceToFloor;

        // Iniciar fase de advertencia
        this.startWarningPhase();

        console.log("puño horizontal");
    }

    startWarningPhase() {
        const { scene } = this.boss;
        const player = this.boss.player;
        const cam = scene.cameras.main;

        // Solo ataques laterales
        this.attackDirection = Phaser.Math.Between(0, 1) === 0 ? 'left' : 'right';

        // Rectangulo horizontal de advertencia MEJORADO
        const warningHeight = 120;
        this.spawnY = this.fixedSpawnY;
        this.spawnX = this.attackDirection === 'left' ? this.boss.x - cam.width / 2 : this.boss.x + cam.width / 2;

        // WARNING RECTANGLE MEJORADO
        this.warningRect = scene.add.rectangle(
            this.boss.x,
            this.spawnY,
            cam.width + 150,
            warningHeight,
            0xff0000,
            0.3  // Más transparente
        );

        // BORDE DE ADVERTENCIA
        this.warningBorder = scene.add.graphics();
        this.warningBorder.lineStyle(4, 0xff4444, 0.8);
        this.warningBorder.strokeRect(
            this.boss.x - (cam.width + 150) / 2,
            this.spawnY - warningHeight / 2,
            cam.width + 150,
            warningHeight
        );

        // FLECHAS DIRECCIONALES
        this.createDirectionArrows();

        // EFECTO DE PULSO
        scene.tweens.add({
            targets: [this.warningRect, this.warningBorder],
            alpha: { from: 0.5, to: 0.8 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        // TEXTO DE ADVERTENCIA
        this.warningText = scene.add.text(
            this.boss.x,
            this.spawnY - warningHeight / 2 - 20,
            '¡PUÑO INMINENTE!',
            {
                fontSize: '24px',
                fill: '#ff4444',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // EFECTO DE TEXTO PARPADEANTE
        scene.tweens.add({
            targets: this.warningText,
            alpha: { from: 0.3, to: 1 },
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }

    createDirectionArrows() {
        const { scene } = this.boss;
        const cam = scene.cameras.main;
        const warningHeight = 120;
        const arrowSize = 40;
        const arrowSpacing = 80;

        // Crear múltiples flechas según la dirección
        const numArrows = 5;
        this.arrows = [];

        for (let i = 0; i < numArrows; i++) {
            let arrowX, arrowY;
            let arrowRotation = 0;

            if (this.attackDirection === 'left') {
                // Flechas apuntando a la derecha (←)
                arrowX = this.boss.x + (cam.width / 2) - (i * arrowSpacing) - 100;
                arrowY = this.spawnY;
                arrowRotation = Math.PI; // 180 grados
            } else {
                // Flechas apuntando a la izquierda (→)
                arrowX = this.boss.x - (cam.width / 2) + (i * arrowSpacing) + 100;
                arrowY = this.spawnY;
                arrowRotation = 0; // 0 grados
            }

            // Crear flecha como polígono
            const arrow = scene.add.graphics();
            arrow.fillStyle(0xff4444, 0.8);

            // Dibujar triángulo (flecha)
            arrow.beginPath();
            arrow.moveTo(arrowX, arrowY);

            if (this.attackDirection === 'left') {
                // Flecha apuntando a la derecha
                arrow.lineTo(arrowX - arrowSize, arrowY - arrowSize / 2);
                arrow.lineTo(arrowX - arrowSize, arrowY + arrowSize / 2);
            } else {
                // Flecha apuntando a la izquierda
                arrow.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
                arrow.lineTo(arrowX + arrowSize, arrowY + arrowSize / 2);
            }

            arrow.closePath();
            arrow.fillPath();

            // Efecto de movimiento en las flechas
            scene.tweens.add({
                targets: arrow,
                x: this.attackDirection === 'left' ? arrowX - 20 : arrowX + 20,
                duration: 300,
                yoyo: true,
                repeat: -1,
                delay: i * 50
            });

            this.arrows.push(arrow);
        }

        // FLECHA GRANDE CENTRAL
        const bigArrow = scene.add.graphics();
        bigArrow.fillStyle(0xff0000, 0.9);
        bigArrow.lineStyle(3, 0xffffff, 1);

        const bigArrowSize = 60;
        const bigArrowX = this.attackDirection === 'left' ?
            this.boss.x + (cam.width / 2) - 50 :
            this.boss.x - (cam.width / 2) + 50;
        const bigArrowY = this.spawnY;

        bigArrow.beginPath();
        bigArrow.moveTo(bigArrowX, bigArrowY);

        if (this.attackDirection === 'left') {
            // Flecha grande apuntando a la derecha
            bigArrow.lineTo(bigArrowX - bigArrowSize, bigArrowY - bigArrowSize / 1.5);
            bigArrow.lineTo(bigArrowX - bigArrowSize, bigArrowY + bigArrowSize / 1.5);
        } else {
            // Flecha grande apuntando a la izquierda
            bigArrow.lineTo(bigArrowX + bigArrowSize, bigArrowY - bigArrowSize / 1.5);
            bigArrow.lineTo(bigArrowX + bigArrowSize, bigArrowY + bigArrowSize / 1.5);
        }

        bigArrow.closePath();
        bigArrow.fillPath();
        bigArrow.strokePath();

        this.arrows.push(bigArrow);

        // EFECTO DE ESCALA EN FLECHA GRANDE
        scene.tweens.add({
            targets: bigArrow,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.6, to: 1 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'warning':
                if (this.stateTime >= this.warningDuration) {
                    this.startAttackPhase();
                }
                break;

            case 'attack':
                if (this.stateTime >= this.attackDuration) {
                    this.startCooldownPhase();
                }
                break;

            case 'cooldown':
                if (this.stateTime >= this.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startAttackPhase() {
        this.currentPhase = 'attack';
        this.stateTime = 0;

        // Destruir todas las advertencias
        this.destroyAllWarnings();

        // Crear puño
        this.spawnPunch();
    }

    destroyAllWarnings() {
        // Destruir rectángulo de advertencia
        if (this.warningRect) {
            this.warningRect.destroy();
            this.warningRect = null;
        }

        // Destruir borde
        if (this.warningBorder) {
            this.warningBorder.destroy();
            this.warningBorder = null;
        }

        // Destruir texto
        if (this.warningText) {
            this.warningText.destroy();
            this.warningText = null;
        }

        // Destruir todas las flechas
        if (this.arrows) {
            this.arrows.forEach(arrow => {
                if (arrow) {
                    arrow.destroy();
                }
            });
            this.arrows = null;
        }
    }

    spawnPunch() {
        const { scene, punches } = this.boss;
        const Xspeed = this.boss.punchXSpeed;
        const cam = scene.cameras.main;
        let punch;

        if (this.attackDirection === 'left') {
            punch = punches.create(this.boss.x - cam.width / 2, this.fixedSpawnY, this.texture);
            punch.setVelocityX(Xspeed);
            punch.setAngle(-90);
        } else {
            punch = punches.create(this.boss.x + cam.width / 2, this.fixedSpawnY,this.texture );
            punch.setVelocityX(-Xspeed);
            punch.setAngle(90);
        }

        punch.setScale(2.5);
        punch.body.allowGravity = false;
       // punch.setTint(0x6b6bff);

        // Asegurar que los puños laterales NO sean platformPunch
        punch.isPlatformPunch = false;

        // EFECTO DE APARICIÓN DEL PUÑO
        punch.setAlpha(0);
        scene.tweens.add({
            targets: punch,
            alpha: 1,
            scale: 2.5,
            duration: 100,
            ease: 'Power2'
        });

        // Destruccion cuando sale de camara
        this.cleanupPunch(punch);
    }

    cleanupPunch(punch) {
        const scene = this.boss.scene;
        scene.events.on('update', () => {
            if (!punch.active) return;
            const cam = scene.cameras.main;
            if (punch.x < this.boss.x - 200 - cam.width / 2 ||
                punch.x > this.boss.x + 200 + cam.width / 2 ||
                punch.y > this.boss.y + 600) {
                punch.destroy();
            }
        });
    }

    startCooldownPhase() {
        this.currentPhase = 'cooldown';
        this.stateTime = 0;
    }

    exit(context) {
        // Asegurar que se limpien los warnings al salir del estado
        this.destroyAllWarnings();
    }
}
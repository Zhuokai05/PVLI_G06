import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

/**
 * Estado de ataque de puño horizontal para el jefe Ira
 * @class BossAngryPunchState
 * @extends BaseBossAttackState
 */
export default class BossAngryPunchState extends BaseBossAttackState {
    constructor(texture = 'punch') {
        super({
            texture: texture,
            attackName: 'Puño Horizontal',
            phases: ['warning', 'attack', 'cooldown'],
            warningDuration: 2000,
            attackDuration: 500,
            cooldownDuration: 500
        });
        
        this.fixedSpawnY = 0;
        this.attackDirection = '';
        this.spawnY = 0;
        this.spawnX = 0;
        this.arrows = [];
    }
    
    /**
     * Entra al estado de puño horizontal
     * @param {Object} context - Contexto del boss
     */
    enter(context) {
        // Calcular posición Y fija antes de llamar al padre
        this.fixedSpawnY = context.y + context.distanceToFloor;
        super.enter(context);
    }
    
    /**
     * Crea las advertencias visuales para el puño horizontal
     */
    createWarning() {
        const cam = this.scene.cameras.main;
        // Solo ataques laterales
        this.attackDirection = Phaser.Math.Between(0, 1) === 0 ? 'left' : 'right';
        
        // Rectangulo horizontal de advertencia
        const warningHeight = 120;
        this.spawnY = this.fixedSpawnY;
        this.spawnX = this.attackDirection === 'left' ? 
            this.boss.x - cam.width / 2 : 
            this.boss.x + cam.width / 2;
        
        // Crear elementos de advertencia usando métodos de utilidad
        const warningRect = this.createWarningRectangle(
            this.boss.x,
            this.spawnY,
            cam.width + 150,
            warningHeight,
            0xff0000,
            0.3
        );
        
        const warningBorder = this.createWarningBorder(
            this.boss.x,
            this.spawnY,
            cam.width + 150,
            warningHeight,
            { width: 4, color: 0xff4444, alpha: 0.8 }
        );
        
        // Crear flechas direccionales
        this.createDirectionArrows();
        
        // Efecto de pulso
        this.createPulseEffect([warningRect, warningBorder], 300, 0.5, 0.8);
        
        // Texto de advertencia
        const warningText = this.createFloatingText(
            this.boss.x,
            this.spawnY - warningHeight / 2 - 20,
            '¡PUÑO INMINENTE!',
            { fill: '#ff4444' }
        );
        
        // Efecto de texto parpadeante
        this.createPulseEffect(warningText, 200, 0.3, 1);
    }
    
    /**
     * Crea flechas direccionales para indicar la dirección del ataque
     */
    createDirectionArrows() {
        const cam = this.scene.cameras.main;
        const warningHeight = 120;
        const arrowSize = 40;
        const arrowSpacing = 80;
        const numArrows = 5;
        
        this.arrows = [];
        
        for (let i = 0; i < numArrows; i++) {
            let arrowX, arrowY;
            
            if (this.attackDirection === 'left') {
                // Flechas apuntando a la derecha (←)
                arrowX = this.boss.x + (cam.width / 2) - (i * arrowSpacing) - 100;
                arrowY = this.spawnY;
            } else {
                // Flechas apuntando a la izquierda (→)
                arrowX = this.boss.x - (cam.width / 2) + (i * arrowSpacing) + 100;
                arrowY = this.spawnY;
            }
            
            // Crear flecha como polígono
            const arrow = this.scene.add.graphics();
            arrow.fillStyle(0xff4444, 0.8);
            
            // Dibujar triángulo (flecha)
            arrow.beginPath();
            arrow.moveTo(arrowX, arrowY);
            
            if (this.attackDirection === 'left') {
                arrow.lineTo(arrowX - arrowSize, arrowY - arrowSize / 2);
                arrow.lineTo(arrowX - arrowSize, arrowY + arrowSize / 2);
            } else {
                arrow.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
                arrow.lineTo(arrowX + arrowSize, arrowY + arrowSize / 2);
            }
            
            arrow.closePath();
            arrow.fillPath();
            
            // Efecto de movimiento en las flechas
            this.scene.tweens.add({
                targets: arrow,
                x: this.attackDirection === 'left' ? arrowX - 20 : arrowX + 20,
                duration: 300,
                yoyo: true,
                repeat: -1,
                delay: i * 50
            });
            
            this.arrows.push(arrow);
        }
        
        // Flecha grande central
        const bigArrow = this.createBigDirectionArrow();
        this.arrows.push(bigArrow);
        
        // Registrar flechas para limpieza
        this.warningElements.arrows = this.arrows;
    }
    
    /**
     * Crea una flecha grande central para destacar la dirección
     * @returns {Phaser.GameObjects.Graphics} - Flecha grande creada
     */
    createBigDirectionArrow() {
        const cam = this.scene.cameras.main;
        const bigArrowSize = 60;
        
        const bigArrowX = this.attackDirection === 'left' ?
            this.boss.x + (cam.width / 2) - 50 :
            this.boss.x - (cam.width / 2) + 50;
        const bigArrowY = this.spawnY;
        
        const bigArrow = this.scene.add.graphics();
        bigArrow.fillStyle(0xff0000, 0.9);
        bigArrow.lineStyle(3, 0xffffff, 1);
        
        bigArrow.beginPath();
        bigArrow.moveTo(bigArrowX, bigArrowY);
        
        if (this.attackDirection === 'left') {
            bigArrow.lineTo(bigArrowX - bigArrowSize, bigArrowY - bigArrowSize / 1.5);
            bigArrow.lineTo(bigArrowX - bigArrowSize, bigArrowY + bigArrowSize / 1.5);
        } else {
            bigArrow.lineTo(bigArrowX + bigArrowSize, bigArrowY - bigArrowSize / 1.5);
            bigArrow.lineTo(bigArrowX + bigArrowSize, bigArrowY + bigArrowSize / 1.5);
        }
        
        bigArrow.closePath();
        bigArrow.fillPath();
        bigArrow.strokePath();
        
        // Efecto de escala en flecha grande
        this.scene.tweens.add({
            targets: bigArrow,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 0.6, to: 1 },
            duration: 400,
            yoyo: true,
            repeat: -1
        });
        
        return bigArrow;
    }
    
    /**
     * Ejecuta el ataque de puño horizontal
     */
    executeAttack() {
        this.boss.play('bossira_attack');
        this.spawnPunch();
    }
    
    /**
     * Genera un puño horizontal
     */
    spawnPunch() {
        const Xspeed = this.boss.punchXSpeed;
        const cam = this.scene.cameras.main;
        let punch;
        
        // Usar create de Phaser en lugar del grupo específico
        punch = this.scene.physics.add.sprite(
            this.attackDirection === 'left' ? this.boss.x - cam.width / 2 : this.boss.x + cam.width / 2,
            this.fixedSpawnY,
            this.config.texture
        );
        
        // Añadir al grupo de ataques del boss
        this.boss.addAttack(punch);
        
        punch.setVelocityX(this.attackDirection === 'left' ? Xspeed : -Xspeed);
        punch.setAngle(this.attackDirection === 'left' ? -90 : 90);
        punch.setScale(2.5);
        punch.body.allowGravity = false;
        punch.isPlatformPunch = false; // Puños laterales NO son platformPunch
        
        // Efecto de aparición
        punch.setAlpha(0);
        this.scene.tweens.add({
            targets: punch,
            alpha: 1,
            scale: 2.5,
            duration: 100,
            ease: 'Power2'
        });
        
        // Auto-destrucción
        this.cleanupPunch(punch);
    }
    
    /**
     * Configura la auto-destrucción del puño
     * @param {Phaser.GameObjects.Sprite} punch - Puño a limpiar
     */
    cleanupPunch(punch) {
        const scene = this.scene;
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
    
    /**
     * Destruye todas las advertencias visuales
     */
    destroyAllWarnings() {
        super.destroyAllWarnings();
        
        // Limpiar flechas específicas
        if (this.arrows) {
            this.arrows.forEach(arrow => {
                if (arrow && arrow.destroy) {
                    arrow.destroy();
                }
            });
            this.arrows = null;
        }
    }
}
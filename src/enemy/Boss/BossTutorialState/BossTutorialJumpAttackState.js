import BaseBossAttackState from '../BaseBoss/BaseBossAttackState.js';

export default class BossTutorialJumpAttackState extends BaseBossAttackState {
    constructor() {
        super({
            texture: 'tutorial',
            attackName: 'Ataque de Salto',
            phases: ['lift', 'fall', 'warning', 'finish'],
            warningDuration: 1400,
            attackDuration: 800,
            cooldownDuration: 1000
        });

        this.groundY = 0;
        this.targetX = 0;
    }

    enter(context) {
        this.boss = context;
        this.scene = this.boss.scene;
        this.player = this.boss.player;

        this.groundY = this.boss.y;

        if (this.boss.body) {
            this.boss.body.enable = true;
            this.boss.body.moves = true;
        }

        this.currentPhase = 'lift';
        this.stateTime = 0;
        this.startLift();
    }

    createWarning() {
        // Warning personalizado en createGroundWarning
    }

    executeAttack() {
        // Se maneja en las fases específicas
    }

    execute(context, time, delta) {
        this.stateTime += delta;

        switch (this.currentPhase) {
            case 'lift':
                if (this.stateTime >= this.config.warningDuration) {
                    this.startFall();
                }
                break;

            case 'fall':
                if (this.stateTime >= this.config.attackDuration) {
                    this.onLand();
                }
                break;

            case 'warning':
                if (this.stateTime >= this.config.warningDuration) {
                    this.startFinish();
                }
                break;

            case 'finish':
                if (this.stateTime >= this.config.cooldownDuration) {
                    this.boss.selectNextState();
                }
                break;
        }
    }

    startLift() {
        this.scene.tweens.add({
            targets: this.boss,
            y: this.boss.y - 500,
            duration: this.config.warningDuration,
            ease: 'Quad.easeOut'
        });
    }

    startFall() {
        this.currentPhase = 'fall';
        this.stateTime = 0;

        const cam = this.scene.cameras.main;
        const worldView = cam.worldView || { x: 0, width: 800 };

        this.targetX = Phaser.Math.Clamp(
            this.player.x,
            worldView.x + 50,
            worldView.x + worldView.width - 50
        );

        this.boss.flipX = (this.targetX > this.boss.x);

        // sonido de ataque
        this.boss?.bossAttackSound?.play();

        this.createGroundWarning();
        this.performFall();
    }

    createGroundWarning() {
        const warningRect = this.createWarningRectangle(
            this.targetX,
            this.groundY,
            120,
            120,
            0xff0000,
            0.45
        );

        this.createPulseEffect([warningRect], 400, 0.3, 0.6);
    }

    performFall() {
        this.scene.tweens.add({
            targets: this.boss,
            x: this.targetX,
            y: this.groundY,
            duration: this.config.attackDuration,
            ease: 'Quad.easeIn'
        });
    }

    onLand() {
        this.currentPhase = 'warning';
        this.stateTime = 0;
        this.boss.y = this.groundY;

        if (this.scene.physics.overlap(this.boss, this.player)) {
            this.boss.onHitPlayer(this.boss, this.player);
        }

        // sonido de aterrizaje
        this.boss?.tutorialLandSound?.play();

        this.createLandingEffect();
    }

    createLandingEffect() {
        const impactCircle = this.scene.add.circle(
            this.targetX,
            this.groundY,
            80,
            0xff0000,
            0.3
        );

        for (let i = 0; i < 3; i++) {
            const wave = this.scene.add.circle(
                this.targetX,
                this.groundY,
                40,
                0xff4444,
                0.4 - (i * 0.1)
            );

            this.scene.tweens.add({
                targets: wave,
                scale: 2 + (i * 0.5),
                alpha: 0,
                duration: 300,
                delay: i * 100
            });
        }

        this.scene.cameras.main.shake(200, 0.01);

        this.scene.time.delayedCall(500, () => {
            if (impactCircle?.active) impactCircle.destroy();
        });
    }

    startFinish() {
        this.currentPhase = 'finish';
        this.stateTime = 0;
    }

    exit(context) {
        super.exit(context);
        if (this.boss) {
            this.boss.y = this.groundY;
        }
    }
}
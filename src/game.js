import TestPlayerScene from './scenes/TestPlayerScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { BossTestScene } from './scenes/BossTestScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { WinScene } from './scenes/WinScene.js';
import { OrbSelectScene } from './scenes/OrbSelectScene.js';
import { LoadingScene } from './scenes/LoadingScene.js';
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    scale: {
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        mode: Phaser.Scale.FIT,
        min: {
            width: 384,
            height: 192
        },
        max: {
            width: 768, 
            height: 384  
        },
        zoom: 2
    },
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 600 },
        debug: true,
        debugShowBody: true,
        debugShowVelocity: true,
    },
    
    },
    scene: [PreloadScene,MainMenuScene, TestPlayerScene,LoadingScene,BossTestScene, PauseScene, GameOverScene,WinScene, OrbSelectScene],
    title: "Highway To Hell",
    version: "1.0.0"
};

new Phaser.Game(config);

import TestPlayerScene from './scenes/TestPlayerScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { PauseScene } from './scenes/PauseScene.js';
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
            gravity: { y: 300 }, 
            debug: false,
        },
    
    },
    scene: [PreloadScene,MainMenuScene, TestPlayerScene,PauseScene],
    title: "Highway To Hell",
    version: "1.0.0"
};

new Phaser.Game(config);

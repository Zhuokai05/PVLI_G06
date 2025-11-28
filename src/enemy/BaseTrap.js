import BaseEnemy from './BaseEnemy.js';

export default class BaseTrap extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 0;
    this.inmune = true;
    this.collisionDamage = 100;
    
    }
}
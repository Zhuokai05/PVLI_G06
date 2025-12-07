import BaseEnemy from './BaseEnemy.js';

export default class BaseTrap extends BaseEnemy {
  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    this.speed = 0;
    this.inmune = true;
    this.collisionDamage = 100;

    this.setScale(15, 1);
    this.setDepth(-1);
  }
}
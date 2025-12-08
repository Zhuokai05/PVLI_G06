import BaseEnemy from './BaseEnemy.js';

/**
 * trampa basica que toca y mata
 */
export default class BaseTrap extends BaseEnemy {

  constructor(scene, x, y, sprite) {
    super(scene, x, y, sprite);

    // stats
    this.speed = 0;                                     // trampa no se mueve
    this.inmune = true;                                 // no recibe danio
    this.collisionDamage = 100;                         // danio extremo

    // render
    this.setScale(15, 1);                               // trampa muy larga
    this.setDepth(-1);                                  // dibujar detras
  }
}

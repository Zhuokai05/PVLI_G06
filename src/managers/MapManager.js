export default class MapManager {
    constructor(scene, fileData, tileSheet, tileWidth, tileHeight) {
        this.scene = scene;
        this.tileSheetKey = tileSheet;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.parseFile(fileData);
        this.createMap();
    }
    parseFile(fileData) {
        const lines = fileData.trim().split('\n').map(l => l.trim());
        const [startX, startY] = lines[0].split(/\s+/).map(Number);
        this.startX = startX;
        this.startY = startY;
        this.mapFile = lines.slice(1).map(line => line.split(/\s+/).map(Number));
    }

    createMap() {
        this.tileGroup = this.scene.physics.add.staticGroup();

        for (let row = 0; row < this.mapFile.length; row++) {
            for (let col = 0; col < this.mapFile[row].length; col++) {
                const tileIndex = this.mapFile[row][col];
                if (tileIndex === -1) continue; 

                const x = this.startX + col * this.tileWidth;
                const y = this.startY + row * this.tileHeight;

                const tile = this.scene.add.image(x, y, this.tileSheetKey, tileIndex);
                tile.setOrigin(0); 

                this.scene.physics.add.existing(tile, true);
                tile.body.setSize(this.tileWidth, this.tileHeight); 
                tile.body.setOffset(0, 0);

                this.tileGroup.add(tile);
            }
        }
    }

    addCollisionWith(player) {
        this.scene.physics.add.collider(player, this.tileGroup);
    }
}
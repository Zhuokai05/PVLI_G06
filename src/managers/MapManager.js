/**
 * clase mapmanager
 * gestiona la creacion y la logica de colision de un mapa
 * el mapa se carga a partir de un archivo de texto plano
 */
export default class MapManager {

    /**
     * constructor del gestor de mapas
     * @param {object} scene - escena de phaser actual
     * @param {string} fileData - contenido del archivo de texto del mapa
     * @param {string} tileSheet - clave del tileset (hoja de sprites)
     * @param {number} tileWidth - ancho de un tile
     * @param {number} tileHeight - alto de un tile
     */
    constructor(scene, fileData, tileSheet, tileWidth, tileHeight) {
        this.scene = scene;                   // referencia a la escena
        this.tileSheetKey = tileSheet;        // clave de la hoja de tiles
        this.tileWidth = tileWidth;           // ancho del tile
        this.tileHeight = tileHeight;         // alto del tile

        this.parseFile(fileData);             // procesar el archivo de mapa
        this.createMap();                     // crear los objetos del mapa
    }

    /**
     * parsea el archivo de texto para obtener la posicion inicial y la matriz del mapa
     * @param {string} fileData - contenido del archivo de texto del mapa
     */
    parseFile(fileData) {
        // dividir en lineas, eliminar espacios en blanco y trim
        const lines = fileData.trim().split('\n').map(l => l.trim());
        
        // la primera linea contiene la posicion de inicio (x, y)
        const [startX, startY] = lines[0].split(/\s+/).map(Number);
        this.startX = startX;
        this.startY = startY;
        
        // las lineas restantes son la matriz del mapa
        this.mapFile = lines.slice(1).map(line => line.split(/\s+/).map(Number));
    }

    /**
     * crea los sprites de los tiles y su cuerpo de colision
     */
    createMap() {
        // grupo estatico para las colisiones de los tiles
        this.tileGroup = this.scene.physics.add.staticGroup();

        // iterar sobre la matriz del mapa
        for (let row = 0; row < this.mapFile.length; row++) {
            for (let col = 0; col < this.mapFile[row].length; col++) {
                const tileIndex = this.mapFile[row][col];
                
                // -1 indica un tile vacio, saltar
                if (tileIndex === -1) continue; 

                // calcular la posicion en el mundo
                const x = this.startX + col * this.tileWidth;
                const y = this.startY + row * this.tileHeight;

                // crear el sprite del tile
                const tile = this.scene.add.image(x, y, this.tileSheetKey, tileIndex);
                tile.setOrigin(0); // establecer origen en la esquina superior izquierda

                // agregar fisica estatica al tile
                this.scene.physics.add.existing(tile, true);
                
                // establecer el tamano exacto de la colision del tile
                tile.body.setSize(this.tileWidth, this.tileHeight); 
                tile.body.setOffset(0, 0); // offset cero

                this.tileGroup.add(tile); // agregar al grupo estatico
            }
        }
    }

    /**
     * establece la colision entre un objeto (ej. el jugador) y los tiles del mapa
     * @param {object} player - objeto phaser con el que colisionar
     */
    addCollisionWith(player) {
        this.scene.physics.add.collider(player, this.tileGroup);
    }
}
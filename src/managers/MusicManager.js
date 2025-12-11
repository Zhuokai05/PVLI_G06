/**
 * clase musicmanager
 * gestiona la reproduccion de musica de fondo de manera global
 * asegura que solo una pista de musica suene a la vez
 */
export default class MusicManager {
    static music = null; // referencia estatica a la pista de musica actual

    /**
     * reproduce una pista de musica.
     * solo reproduce si no hay musica sonando actualmente.
     * @param {object} scene - escena de phaser para acceder al gestor de sonido
     * @param {string} key - clave de la pista de musica
     * @param {number} [volume=1] - volumen de reproduccion (0 a 1)
     */
    static play(scene, key, volume = 1) {
        if (this.music) return; // ya esta sonando, salir

        // añadir la pista de musica con loop
        this.music = scene.sound.add(key, {
            volume: volume,
            loop: true
        });

        this.music.play(); // iniciar reproduccion
    }

    /**
     * detiene la reproduccion de la musica actual
     */
    static stop() {
        if (this.music) {
            this.music.stop(); // detener la pista
            this.music = null; // eliminar la referencia
        }
    }

    /**
     * establece el volumen de la musica actual
     * @param {number} v - nuevo volumen (0 a 1)
     */
    static setVolume(v) {
        if (this.music) this.music.setVolume(v); // cambiar volumen si hay musica
    }
}
export default class MusicManager {
    static music = null;

    static play(scene, key, volume = 0.5) {
        if (this.music) return; // ya está sonando

        this.music = scene.sound.add(key, {
            volume: volume,
            loop: true
        });

        this.music.play();
    }

    static stop() {
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
    }

    static setVolume(v) {
        if (this.music) this.music.setVolume(v);
    }
}
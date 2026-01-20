
/**
 * Servicio de Audio para GeoSpy.
 * Utiliza una pista ambiental relajante y estable.
 */

// Usamos una URL de una fuente conocida por su estabilidad y compatibilidad directa.
const AMBIENT_TRACK_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';

export class GeoAudioPlayer {
  private audio: HTMLAudioElement;
  private isMuted: boolean = false;

  constructor() {
    this.audio = new Audio();
    
    // IMPORTANTE: Eliminamos crossOrigin="anonymous". 
    // Para la reproducción simple en un elemento <audio>, no es necesario y 
    // si el servidor no soporta CORS, el navegador lanza el error "no supported source found".
    
    this.audio.src = AMBIENT_TRACK_URL;
    this.audio.loop = true;
    this.audio.volume = 0.4;
    this.audio.preload = 'auto';

    this.audio.onerror = (e) => {
      console.error("Error crítico en el elemento de audio:", this.audio.error);
      console.log("Código de error:", this.audio.error?.code);
      console.log("Mensaje de error:", this.audio.error?.message);
    };
  }

  async play() {
    try {
      // Si hay un error previo, intentamos resetear la fuente
      if (this.audio.error) {
        this.audio.load();
      }
      
      if (this.audio.paused) {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Audio iniciado correctamente:", AMBIENT_TRACK_URL);
        }
      }
    } catch (err) {
      console.warn("No se pudo iniciar la reproducción:", err);
      throw err;
    }
  }

  pause() {
    this.audio.pause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    return this.isMuted;
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(val: number) {
    this.audio.volume = Math.max(0, Math.min(1, val));
  }
}

export const createAudioPlayer = () => new GeoAudioPlayer();

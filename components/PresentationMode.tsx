
import React, { useState, useEffect, useRef } from 'react';
import { createAudioPlayer } from '../services/audioService';

export interface Slide {
  image: string;
  locationName: string;
  description: string;
  facts: string[];
  country?: string;
}

interface PresentationModeProps {
  slides: Slide[];
  onClose: () => void;
  title: string;
}

const PresentationMode: React.FC<PresentationModeProps> = ({ slides, onClose, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioPlayerRef = useRef<any>(null);
  
  const SLIDE_DURATION = 6000;
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    audioPlayerRef.current = createAudioPlayer();
    return () => {
      audioPlayerRef.current?.stop();
    };
  }, []);

  const startExperience = async () => {
    if (audioPlayerRef.current) {
      try {
        // Marcamos como iniciado visualmente primero para mejorar respuesta de UI
        setIsAudioStarted(true);
        setIsPlaying(true);
        
        // Intentamos reproducir audio
        await audioPlayerRef.current.play();
        setAudioError(null);
      } catch (e: any) {
        console.error("Fallo definitivo al iniciar audio:", e);
        setAudioError("Audio no disponible");
        // No bloqueamos la experiencia si el audio falla
      }
    }
  };

  useEffect(() => {
    let interval: number;
    let progressInterval: number;

    if (isPlaying) {
      const startTime = Date.now();
      
      interval = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setProgress(0);
      }, SLIDE_DURATION);

      progressInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
        setProgress(newProgress);
      }, 50);
    }

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isPlaying, currentIndex, slides.length]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioPlayerRef.current) {
      const muted = audioPlayerRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    if (newPlayingState) {
      audioPlayerRef.current?.play().catch(() => {
        console.warn("Fallo al reanudar audio");
      });
    } else {
      audioPlayerRef.current?.pause();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row animate-in fade-in duration-700 overflow-hidden">
      
      {!isAudioStarted && (
        <div className="absolute inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-8 animate-pulse border border-white/10">
            <i className="fa-solid fa-music text-4xl text-white"></i>
          </div>
          <h3 className="text-white text-3xl font-black mb-4 tracking-tight">¿Listo para el viaje?</h3>
          <p className="text-white/60 mb-10 max-w-sm leading-relaxed">
            La experiencia GeoSpy incluye música ambiental diseñada para sumergiros en cada rincón del mundo.
          </p>
          <button 
            onClick={startExperience}
            className="bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20 flex items-center gap-4"
          >
            <i className="fa-solid fa-play"></i>
            Iniciar Experiencia
          </button>
          <button 
            onClick={() => { setIsAudioStarted(true); setIsPlaying(true); }}
            className="mt-6 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Continuar sin sonido
          </button>
        </div>
      )}

      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-50 transition-all border border-white/10"
      >
        <i className="fa-solid fa-xmark text-xl"></i>
      </button>

      <div className="absolute top-6 left-6 flex flex-col gap-2 z-50">
        <button 
          onClick={handleToggleMute}
          disabled={!!audioError}
          className={`h-12 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center gap-3 text-white transition-all border border-white/10 group ${audioError ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
        >
          <div className="flex gap-1 h-3 items-end">
            <div className={`w-0.5 bg-white transition-all ${!isMuted && isPlaying && !audioError ? 'animate-[bounce_1s_infinite_delay-100]' : 'h-0.5'}`}></div>
            <div className={`w-0.5 bg-white transition-all ${!isMuted && isPlaying && !audioError ? 'animate-[bounce_1s_infinite_delay-300]' : 'h-2'}`}></div>
            <div className={`w-0.5 bg-white transition-all ${!isMuted && isPlaying && !audioError ? 'animate-[bounce_1s_infinite_delay-500]' : 'h-1.5'}`}></div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
            {isMuted ? 'Mudo' : 'Sonido'}
          </span>
          <i className={`fa-solid ${isMuted || audioError ? 'fa-volume-xmark' : 'fa-volume-high'} text-xs ml-1`}></i>
        </button>
        {audioError && isAudioStarted && (
          <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5">
            Error de Audio
          </span>
        )}
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 bg-zinc-950 overflow-hidden">
        <div className="absolute top-0 left-0 w-full p-4 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-[50ms] ease-linear shadow-[0_0_8px_white]"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              ></div>
            </div>
          ))}
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          {slides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt={slide.locationName}
              className={`absolute max-w-full max-h-full object-contain transition-all duration-1000 rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] ${
                idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30 bg-black/40 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/10">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length); setProgress(0); }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-backward-step text-lg"></i>
          </button>

          <button 
            onClick={togglePlay}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % slides.length); setProgress(0); }}
            className="text-white/40 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-forward-step text-lg"></i>
          </button>
        </div>
      </div>

      <div className="w-full md:w-[450px] h-[45%] md:h-full bg-slate-900 border-l border-white/5 flex flex-col z-40 shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-8 md:p-14 flex flex-col justify-center">
          <div key={currentIndex} className="animate-in slide-in-from-right-8 fade-in duration-700">
            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6 block">
              {title}
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
              {currentSlide.locationName}
            </h2>

            <div className="relative">
              <i className="fa-solid fa-quote-left text-indigo-500/10 text-7xl absolute -top-10 -left-8"></i>
              <p className="text-white/70 text-lg md:text-xl leading-relaxed italic relative z-10 pl-2">
                "{currentSlide.description}"
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-8 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-indigo-500"></i>
              {currentSlide.country}
            </span>
            <span>{currentIndex + 1} / {slides.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;

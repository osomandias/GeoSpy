
import React, { useState, useMemo } from 'react';
import { AlbumLocationGroup } from '../types';
import PresentationMode, { Slide } from './PresentationMode';

interface AlbumViewProps {
  groups: AlbumLocationGroup[];
}

const AlbumView: React.FC<AlbumViewProps> = ({ groups }) => {
  const [presentationConfig, setPresentationConfig] = useState<{ slides: Slide[], title: string } | null>(null);

  const fullAlbumSlides = useMemo(() => {
    const slides: Slide[] = [];
    groups.forEach(group => {
      group.images.forEach(img => {
        slides.push({
          image: img,
          locationName: group.locationName,
          description: group.description,
          facts: group.facts,
          country: group.country
        });
      });
    });
    return slides;
  }, [groups]);

  if (groups.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 space-y-12 animate-in fade-in duration-700">
      <div className="bg-indigo-900 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-indigo-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-5xl font-black tracking-tight mb-4">Tu Gran Álbum</h3>
          <p className="text-indigo-200 text-lg max-w-lg mx-auto mb-10 font-medium">
            Tus fotos en un recorrido audiovisual inmersivo con música ambiental.
          </p>
          
          <button 
            onClick={() => setPresentationConfig({ slides: fullAlbumSlides, title: 'Recorrido Completo' })}
            className="bg-white text-indigo-900 px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
          >
            <i className="fa-solid fa-play text-xl"></i>
            Iniciar Experiencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="flex items-center gap-4 px-4">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Destinos Individuales</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {groups.map((group, idx) => (
          <section key={idx} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:shadow-2xl overflow-hidden group/section">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="md:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  {group.images.slice(0, 4).map((img, imgIdx) => (
                    <div 
                      key={imgIdx} 
                      className={`relative rounded-[2rem] overflow-hidden shadow-sm aspect-square ${
                        imgIdx === 0 && group.images.length === 1 ? 'col-span-2 aspect-video' : ''
                      }`}
                    >
                      <img src={img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/section:scale-110" alt={group.locationName} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2 flex flex-col justify-center">
                <div className="mb-6">
                  <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] bg-indigo-50 px-4 py-1.5 rounded-full inline-block mb-4">
                    {group.country || 'Lugar Identificado'}
                  </span>
                  <h4 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{group.locationName}</h4>
                </div>

                <p className="text-slate-500 leading-relaxed text-xl mb-8 italic border-l-4 border-indigo-100 pl-8">
                  "{group.description}"
                </p>

                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => {
                      const groupSlides = group.images.map(img => ({
                        image: img,
                        locationName: group.locationName,
                        description: group.description,
                        facts: group.facts,
                        country: group.country
                      }));
                      setPresentationConfig({ slides: groupSlides, title: group.locationName });
                    }}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-lg text-indigo-400"></i>
                    Ver Presentación
                  </button>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {group.facts.slice(0, 2).map((fact, fIdx) => (
                    <div key={fIdx} className="space-y-1">
                      <h6 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sabías que...</h6>
                      <p className="text-xs text-slate-600 leading-snug">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {presentationConfig && (
        <PresentationMode 
          slides={presentationConfig.slides} 
          title={presentationConfig.title}
          onClose={() => setPresentationConfig(null)} 
        />
      )}
    </div>
  );
};

export default AlbumView;


import React from 'react';
import { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult;
  image: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, image }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col lg:flex-row">
        {/* Lado de la Imagen */}
        <div className="lg:w-1/3 relative h-64 lg:h-auto min-h-[300px]">
          <img src={image} alt={result.locationName} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
             <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur shadow-sm text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {result.country || 'Lugar Detectado'}
              </span>
          </div>
        </div>

        {/* Lado de la Información */}
        <div className="p-6 md:p-8 lg:w-2/3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{result.locationName}</h2>
              {result.country && (
                <p className="flex items-center gap-2 text-slate-500 mt-1">
                  <i className="fa-solid fa-location-dot text-indigo-500"></i>
                  {result.country}
                </p>
              )}
            </div>
            
            {result.googleMapsLinks.length > 0 && (
              <a
                href={result.googleMapsLinks[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <i className="fa-solid fa-map"></i>
                Abrir Mapa
              </a>
            )}
          </div>

          <div className="prose prose-slate max-w-none">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Descripción del destino</h4>
            <p className="text-slate-600 leading-relaxed italic text-base">
              "{result.description}"
            </p>
          </div>

          <div className="mt-8">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Datos de interés</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.facts.map((fact, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-md flex items-center justify-center mb-2 text-[10px] font-black">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;

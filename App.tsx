
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import AlbumView from './components/AlbumView';
import { analyzeImageLocation } from './services/geminiService';
import { ImageAnalysisState, AlbumLocationGroup } from './types';

const App: React.FC = () => {
  const [analyses, setAnalyses] = useState<ImageAnalysisState[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'album'>('list');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImagesAnalysis = async (base64Array: string[]) => {
    setIsProcessing(true);
    
    const newAnalyses: ImageAnalysisState[] = base64Array.map(base64 => ({
      id: Math.random().toString(36).substring(7),
      base64,
      loading: true,
      error: null,
      result: null
    }));

    setAnalyses(prev => [...newAnalyses, ...prev]);

    newAnalyses.forEach(async (analysis) => {
      try {
        const result = await analyzeImageLocation(analysis.base64);
        setAnalyses(prev => prev.map(item => 
          item.id === analysis.id 
            ? { ...item, loading: false, result } 
            : item
        ));
      } catch (err: any) {
        setAnalyses(prev => prev.map(item => 
          item.id === analysis.id 
            ? { ...item, loading: false, error: err.message || "Error al analizar" } 
            : item
        ));
      }
    });

    setIsProcessing(false);
  };

  const clearResults = () => {
    setAnalyses([]);
    setViewMode('list');
  };

  const albumGroups = useMemo(() => {
    const groups: { [key: string]: AlbumLocationGroup } = {};
    
    analyses.forEach(item => {
      if (item.result) {
        const key = `${item.result.locationName}-${item.result.country || ''}`;
        if (!groups[key]) {
          groups[key] = {
            locationName: item.result.locationName,
            country: item.result.country,
            description: item.result.description,
            images: [item.base64],
            facts: item.result.facts
          };
        } else {
          groups[key].images.push(item.base64);
        }
      }
    });

    return Object.values(groups);
  }, [analyses]);

  const totalLoading = analyses.filter(a => a.loading).length;
  const hasResults = analyses.some(a => a.result);

  return (
    <Layout>
      <div className="flex flex-col items-center py-8">
        <div className="text-center mb-12 max-w-2xl px-4">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Tus Viajes, Inteligentes
          </h2>
          <p className="text-lg text-slate-600">
            Sube tus fotos de vacaciones. Organizaremos automáticamente tus recuerdos por ubicación y te contaremos la historia de cada lugar.
          </p>
        </div>

        <div className="w-full flex flex-col gap-6">
          <ImageUploader onImagesSelected={handleImagesAnalysis} isLoading={totalLoading > 0} />
          
          {analyses.length > 0 && (
            <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className="fa-solid fa-list-ul mr-2"></i>
                  Vista Lista
                </button>
                <button 
                  disabled={!hasResults}
                  onClick={() => setViewMode('album')}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${
                    viewMode === 'album' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  } ${!hasResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <i className="fa-solid fa-book-open mr-2"></i>
                  Generar Álbum
                </button>
              </div>

              <button 
                onClick={clearResults}
                className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 px-4 py-2"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                Borrar todo
              </button>
            </div>
          )}
        </div>

        {totalLoading > 0 && (
          <div className="mt-8 sticky top-20 z-40">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 animate-pulse">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold tracking-tight">Procesando {totalLoading} rincón{totalLoading === 1 ? '' : 'es'} del mundo...</span>
            </div>
          </div>
        )}

        <div className="w-full space-y-12 pb-20 mt-8">
          {viewMode === 'list' ? (
            analyses.map((analysis) => (
              <div key={analysis.id} className="relative">
                {analysis.loading ? (
                  <div className="w-full max-w-4xl mx-auto bg-white border border-slate-100 rounded-[2rem] p-8 flex items-center gap-8 animate-pulse shadow-sm">
                    <div className="w-40 h-40 bg-slate-100 rounded-3xl"></div>
                    <div className="flex-1 space-y-4">
                      <div className="h-8 bg-slate-100 rounded-lg w-1/3"></div>
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    </div>
                  </div>
                ) : analysis.error ? (
                  <div className="w-full max-w-4xl mx-auto bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center gap-6 text-red-700">
                    <div className="relative">
                      <img src={analysis.base64} className="w-20 h-20 object-cover rounded-2xl grayscale" alt="Contexto error" />
                      <div className="absolute inset-0 bg-red-500/20 rounded-2xl"></div>
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">Destino no identificado</p>
                      <p className="text-sm opacity-90 mt-1">{analysis.error}</p>
                    </div>
                  </div>
                ) : analysis.result ? (
                  <ResultDisplay result={analysis.result} image={analysis.base64} />
                ) : null}
              </div>
            ))
          ) : (
            <AlbumView groups={albumGroups} />
          )}
        </div>

        {analyses.length === 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="text-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-layer-group text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Multicarga</h4>
              <p className="text-sm text-slate-500">Sube todas tus fotos de un tirón. Gemini las clasificará una a una.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-book-atlas text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Álbum Automático</h4>
              <p className="text-sm text-slate-500">Agrupamos tus recuerdos por ciudad o monumento automáticamente.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-map-location-dot text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Geolocalización</h4>
              <p className="text-sm text-slate-500">Obtén enlaces a Google Maps para volver a tus lugares favoritos.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

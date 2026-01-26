
import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import AlbumView from './components/AlbumView';
import { analyzeImageLocation } from './services/geminiService';
import { dbService } from './services/dbService';
import { ImageAnalysisState, AlbumLocationGroup } from './types';

const App: React.FC = () => {
  const [analyses, setAnalyses] = useState<ImageAnalysisState[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'album'>('list');
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar DB al arrancar
  useEffect(() => {
    dbService.init().catch(console.error);
  }, []);

  const handleImagesAnalysis = async (base64Array: string[]) => {
    setIsProcessing(true);
    
    // Crear estados iniciales
    const newItems: ImageAnalysisState[] = base64Array.map(base64 => ({
      id: Math.random().toString(36).substring(7),
      base64,
      loading: true,
      error: null,
      result: null
    }));

    setAnalyses(prev => [...newItems, ...prev]);

    // Procesar cada imagen
    for (const item of newItems) {
      try {
        const hash = await dbService.generateHash(item.base64);
        const cachedResult = await dbService.getAnalysis(hash);

        if (cachedResult) {
          setAnalyses(prev => prev.map(a => 
            a.id === item.id 
              ? { ...a, loading: false, result: cachedResult } 
              : a
          ));
        } else {
          const result = await analyzeImageLocation(item.base64);
          
          // Guardar en base de datos con la imagen base64 para poder recuperarla luego
          await dbService.saveAnalysis(hash, result, item.base64);

          setAnalyses(prev => prev.map(a => 
            a.id === item.id 
              ? { ...a, loading: false, result } 
              : a
          ));
        }
      } catch (err: any) {
        setAnalyses(prev => prev.map(a => 
          a.id === item.id 
            ? { ...a, loading: false, error: err.message || "Error al procesar" } 
            : a
        ));
      }
    }

    setIsProcessing(false);
  };

  const loadFromLibrary = async () => {
    setIsProcessing(true);
    try {
      const history = await dbService.getAllAnalyses();
      
      if (history.length === 0) {
        alert("Tu biblioteca está vacía. Analiza algunas fotos primero.");
        setIsProcessing(false);
        return;
      }

      // Convertir registros de DB a estado de la aplicación
      const libraryItems: ImageAnalysisState[] = history.map(record => ({
        id: `lib-${record.hash}`,
        base64: record.base64,
        loading: false,
        error: null,
        result: record.result
      }));

      // Fusionar evitando duplicados por hash (id)
      setAnalyses(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewItems = libraryItems.filter(item => !existingIds.has(item.id));
        return [...prev, ...uniqueNewItems];
      });

    } catch (err) {
      console.error("Error al cargar biblioteca:", err);
    } finally {
      setIsProcessing(false);
    }
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
          // Evitar añadir la misma imagen exacta al mismo grupo si ya existe
          if (!groups[key].images.includes(item.base64)) {
            groups[key].images.push(item.base64);
          }
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
            Sube tus fotos o recupera tus recuerdos de la biblioteca local. GeoSpy recuerda tus lugares para que siempre los tengas a mano.
          </p>
        </div>

        <div className="w-full flex flex-col gap-6">
          <ImageUploader onImagesSelected={handleImagesAnalysis} isLoading={totalLoading > 0} />
          
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 px-2">
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-[1.5rem] w-fit">
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
              
              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              
              <button 
                onClick={loadFromLibrary}
                className="px-5 py-2 rounded-xl text-sm font-bold text-indigo-600 hover:bg-white transition-all flex items-center group"
              >
                <i className="fa-solid fa-box-archive mr-2 group-hover:scale-110 transition-transform"></i>
                Mi Biblioteca
              </button>
            </div>

            {analyses.length > 0 && (
              <button 
                onClick={clearResults}
                className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 px-4 py-2"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                Limpiar pantalla
              </button>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="mt-8 sticky top-20 z-40">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-200 animate-pulse border border-white/20">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold tracking-tight">Accediendo a datos...</span>
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
                      <p className="font-bold text-lg leading-tight">Error</p>
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
                <i className="fa-solid fa-database text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Memoria Persistente</h4>
              <p className="text-sm text-slate-500">Tus análisis se guardan localmente. Haz clic en 'Mi Biblioteca' para ver todas tus fotos guardadas.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-clock-rotate-left text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Historial Rápido</h4>
              <p className="text-sm text-slate-500">Accede instantáneamente a descubrimientos pasados sin necesidad de volver a procesarlos.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-shield-halved text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Privacidad Local</h4>
              <p className="text-sm text-slate-500">Tus datos nunca salen de tu dispositivo excepto para el análisis de IA. Tu biblioteca es solo tuya.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

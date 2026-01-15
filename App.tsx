
import React, { useState } from 'react';
import Layout from './components/Layout';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { analyzeImageLocation } from './services/geminiService';
import { ImageAnalysisState } from './types';

const App: React.FC = () => {
  const [analyses, setAnalyses] = useState<ImageAnalysisState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImagesAnalysis = async (base64Array: string[]) => {
    setIsProcessing(true);
    
    // Create initial state for new images
    const newAnalyses: ImageAnalysisState[] = base64Array.map(base64 => ({
      id: Math.random().toString(36).substring(7),
      base64,
      loading: true,
      error: null,
      result: null
    }));

    setAnalyses(prev => [...newAnalyses, ...prev]);

    // Process each image individually
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
  };

  const totalLoading = analyses.filter(a => a.loading).length;

  return (
    <Layout>
      <div className="flex flex-col items-center py-8">
        <div className="text-center mb-12 max-w-2xl px-4">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            Descubre tus destinos
          </h2>
          <p className="text-lg text-slate-600">
            Sube una o varias fotos. Nuestra IA las analizará todas simultáneamente para identificar monumentos, ciudades y paisajes.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <ImageUploader onImagesSelected={handleImagesAnalysis} isLoading={false} />
          
          {analyses.length > 0 && (
            <div className="max-w-4xl mx-auto w-full flex justify-end">
              <button 
                onClick={clearResults}
                className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-trash-can"></i>
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {totalLoading > 0 && (
          <div className="mt-8 sticky top-20 z-40">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 animate-bounce">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold">Analizando {totalLoading} {totalLoading === 1 ? 'foto' : 'fotos'}...</span>
            </div>
          </div>
        )}

        <div className="w-full space-y-12 pb-20">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="relative">
              {analysis.loading ? (
                <div className="w-full max-w-4xl mx-auto mt-8 bg-white border border-slate-100 rounded-3xl p-8 flex items-center gap-6 animate-pulse">
                  <div className="w-32 h-32 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  </div>
                </div>
              ) : analysis.error ? (
                <div className="w-full max-w-4xl mx-auto mt-8 bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4 text-red-700">
                  <img src={analysis.base64} className="w-16 h-16 object-cover rounded-xl" alt="Error context" />
                  <div>
                    <p className="font-bold">No pudimos identificar este lugar</p>
                    <p className="text-sm opacity-80">{analysis.error}</p>
                  </div>
                </div>
              ) : analysis.result ? (
                <ResultDisplay result={analysis.result} image={analysis.base64} />
              ) : null}
            </div>
          ))}
        </div>

        {analyses.length === 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-camera-retro"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Multicarga</h4>
              <p className="text-sm text-slate-500">Sube álbumes enteros de una sola vez.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-bolt"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Procesado Paralelo</h4>
              <p className="text-sm text-slate-500">Gemini analiza todas tus fotos al mismo tiempo.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Guía de Viaje</h4>
              <p className="text-sm text-slate-500">Obtén descripciones y mapas de cada rincón.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

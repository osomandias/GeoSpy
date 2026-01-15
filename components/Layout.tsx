
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-earth-americas text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">GeoSpy</h1>
          </div>
          <p className="hidden md:block text-sm text-slate-500 font-medium">
            Descubre el mundo a través de tus fotos
          </p>
        </div>
      </header>
      <main className="flex-grow max-w-5xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} GeoSpy AI - Impulsado por Gemini 3
        </div>
      </footer>
    </div>
  );
};

export default Layout;

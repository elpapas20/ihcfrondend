'use client'

import React, { useState, useRef, useEffect, KeyboardEvent, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  FaFile,
  FaStream,
  FaBook,
  FaSearchPlus,
  FaSearchMinus,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaMoon,
  FaArrowLeft
} from 'react-icons/fa';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// --- INTERFACES ---
interface FlipBookActions {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
    turnToPage: (page: number) => void;
  };
}

// --- HOOKS ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return isMobile;
};

function usePanOnDrag(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isPanning = false;
    let startX: number, startY: number, scrollLeft: number, scrollTop: number;
    const onMouseDown = (e: MouseEvent) => {
      // Middle click or drag scroll with primary click when holding space/meta (we use default drag)
      if (e.button !== 0 && e.button !== 1) return;
      
      // If user is clicking an interactive element, don't drag
      const target = e.target as HTMLElement;
      if (target.closest('button, input, a, select')) return;

      isPanning = true;
      startX = e.pageX - el.offsetLeft;
      startY = e.pageY - el.offsetTop;
      scrollLeft = el.scrollLeft;
      scrollTop = el.scrollTop;
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    };
    const onMouseUp = () => {
      isPanning = false;
      el.style.cursor = 'grab';
      el.style.userSelect = 'auto';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const y = e.pageY - el.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      el.scrollLeft = scrollLeft - walkX;
      el.scrollTop = scrollTop - walkY;
    };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeMouseDownListener?.();
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [ref]);
}

// --- COMPONENTES ---
const PaginaPDF = forwardRef<HTMLDivElement, { pageNumber: number; width?: number; className?: string }>(
  ({ pageNumber, width, className }, ref) => {
    return (
      <div ref={ref} className={`bg-white shadow-2xl flex items-center justify-center border border-gray-100 ${className}`}>
        <Page 
          pageNumber={pageNumber} 
          width={width} 
          scale={1} 
          renderAnnotationLayer={false} 
          renderTextLayer={false} 
          loading={<div className="p-4 text-sm text-gray-400 animate-pulse">Cargando página...</div>} 
          className={className} 
        />
      </div>
    );
  }
);
PaginaPDF.displayName = 'PaginaPDF';

export default function VisorCompleto({ 
  theme, 
  toggleTheme, 
  libroNombre,
  pdfUrl
}: { 
  theme: 'claro' | 'oscuro'; 
  toggleTheme: () => void; 
  libroNombre: string; 
  pdfUrl?: string | null;
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<'pagina' | 'scroll' | 'libro'>('libro');
  const flipBookRef = useRef<FlipBookActions | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const router = useRouter();

  usePanOnDrag(viewerRef);

  useEffect(() => {
    if (isMobile) {
      setViewMode('scroll');
      setScale(0.85);
    } else {
      setViewMode('libro');
      setScale(1.0);
    }
  }, [isMobile]);

  useEffect(() => { 
    setInputPage(String(currentPage)); 
  }, [currentPage]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => { 
    setNumPages(numPages); 
  };

  const onFlip = (e: { data: number }) => { 
    setCurrentPage(e.data + 1); 
  };

  const goToPrevPage = () => {
    if (viewMode === 'libro') { 
      flipBookRef.current?.pageFlip()?.flipPrev(); 
    } else { 
      setCurrentPage(p => Math.max(1, p - 1)); 
    }
  };

  const goToNextPage = () => {
    if (viewMode === 'libro') { 
      flipBookRef.current?.pageFlip()?.flipNext(); 
    } else { 
      if (numPages) { 
        setCurrentPage(p => Math.min(numPages, p + 1)); 
      } 
    }
  };

  const goToPage = (pageNum: number) => {
    if (viewMode === 'libro') { 
      flipBookRef.current?.pageFlip()?.turnToPage(pageNum - 1); 
    } else if (viewMode === 'scroll') { 
      document.getElementById(`pdf-page-${pageNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    } else { 
      setCurrentPage(pageNum); 
    }
  };

  const handlePageInputSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const pageNum = parseInt(inputPage, 10);
        if (numPages && pageNum >= 1 && pageNum <= numPages) { 
          goToPage(pageNum); 
        }
    }
  };

  const changeZoom = (factor: number) => {
    setScale(s => Math.max(0.5, Math.min(s + factor, 2.0)));
  };

  const PAGE_WIDTH = 450;
  const PAGE_HEIGHT = 636;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none">
      
      {/* Barra de Navegación Superior Premium */}
      <header className="relative z-50 flex justify-between items-center px-6 py-3 bg-[#001f3f] shadow-md border-b border-[#002d5c]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/bienvenida/colecciones')} 
            className="flex items-center gap-2 text-white/90 hover:text-teal-300 bg-white/10 hover:bg-white/20 transition-all px-3 py-1.5 rounded-lg text-sm font-medium"
            title="Volver a Colecciones"
          >
            <FaArrowLeft size={14} />
            <span className="hidden sm:inline">Volver</span>
          </button>
          
          <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>
          
          <Image src="/logo-unam.png" alt="Logo UNAM" width={40} height={40} className="object-contain hidden xs:block" />
          
          <div className="flex flex-col">
            <span className="text-white text-xs font-semibold uppercase tracking-wider opacity-60 hidden md:block">Biblioteca Virtual UNAM</span>
            <span className="text-white font-bold text-sm md:text-base leading-tight truncate max-w-[200px] sm:max-w-[400px]">
              {libroNombre}
            </span>
          </div>
        </div>

        {/* Acciones del Lado Derecho */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300"
            title="Cambiar Tema de Lectura"
          >
            {theme === 'claro' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>
        </div>
      </header>

      {/* Área del Visor con Fondo Suave */}
      <div 
        ref={viewerRef}
        className={`w-full flex-grow overflow-auto p-4 md:p-8 transition-colors duration-300 flex justify-center no-scrollbar relative 
        ${theme === 'claro' ? 'bg-[#f5f2eb]' : 'bg-[#0f131a]'} 
        ${viewMode === 'scroll' || isMobile ? 'items-start' : 'items-center'}`}
        style={{ cursor: 'grab' }}
      >
        <Document
          file={pdfUrl || "/dummy.pdf"}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <p className={`text-sm ${theme === 'oscuro' ? 'text-gray-400' : 'text-gray-600'}`}>Cargando documento PDF...</p>
            </div>
          }
          error={<p className="text-center text-red-500 font-semibold p-6 bg-red-100 rounded-lg shadow">Error al cargar el archivo PDF. Verifica que esté en la carpeta public.</p>}
        >
          {numPages && (
            <motion.div 
              animate={{ scale: scale }} 
              transition={{ type: 'spring', stiffness: 220, damping: 25 }} 
              className="py-6 flex justify-center"
            >
              {viewMode === 'libro' && !isMobile ? (
                <div style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT }} className="relative shadow-2xl rounded-lg">
                  {/* @ts-expect-error: react-pageflip types incompatibility */}
                  <HTMLFlipBook 
                    width={PAGE_WIDTH} 
                    height={PAGE_HEIGHT} 
                    ref={flipBookRef} 
                    onFlip={onFlip} 
                    className="mx-auto"
                    showCover={true}
                    maxShadowOpacity={0.5}
                    mobileScrollSupport={true}
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <PaginaPDF 
                        key={`page_${index + 1}`} 
                        pageNumber={index + 1} 
                        width={PAGE_WIDTH} 
                        className={theme === 'oscuro' ? 'dark-pdf-page' : ''} 
                      />
                    ))}
                  </HTMLFlipBook>
                </div>
              ) : viewMode === 'scroll' || isMobile ? (
                <div className="flex flex-col items-center gap-6">
                  {Array.from(new Array(numPages), (el, index) => (
                    <div 
                      key={`page_${index + 1}`} 
                      id={`pdf-page-${index + 1}`} 
                      className="shadow-xl rounded-lg overflow-hidden border border-black/5"
                    >
                      <PaginaPDF 
                        pageNumber={index + 1} 
                        width={isMobile ? window.innerWidth - 32 : PAGE_WIDTH * 0.95} 
                        className={theme === 'oscuro' ? 'dark-pdf-page' : ''}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ width: PAGE_WIDTH }} className="shadow-2xl rounded-lg overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentPage} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      transition={{ duration: 0.25 }}
                    >
                      <PaginaPDF 
                        pageNumber={currentPage} 
                        width={PAGE_WIDTH} 
                        className={theme === 'oscuro' ? 'dark-pdf-page' : ''} 
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </Document>
      </div>

      {/* Control flotante inferior premium */}
      <motion.div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95%] flex items-center justify-between gap-4 p-2 bg-[#001f3fs]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/10 flex-wrap"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ backgroundColor: 'rgba(0, 31, 63, 0.95)' }}
      >
        {isMobile ? (
          <div className="flex items-center justify-between gap-3 w-full px-2">
            <button 
              onClick={goToPrevPage} 
              className="p-2 rounded-lg bg-white/10 hover:bg-teal-500/20 active:scale-95 transition-all disabled:opacity-35"
              disabled={currentPage <= 1 || viewMode === 'scroll'}
            >
              <FaChevronLeft size={14} />
            </button>
            <div className="text-sm font-medium">
              <input 
                type="number" 
                value={inputPage} 
                onChange={e => setInputPage(e.target.value)} 
                onKeyDown={handlePageInputSubmit} 
                className="w-12 text-center bg-white/10 rounded border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400 font-semibold py-0.5 text-sm" 
              />
              <span className="opacity-70"> / {numPages || '--'}</span>
            </div>
            <button 
              onClick={goToNextPage} 
              className="p-2 rounded-lg bg-white/10 hover:bg-teal-500/20 active:scale-95 transition-all disabled:opacity-35"
              disabled={!!numPages && currentPage >= numPages || viewMode === 'scroll'}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* Selector de modo de vista */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setViewMode('pagina')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'pagina' ? 'bg-teal-600 text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'}`} 
                title="Página Única"
              >
                <FaFile size={15} />
              </button>
              <button 
                onClick={() => setViewMode('scroll')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'scroll' ? 'bg-teal-600 text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'}`} 
                title="Desplazamiento Continuo"
              >
                <FaStream size={15} />
              </button>
              <button 
                onClick={() => setViewMode('libro')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'libro' ? 'bg-teal-600 text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/10'}`} 
                title="Vista de Libro (Doble Página)"
              >
                <FaBook size={15} />
              </button>
            </div>

            <div className="h-6 w-[1px] bg-white/20"></div>

            {/* Navegación de páginas */}
            <div className="flex items-center gap-3">
              <button 
                onClick={goToPrevPage} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-teal-300 transition-all active:scale-95 disabled:opacity-35"
                disabled={currentPage <= 1 || viewMode === 'scroll'}
              >
                <FaChevronLeft size={12} />
              </button>
              <div className="text-sm font-semibold flex items-center gap-1.5">
                <input 
                  type="number" 
                  value={inputPage} 
                  onChange={e => setInputPage(e.target.value)} 
                  onKeyDown={handlePageInputSubmit} 
                  className="w-12 text-center bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-teal-400 py-0.5 text-sm" 
                />
                <span className="opacity-70">/ {numPages || '--'}</span>
              </div>
              <button 
                onClick={goToNextPage} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-teal-300 transition-all active:scale-95 disabled:opacity-35"
                disabled={!!numPages && currentPage >= numPages || viewMode === 'scroll'}
              >
                <FaChevronRight size={12} />
              </button>
            </div>

            <div className="h-6 w-[1px] bg-white/20"></div>

            {/* Controles de Zoom */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeZoom(-0.15)} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all active:scale-95" 
                title="Alejar"
              >
                <FaSearchMinus size={13} />
              </button>
              <span className="w-12 text-center text-xs font-bold font-mono">{(scale * 100).toFixed(0)}%</span>
              <button 
                onClick={() => changeZoom(0.15)} 
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all active:scale-95" 
                title="Acercar"
              >
                <FaSearchPlus size={13} />
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* Estilos CSS Inyectados para invertir páginas en Modo Oscuro */}
      <style jsx global>{`
        .dark-pdf-page img, 
        .dark-pdf-page canvas {
          filter: invert(0.9) hue-rotate(180deg) !important;
        }
        /* Ocultar barra de scroll predeterminada del visor */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

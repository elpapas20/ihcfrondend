'use client'

import { useState, useRef, useEffect, KeyboardEvent, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FaFile, FaStream, FaBook, FaSearchPlus, FaSearchMinus, FaChevronLeft, FaChevronRight, FaSun, FaMoon, FaTimes } from 'react-icons/fa';
import { useParams } from 'next/navigation';

// Configuración del worker local
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Interfaz para la información básica del libro
interface LibroInfo {
  nombre: string;
}
interface SingleLibroAttributes {
    nombre: string;
}
interface SingleLibroData {
    id: number;
    attributes: SingleLibroAttributes;
}
interface SingleLibroApiResponse {
    data: SingleLibroData;
}


// Hook para detectar dispositivo móvil
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

// Hook personalizado para navegar con arrastre
function usePanOnDrag(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isPanning = false;
    let startX: number, startY: number, scrollLeft: number, scrollTop: number;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
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
      const walkX = (x - startX) * 2;
      const walkY = (y - startY) * 2;
      el.scrollLeft = scrollLeft - walkX;
      el.scrollTop = scrollTop - walkY;
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [ref]);
}

// Componente para una Página Individual del Libro
const PaginaPDF = forwardRef<HTMLDivElement, { pageNumber: number; width?: number; className?: string }>(
  ({ pageNumber, width, className }, ref) => {
    return (
      <div ref={ref} className={`bg-white shadow-inner flex items-center justify-center ${className}`}>
        {/* CORRECCIÓN: Se aumenta la escala a 1.5 para mejorar la nitidez */}
        <Page pageNumber={pageNumber} width={width} scale={1} renderAnnotationLayer={false} renderTextLayer={false} loading={<div className="p-4 text-sm text-gray-500">Cargando...</div>} className={className} />
      </div>
    );
  }
);
PaginaPDF.displayName = 'PaginaPDF';


// --- Componente Principal del Visor ---
function VisorPDF({ theme, toggleTheme, libroNombre }: { theme: 'claro' | 'oscuro', toggleTheme: () => void, libroNombre: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("1");
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<'pagina' | 'scroll' | 'libro'>('libro');
  const flipBookRef = useRef<any>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  usePanOnDrag(viewerRef);

  useEffect(() => {
    if (isMobile) {
      setViewMode('scroll');
      setScale(0.8);
    } else {
      setViewMode('libro');
      setScale(1);
    }
  }, [isMobile]);

  useEffect(() => { setInputPage(String(currentPage)); }, [currentPage]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => { setNumPages(numPages); };
  const onFlip = (e: { data: number }) => { setCurrentPage(e.data + 1); };

  const goToPrevPage = () => {
    if (viewMode === 'libro') { flipBookRef.current?.pageFlip()?.flipPrev(); } 
    else { setCurrentPage(p => Math.max(1, p - 1)); }
  };
  const goToNextPage = () => {
    if (viewMode === 'libro') { flipBookRef.current?.pageFlip()?.flipNext(); } 
    else { if (numPages) { setCurrentPage(p => Math.min(numPages, p + 1)); } }
  };
  const goToPage = (pageNum: number) => {
    if (viewMode === 'libro') { flipBookRef.current?.pageFlip()?.turnToPage(pageNum - 1); } 
    else if (viewMode === 'scroll') { document.getElementById(`pdf-page-${pageNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else { setCurrentPage(pageNum); }
  };
  const handlePageInputSubmit = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        const pageNum = parseInt(inputPage, 10);
        if (numPages && pageNum >= 1 && pageNum <= numPages) { goToPage(pageNum); }
    }
  };
  const changeZoom = (factor: number) => setScale(s => Math.max(0.5, Math.min(s + factor, 2.5)));

  const PAGE_WIDTH = 450;
  const PAGE_HEIGHT = 636;

  return (
    <>
      <div 
        ref={viewerRef}
        className={`w-full h-full overflow-auto p-8 transition-colors duration-300 flex justify-center no-scrollbar 
        ${theme === 'claro' ? 'bg-slate-200' : 'bg-gray-800'} 
        ${viewMode === 'scroll' || isMobile ? 'items-start' : 'items-center'}`}
        style={{ cursor: 'grab' }}
      >
          <Document
            file="/dummy.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className={`text-center text-lg ${theme === 'oscuro' && 'text-white'}`}>Cargando documento...</p>}
            error={<p className="text-center text-red-500">Error al cargar el PDF.</p>}
          >
            {!numPages ? null : (
              <motion.div animate={{ scale: scale }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="pt-4">
                {viewMode === 'libro' && !isMobile ? (
                  <div style={{ width: PAGE_WIDTH * 2, height: PAGE_HEIGHT }}>
                    <HTMLFlipBook width={PAGE_WIDTH} height={PAGE_HEIGHT} ref={flipBookRef} onFlip={onFlip} className="shadow-2xl mx-auto" showCover={true}>
                      {Array.from(new Array(numPages), (el, index) => (
                        <PaginaPDF key={`page_${index + 1}`} pageNumber={index + 1} width={PAGE_WIDTH} className={theme === 'oscuro' ? 'invert' : ''} />
                      ))}
                    </HTMLFlipBook>
                  </div>
                ) : viewMode === 'scroll' || isMobile ? (
                  <div className="flex flex-col items-center gap-4">
                    {Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_${index + 1}`} id={`pdf-page-${index + 1}`} className="shadow-lg">
                        <PaginaPDF pageNumber={index + 1} width={isMobile ? 320 : PAGE_WIDTH * 0.9} className={theme === 'oscuro' ? 'invert' : ''}/>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ width: PAGE_WIDTH }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <PaginaPDF pageNumber={currentPage} width={PAGE_WIDTH} className={theme === 'oscuro' ? 'invert' : ''} />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </Document>
      </div>

      <motion.div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95%] flex items-center justify-between gap-4 p-2 bg-blue-950/80 backdrop-blur-sm text-white rounded-lg shadow-lg flex-wrap"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {isMobile ? (
          <div className="flex items-center justify-between gap-2 w-full px-2">
              <button onClick={goToPrevPage} className="p-2 rounded-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50"><FaChevronLeft size={16} /></button>
              <div>
                  <input type="number" value={inputPage} onChange={e => setInputPage(e.target.value)} onKeyDown={handlePageInputSubmit} className="w-12 text-center bg-blue-800 rounded border border-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  <span className="text-sm"> / {numPages}</span>
              </div>
              <button onClick={goToNextPage} className="p-2 rounded-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50"><FaChevronRight size={16} /></button>
              <div className="flex-grow"></div>
              <button onClick={toggleTheme} className="p-2 rounded-full bg-blue-900 hover:bg-blue-800" title="Cambiar Tema">
                  {theme === 'claro' ? <FaMoon size={18} /> : <FaSun size={18} />}
              </button>
          </div>
        ) : (
            <>
              <div className="flex items-center gap-4 border-r border-white/20 pr-4">
                  <span className="font-semibold text-sm truncate max-w-[200px]">{libroNombre}</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-900 p-1 rounded">
                  <button onClick={() => setViewMode('pagina')} className={`p-1.5 rounded ${viewMode === 'pagina' ? 'bg-cyan-500' : 'hover:bg-blue-800'}`} title="Página Única"><FaFile /></button>
                  <button onClick={() => setViewMode('scroll')} className={`p-1.5 rounded ${viewMode === 'scroll' ? 'bg-cyan-500' : 'hover:bg-blue-800'}`} title="Desplazamiento Vertical"><FaStream /></button>
                  <button onClick={() => setViewMode('libro')} className={`p-1.5 rounded ${viewMode === 'libro' ? 'bg-cyan-500' : 'hover:bg-blue-800'}`} title="Vista de Libro"><FaBook /></button>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={goToPrevPage} className="p-1.5 rounded bg-blue-900 hover:bg-blue-800" disabled={viewMode === 'scroll'}><FaChevronLeft /></button>
                  <div>
                      <input type="number" value={inputPage} onChange={e => setInputPage(e.target.value)} onKeyDown={handlePageInputSubmit} className="w-12 text-center bg-blue-800 rounded border border-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      <span> / {numPages}</span>
                  </div>
                  <button onClick={goToNextPage} className="p-1.5 rounded bg-blue-900 hover:bg-blue-800" disabled={viewMode === 'scroll'}><FaChevronRight /></button>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => changeZoom(-0.1)} className="p-1.5 rounded bg-blue-900 hover:bg-blue-800"><FaSearchMinus /></button>
                  <span className="w-12 text-center text-sm">{(scale * 100).toFixed(0)}%</span>
                  <button onClick={() => changeZoom(0.1)} className="p-1.5 rounded bg-blue-900 hover:bg-blue-800"><FaSearchPlus /></button>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={toggleTheme} className="p-1.5 rounded bg-blue-900 hover:bg-blue-800" title="Cambiar Tema">
                      {theme === 'claro' ? <FaMoon /> : <FaSun />}
                  </button>
                  <button onClick={() => window.close()} className="p-1.5 rounded bg-red-500 hover:bg-red-600" title="Cerrar Lector">
                      <FaTimes />
                  </button>
              </div>
            </>
        )}
      </motion.div>
    </>
  );
}


// --- Componente principal de la página de lectura ---
export default function LeerLibroPage() { // Se eliminan las props 'params'
  const [libro, setLibro] = useState<LibroInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'claro' | 'oscuro'>('claro');
  const toggleTheme = () => setTheme(t => (t === 'claro' ? 'oscuro' : 'claro'));

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchLibroInfo = async () => {
      // MEJORA: Se añade una URL de respaldo para desarrollo local
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:4000';
      try {
        const res = await fetch(`${apiUrl}/api/libros/${id}`);
        const json: SingleLibroApiResponse = await res.json();
          if (json.data && json.data.attributes) {
              setLibro({ nombre: json.data.attributes.nombre });
          }
        setLibro({ nombre: json.data.attributes.nombre });
      } catch (error) {
        console.error("Error al cargar la información del libro:", error);
        setLibro({ nombre: "Documento de Muestra" });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchLibroInfo();
    } else {
      setLoading(false);
      setLibro({ nombre: "Documento de Muestra" });
    }
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-white">Cargando...</div>;
  }

  return (
    <div className={`h-screen w-screen flex flex-col transition-colors duration-300 overflow-hidden ${theme === 'claro' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex-grow flex items-center justify-center overflow-hidden">
            <VisorPDF theme={theme} toggleTheme={toggleTheme} libroNombre={libro?.nombre || "Documento"} />
        </div>
    </div>
  );
}
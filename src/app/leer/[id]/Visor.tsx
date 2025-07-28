// Archivo: app/leer/[id]/Visor.tsx

'use client'

import { useState, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Configuración del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// --- INTERFACES PARA TIPADO ---
// 1. Definimos la forma del objeto que maneja el libro (`react-pageflip`).
//    Esto nos permite reemplazar `any` en la referencia `flipBookRef`.
interface FlipBookActions {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
  };
}

// Se usa `forwardRef` para que el componente `PaginaPDF` pueda recibir una `ref`.
const PaginaPDF = forwardRef<HTMLDivElement, { pageNumber: number }>(({ pageNumber }, ref) => {
  return (
    <div ref={ref} className="bg-white shadow-inner flex items-center justify-center">
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        loading={<div className="p-4">Cargando página...</div>}
      />
    </div>
  );
});
PaginaPDF.displayName = 'PaginaPDF'; // Buena práctica al usar forwardRef

export default function Visor() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  // 2. Usamos nuestra interfaz para darle un tipo específico a la referencia. ¡Adiós 'any'!
  const flipBookRef = useRef<FlipBookActions | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const irAPaginaSiguiente = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const irAPaginaAnterior = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };
  
  // 3. Definimos el tipo del evento 'e'. ¡Adiós al segundo 'any'!
  const enCambioDePagina = (e: { data: number }) => {
    setCurrentPage(e.data);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Document
        file="/dummy.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<p>Cargando documento...</p>}
        // 4. Corregimos los apóstrofes para que no den error en el build.
        error={<p className="text-red-500">Error: Asegúrate que {"'"}dummy.pdf{"'"} y {"'"}pdf.worker.min.js{"'"} están en la carpeta /public.</p>}
      >
        {numPages ? (
          <>
            <div className="flex items-center justify-center p-4">
              <HTMLFlipBook
                width={450}
                height={636}
                ref={flipBookRef as any} // Se mantiene 'as any' aquí porque la librería no exporta un tipo para la ref directamente, pero ya lo controlamos nosotros.
                onFlip={enCambioDePagina}
                className="shadow-2xl"
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <PaginaPDF key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </HTMLFlipBook>
            </div>

            <div className="w-full max-w-lg flex items-center justify-center gap-4 mt-4 p-2 bg-gray-800 text-white rounded-lg shadow-lg">
              <button onClick={irAPaginaAnterior} className="p-2 rounded bg-gray-700 hover:bg-gray-600"><FaChevronLeft /></button>
              <span>Página {currentPage + 1} de {numPages}</span>
              <button onClick={irAPaginaSiguiente} className="p-2 rounded bg-gray-700 hover:bg-gray-600"><FaChevronRight /></button>
            </div>
          </>
        ) : null}
      </Document>
    </div>
  );
}
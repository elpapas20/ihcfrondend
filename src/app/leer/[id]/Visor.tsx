// Archivo: app/leer/[id]/Visor.tsx

'use client'

import { useState, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Configuración del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

const PaginaPDF = ({ pageNumber }: { pageNumber: number }) => {
  return (
    <div className="bg-white shadow-inner flex items-center justify-center">
      <Page
        pageNumber={pageNumber}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        loading={<div className="p-4">Cargando página...</div>}
      />
    </div>
  );
};

export default function Visor() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBookRef = useRef<any>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const irAPaginaSiguiente = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const irAPaginaAnterior = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };
  
  const enCambioDePagina = (e: any) => {
    setCurrentPage(e.data);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Document
        file="/dummy.pdf"
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<p>Cargando documento...</p>}
        error={<p className="text-red-500">Error: Asegúrate que 'dummy.pdf' y 'pdf.worker.min.js' están en la carpeta /public.</p>}
      >
        {numPages ? (
          <>
            <div className="flex items-center justify-center p-4">
              <HTMLFlipBook
                width={450}
                height={636}
                ref={flipBookRef}
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
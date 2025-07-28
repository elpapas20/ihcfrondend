'use client'

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function VisorPDF() {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function cambiarPagina(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function paginaAnterior() {
    if (pageNumber > 1) {
      cambiarPagina(-1);
    }
  }

  function paginaSiguiente() {
    if (numPages && pageNumber < numPages) {
      cambiarPagina(1);
    }
  }

  return (
    <div>
      <div className="flex justify-center border border-gray-300 bg-gray-200">
        <Document
          file="/dummy.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-4 text-center">Cargando PDF...</div>}
          // ✅ CORRECCIÓN: Se reemplazan los apóstrofes ' por {"'"}
          error={<div className="p-4 text-center text-red-500">Error al cargar el PDF. Asegúrate de que el archivo {"'"}dummy.pdf{"'"} esté en la carpeta /public.</div>}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 p-2 bg-gray-100 rounded-b-lg shadow-inner">
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={paginaAnterior}
          className="px-4 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span>
          Página {pageNumber} de {numPages || '--'}
        </span>
        <button
          type="button"
          disabled={!numPages || pageNumber >= numPages}
          onClick={paginaSiguiente}
          className="px-4 py-1 bg-indigo-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
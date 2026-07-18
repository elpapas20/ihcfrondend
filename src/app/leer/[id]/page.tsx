'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar dinámicamente el visor para desactivar Server-Side Rendering (SSR)
// y evitar fallos con la librería react-pdf (canvas de Node.js).
const VisorCompleto = dynamic(() => import('./VisorCompleto'), { ssr: false });

interface LibroInfo {
  nombre: string;
  pdfUrl?: string | null;
}
interface SingleLibroAttributes {
  nombre: string;
  archivo_pdf?: {
    url: string;
    data?: {
      attributes?: {
        url: string;
      }
    }
  }
}
interface SingleLibroData {
  id: number;
  attributes?: SingleLibroAttributes;
  nombre?: string;
  archivo_pdf?: {
    url: string;
    data?: {
      attributes?: {
        url: string;
      }
    }
  }
}
interface SingleLibroApiResponse {
  data: SingleLibroData;
}

export default function LeerLibroPage() {
  const [libro, setLibro] = useState<LibroInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'claro' | 'oscuro'>('claro');
  const toggleTheme = () => setTheme(t => (t === 'claro' ? 'oscuro' : 'claro'));

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchLibroInfo = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      try {
        const res = await fetch(`${apiUrl}/api/libros/${id}?populate=*`);
        const json: SingleLibroApiResponse = await res.json();
        
        if (json.data) {
          const data = json.data;
          // Soporta formatos anidados (Strapi v4) y planos (Strapi v5)
          const nombre = data.nombre || data.attributes?.nombre || "Cálculo Vectorial";
          
          const rawPdfUrl = data.archivo_pdf?.url || 
                            data.archivo_pdf?.data?.attributes?.url || 
                            data.attributes?.archivo_pdf?.url || 
                            data.attributes?.archivo_pdf?.data?.attributes?.url || 
                            null;

          const formattedPdfUrl = rawPdfUrl 
            ? (rawPdfUrl.startsWith('http') ? rawPdfUrl : `${apiUrl}${rawPdfUrl}`) 
            : null;
          
          setLibro({ 
            nombre, 
            pdfUrl: formattedPdfUrl
          });
        } else {
          setLibro({ nombre: "Cálculo Vectorial", pdfUrl: null });
        }
      } catch (error) {
        console.error("Error al cargar la información del libro:", error);
        setLibro({ nombre: "Cálculo Vectorial", pdfUrl: null });
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchLibroInfo();
    } else {
      setLoading(false);
      setLibro({ nombre: "Cálculo Vectorial", pdfUrl: null });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f5f2eb] text-[#001f3f] font-semibold text-lg">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="animate-pulse">Cargando lector...</span>
        </div>
      </div>
    );
  }

  return (
    <VisorCompleto 
      theme={theme} 
      toggleTheme={toggleTheme} 
      libroNombre={libro?.nombre || "Cálculo Vectorial"} 
      pdfUrl={libro?.pdfUrl}
    />
  );
}
// src/app/bienvenida/colecciones/ColeccionesCliente.tsx

'use client'

import { useEffect, useState, useMemo, useRef, KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTimes, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronRight, 
  FaDownload, 
  FaBookOpen
} from 'react-icons/fa'

// --- INTERFACES ---
interface Libro {
  id: number;
  documentId: string;
  nombre: string;
  portada: string;
  categoriaNombre: string;
  descripcion?: string;
  pdfUrl?: string | null;
  disponible: boolean;
}
interface RichTextChild {
  type: 'text';
  text: string;
}
interface RichTextBlock {
  type: 'paragraph';
  children: RichTextChild[];
}
interface PortadaFromAPI {
  url: string;
  formats?: {
    small?: { url: string };
  };
}
interface CategoriaFromAPI {
  nombre: string;
}
interface LibroFromAPI {
  id: number;
  documentId?: string;
  nombre: string;
  disponible?: boolean;
  descripcion: RichTextBlock[];
  portada: PortadaFromAPI | null;
  categorias: CategoriaFromAPI[];
  archivo_pdf?: {
    url: string;
    data?: {
      attributes?: {
        url: string;
      }
    }
  } | null;
  attributes?: {
    documentId?: string;
    nombre?: string;
    disponible?: boolean;
    descripcion?: RichTextBlock[];
    portada?: {
      data?: {
        attributes?: PortadaFromAPI;
      }
    };
    categorias?: {
      data?: Array<{ attributes?: CategoriaFromAPI }>;
    };
    archivo_pdf?: {
      data?: {
        attributes?: {
          url: string;
        }
      }
    };
  };
}
interface ApiResponse {
  data: LibroFromAPI[];
}

// --- SUB-COMPONENTES ---
function LibroModal({ libro, onClose, todosLosLibros }: { libro: Libro; onClose: () => void; todosLosLibros: Libro[] }) {
    const [reservaCodigo, setReservaCodigo] = useState<string | null>(null);

    const libsRelacionados = todosLosLibros
      .filter(item => item.categoriaNombre === libro.categoriaNombre && item.id !== libro.id)
      .slice(0, 5);

    const handleDownload = () => {
        if (libro.pdfUrl) {
            // Descargar el PDF cargado de Strapi
            const link = document.createElement('a');
            link.href = libro.pdfUrl;
            link.download = `${libro.nombre.replace(/ /g, "_")}.pdf`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback a descarga de ficha de texto si no hay PDF
            const contenido = `Título: ${libro.nombre}\nCategoría: ${libro.categoriaNombre}\n\nDescripción:\n${libro.descripcion || 'No disponible.'}`;
            const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${libro.nombre.replace(/ /g, "_")}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const handleReservar = () => {
        // Generar un código aleatorio de 10 dígitos
        const codigo = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        setReservaCodigo(codigo);
    };

    return (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              transition={{ type: 'spring', stiffness: 300, damping: 30 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col gap-6 p-6 relative overflow-y-auto max-h-[90vh] border border-slate-100"
            >
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition rounded-full p-1.5 hover:bg-slate-100" 
                aria-label="Cerrar modal"
              >
                <FaTimes size={18} />
              </button>

              <div className="flex flex-col md:flex-row gap-6 mt-4 md:mt-0 animate-fade-in">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <Image src={libro.portada} alt={libro.nombre} width={200} height={300} className="object-cover rounded-xl shadow-md mx-auto border border-black/5" />
                </div>
                <div className="flex flex-col flex-grow">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 leading-snug">{libro.nombre}</h2>
                  <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full self-start mb-4">{libro.categoriaNombre}</span>
                  
                  {reservaCodigo ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center flex flex-col items-center justify-center my-auto animate-scale-up">
                      <span className="text-3xl mb-2">🎉</span>
                      <p className="text-teal-900 font-extrabold text-base mb-1">¡Reserva Física Realizada!</p>
                      <p className="text-teal-700 text-xs mb-4">Gracias por reservar. Por favor, acérquese a la biblioteca para recoger su ejemplar físico.</p>
                      <div className="bg-white border border-teal-100 rounded-lg py-2 px-4 shadow-sm font-mono text-lg font-bold text-teal-950 tracking-wider mb-2">
                        CÓDIGO: {reservaCodigo}
                      </div>
                      <button 
                        onClick={() => setReservaCodigo(null)} 
                        className="text-xs text-teal-600 hover:underline font-semibold mt-2"
                      >
                        Volver
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-slate-600 text-justify text-sm md:text-base space-y-3 mb-6 max-h-[160px] overflow-y-auto pr-1">
                        {libro.descripcion?.split('\n').map((p, i) => <p key={i}>{p}</p>) || 'No hay descripción disponible.'}
                      </div>
                      
                      <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                        {/* Fila 1: Descargar y Leer en línea */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button 
                            onClick={handleDownload} 
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all active:scale-95 text-sm"
                          >
                            <FaDownload /> {libro.pdfUrl ? 'Descargar Libro' : 'Descargar Ficha'}
                          </button>
                          <Link 
                            href={`/leer/${libro.documentId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-xl shadow-md hover:bg-teal-700 transition-all active:scale-95 text-sm"
                          >
                            <FaBookOpen /> Leer en línea
                          </Link>
                        </div>
                        
                        {/* Fila 2: Reservar físicamente */}
                        <div className="mt-1">
                          {libro.disponible ? (
                            <button 
                              onClick={handleReservar}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95 text-sm"
                            >
                              Reservar físicamente
                            </button>
                          ) : (
                            <div className="flex flex-col gap-1.5 text-center">
                              <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-150 py-1.5 rounded-lg">
                                ⚠️ No disponible para su reserva física
                              </p>
                              <button 
                                disabled
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 font-semibold rounded-xl border border-slate-200 cursor-not-allowed text-sm"
                              >
                                Reservar físicamente
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {libsRelacionados.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-700 mb-4">Más en esta categoría</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {libsRelacionados.map(rel => (
                      <div 
                        key={rel.id} 
                        className="group cursor-pointer" 
                        title={rel.nombre}
                      >
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-sm transition-all group-hover:shadow-lg group-hover:-translate-y-1 bg-slate-200">
                          <Image src={rel.portada} alt={rel.nombre} layout="fill" objectFit="cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
    );
}

function LibroCard({ libro, onSelect }: { libro: Libro; onSelect: () => void }) {
    return (
        <motion.div className="flex-shrink-0 group cursor-pointer" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} onClick={onSelect} layout>
            <motion.div className="w-full h-[210px] md:h-[240px] relative rounded-xl overflow-hidden shadow-md bg-slate-200 transition-all duration-300 hover:shadow-xl border border-black/5" whileHover={{ y: -8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                <Image src={libro.portada} alt={libro.nombre} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{libro.nombre}</h3>
                    <p className="text-teal-300 text-xs mt-1 font-semibold">Ver detalles</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

function CategoriaEstante({ categoria, libros, onLibroSelect }: { categoria: string; libros: Libro[]; onLibroSelect: (libro: Libro) => void; }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [puedeScrollIzquierda, setPuedeScrollIzquierda] = useState(false);
    const [puedeScrollDerecha, setPuedeScrollDerecha] = useState(true);

    const revisarScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setPuedeScrollIzquierda(scrollLeft > 1);
            setPuedeScrollDerecha(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            revisarScroll();
            currentRef.addEventListener('scroll', revisarScroll);
            window.addEventListener('resize', revisarScroll);
            return () => {
                if (currentRef) { currentRef.removeEventListener('scroll', revisarScroll); }
                window.removeEventListener('resize', revisarScroll);
            };
        }
    }, [libros]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = (direction === 'left' ? -1 : 1) * (scrollRef.current.clientWidth * 0.8);
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.section key={categoria} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5 }} layout className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-teal-500 pl-3">{categoria}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => scroll('left')} 
                  disabled={!puedeScrollIzquierda} 
                  className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-90" 
                  aria-label="Scroll Izquierda"
                >
                  <FaChevronLeft className="text-slate-600" size={14} />
                </button>
                <button 
                  onClick={() => scroll('right')} 
                  disabled={!puedeScrollDerecha} 
                  className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-90" 
                  aria-label="Scroll Derecha"
                >
                  <FaChevronRight className="text-slate-600" size={14} />
                </button>
              </div>
            </div>
            <div className="relative">
              <motion.div 
                ref={scrollRef} 
                className="flex gap-4 md:gap-6 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth snap-x snap-mandatory" 
                style={{ scrollbarWidth: 'none' }} 
                layout
              >
                {libros.map((libro) => (
                  <div key={libro.id} className="snap-center md:snap-start flex-shrink-0 w-[150px] md:w-[160px]">
                    <LibroCard libro={libro} onSelect={() => onLibroSelect(libro)} />
                  </div>
                ))}
              </motion.div>
            </div>
        </motion.section>
    );
}

function SkeletonCard() {
    return (
      <div className="w-[150px] md:w-[160px] flex-shrink-0">
        <div className="w-full h-[225px] md:h-[240px] bg-slate-200 rounded-xl animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded mt-3 w-3/4 mx-auto animate-pulse"></div>
      </div>
    );
}

// --- COMPONENTE PRINCIPAL DEL CLIENTE ---
export default function ColeccionesCliente() {
  const [todosLosLibros, setTodosLosLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
        const res = await fetch(`${apiUrl}/api/libros?populate=*`);
        if (!res.ok) {
          throw new Error(`Error del servidor: ${res.status}`);
        }
        
        const json: ApiResponse = await res.json();

        if (json.data && Array.isArray(json.data)) {
          const librosProcesados: Libro[] = json.data.map((libro: LibroFromAPI) => {
            
            const descripcionPlano = libro.descripcion?.flatMap(
              (block: RichTextBlock) => block.children.map((child: RichTextChild) => child.text || '')
            ).join('\n') || '';

            const attributes = libro.attributes;
            const finalNombre = libro.nombre || attributes?.nombre || 'Libro sin título';
            const finalDocId = libro.documentId || attributes?.documentId || String(libro.id);

            // Resolución de portada
            let portadaUrl = libro.portada?.formats?.small?.url || libro.portada?.url;
            if (!portadaUrl && attributes?.portada) {
              const apiPortada = attributes.portada.data?.attributes;
              portadaUrl = apiPortada?.formats?.small?.url || apiPortada?.url;
            }
            const finalPortadaUrl = portadaUrl ? `${apiUrl}${portadaUrl}` : '/uploads/default.jpg';

            // Resolución de categoría
            let categoria = 'Sin categoría';
            if (libro.categorias?.[0]?.nombre) {
              categoria = libro.categorias[0].nombre;
            } else if (attributes?.categorias?.data?.[0]?.attributes?.nombre) {
              categoria = attributes.categorias.data[0].attributes.nombre;
            }

            // Resolución de archivo PDF
            let pdfPath = libro.archivo_pdf?.url || libro.archivo_pdf?.data?.attributes?.url;
            if (!pdfPath && attributes?.archivo_pdf?.data?.attributes?.url) {
              pdfPath = attributes.archivo_pdf.data.attributes.url;
            }
            const finalPdfUrl = pdfPath ? `${apiUrl}${pdfPath}` : null;

            // Resolución de disponibilidad
            const finalDisponible = libro.disponible !== undefined
              ? libro.disponible
              : (attributes?.disponible !== undefined ? attributes.disponible : true);
          
            return {
              id: libro.id,
              documentId: finalDocId,
              nombre: finalNombre,
              portada: finalPortadaUrl,
              categoriaNombre: categoria,
              descripcion: descripcionPlano.trim(),
              pdfUrl: finalPdfUrl,
              disponible: finalDisponible
            };
          });

          setTodosLosLibros(librosProcesados);
        } else {
            console.error("La respuesta de la API no tiene el formato esperado:", json);
            setTodosLosLibros([]);
        }

      } catch (error) { 
        console.error('Error al cargar libros:', error); 
        setTodosLosLibros([]);
      }
      finally { 
        setLoading(false); 
      }
    };
    fetchLibros();
  }, []);

  const categoriasUnicas = useMemo(() => Array.from(new Set(todosLosLibros.map(l => l.categoriaNombre))), [todosLosLibros]);
  
  useEffect(() => {
      const filtroActual = searchParams.get('busqueda') || '';
      setBusqueda(filtroActual);
  }, [searchParams]);

  const filtroBusqueda = searchParams.get('busqueda') || '';
  const esVistaDeCategoria = !loading && filtroBusqueda && categoriasUnicas.some(c => c.toLowerCase() === filtroBusqueda.toLowerCase());

  const librosDeCategoriaUnica = useMemo(() => {
      if (!esVistaDeCategoria) return [];
      return todosLosLibros.filter(
          libro => libro.categoriaNombre.toLowerCase() === filtroBusqueda.toLowerCase()
      );
  }, [esVistaDeCategoria, filtroBusqueda, todosLosLibros]);
  
  const librosPorCategoriaGeneral = useMemo(() => {
      if (esVistaDeCategoria) return {};
      const librosAProcesar = filtroBusqueda
          ? todosLosLibros.filter(libro => libro.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()))
          : todosLosLibros;

      const agrupado: Record<string, Libro[]> = {};
      for (const libro of librosAProcesar) {
          if (!agrupado[libro.categoriaNombre]) { agrupado[libro.categoriaNombre] = []; }
          agrupado[libro.categoriaNombre].push(libro);
      }
      return agrupado;
  }, [esVistaDeCategoria, filtroBusqueda, todosLosLibros]);
  
  const handleBuscar = () => {
      const params = new URLSearchParams(searchParams.toString());
      if (busqueda.trim()) {
          params.set('busqueda', busqueda.trim());
      } else {
          params.delete('busqueda');
      }
      router.push(`/bienvenida/colecciones?${params.toString()}`);
  };
  
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => { 
      if (event.key === 'Enter') { handleBuscar(); } 
  };

  return (
    <>
      {libroSeleccionado && (
        <LibroModal 
          libro={libroSeleccionado} 
          onClose={() => setLibroSeleccionado(null)} 
          todosLosLibros={todosLosLibros} 
        />
      )}
      <main className="min-h-screen px-4 py-8 bg-slate-50 text-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 text-center tracking-tight">Colecciones</h1>
            <p className="text-lg text-slate-500 text-center mb-8">Explora nuestro catálogo organizado por temas</p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <div className="relative w-full max-w-lg">
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar en las colecciones..."
                    className="w-full px-5 py-2.5 pl-12 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm md:text-base"
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              onClick={handleBuscar}
              className="px-6 py-2.5 bg-[#001f3f] text-white font-semibold rounded-full shadow-md hover:bg-[#002d5c] transition-all active:scale-95"
            >
              Buscar
            </button>
          </div>

          <div className="space-y-12">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                  <section key={i} className="p-4">
                      <div className="h-8 bg-slate-300 rounded w-1/3 mb-4 animate-pulse"></div>
                      <div className="flex gap-4 overflow-x-auto pb-2 -ml-4 pl-4">
                          {Array.from({ length: 5 }).map((_, j) => <SkeletonCard key={j} />)}
                      </div>
                  </section>
              ))
            ) : esVistaDeCategoria ? (
              <div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center md:text-left">
                    Colección: <span className="text-teal-600">{filtroBusqueda}</span>
                  </h1>
                  <button 
                    onClick={() => router.push('/bienvenida/colecciones')}
                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-full transition active:scale-95 text-sm flex-shrink-0"
                  >
                    &larr; Volver a todas las colecciones
                  </button>
                </div>
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {librosDeCategoriaUnica.map(libro => (
                    <LibroCard key={libro.id} libro={libro} onSelect={() => setLibroSeleccionado(libro)} />
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(librosPorCategoriaGeneral).map(([categoria, libros]) => (
                  <CategoriaEstante
                    key={categoria}
                    categoria={categoria}
                    libros={libros}
                    onLibroSelect={setLibroSeleccionado}
                  />
                ))}
                {Object.keys(librosPorCategoriaGeneral).length === 0 && (
                   <p className="text-center text-slate-500 text-lg py-8">
                      {filtroBusqueda
                        ? <>No se encontraron resultados para <span className="font-semibold text-teal-600">{"\""}{filtroBusqueda}{"\""}</span>.</>
                        : "No hay libros para mostrar."
                      }
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
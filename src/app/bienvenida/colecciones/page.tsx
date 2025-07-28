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
  FaArrowRight, 
  FaPrint, 
  FaDownload, 
  FaShoppingBasket,
  FaBookOpen
} from 'react-icons/fa'

// INTERFAZ DEL LIBRO
interface Libro {
  id: number;
  nombre: string;
  portada: string;
  categoriaNombre: string;
  descripcion?: string;
}

// HOOK PARA DETECTAR DISPOSITIVO MÓVIL
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

// COMPONENTE MODAL
function LibroModal({ 
  libro, 
  onClose, 
  todosLosLibros 
}: { 
  libro: Libro; 
  onClose: () => void; 
  todosLosLibros: Libro[];
}) {
  const librosRelacionados = todosLosLibros
    .filter(item => item.categoriaNombre === libro.categoriaNombre && item.id !== libro.id)
    .slice(0, 5);

  const handleDownloadTxt = () => {
    // 1. Prepara el contenido del archivo
    const contenido = `Título: ${libro.nombre}\nCategoría: ${libro.categoriaNombre}\n\nDescripción:\n${libro.descripcion || 'No disponible.'}`;
    
    // 2. Crea un objeto Blob (como un archivo en memoria)
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    
    // 3. Crea una URL temporal para el Blob
    const url = URL.createObjectURL(blob);
    
    // 4. Crea un enlace <a> invisible para iniciar la descarga
    const link = document.createElement('a');
    link.href = url;
    // Formatea el nombre del archivo, ej: "El_Quijote.txt"
    link.download = `${libro.nombre.replace(/ /g, "_")}.txt`;
    
    // 5. Simula un clic en el enlace y luego lo elimina
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 6. Libera la URL de la memoria
    URL.revokeObjectURL(url);
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
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col gap-6 p-6 relative overflow-y-auto max-h-[90vh]"
        >
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 transition rounded-full p-1" aria-label="Cerrar modal">
            <FaTimes size={20} />
          </button>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <Image src={libro.portada} alt={libro.nombre} width={200} height={300} className="object-cover rounded-lg shadow-lg mx-auto" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{libro.nombre}</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full self-start mb-4">{libro.categoriaNombre}</span>
              <div className="text-slate-600 text-justify space-y-3 mb-6">
                {libro.descripcion?.split('\n').map((p, i) => <p key={i}>{p}</p>) || 'No hay descripción disponible.'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-4 border-t">
                  <button onClick={handleDownloadTxt} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all active:scale-95">
                      <FaDownload /> Descargar
                  </button>
                  <Link 
                    href={`/leer/${libro.id}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                  >
                      <FaBookOpen /> Leer en línea
                  </Link>
              </div>
            </div>
          </div>

          {librosRelacionados.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Más en esta categoría</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {librosRelacionados.map(relacionado => (
                  <div key={relacionado.id} className="group cursor-pointer" title={relacionado.nombre}>
                    <div className="aspect-[2/3] relative rounded-md overflow-hidden shadow-sm transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                      <Image src={relacionado.portada} alt={relacionado.nombre} layout="fill" objectFit="cover" />
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

// COMPONENTE TARJETA DE LIBRO
function LibroCard({ libro, onSelect }: { libro: Libro; onSelect: () => void }) {
    return (
        <motion.div
            className="flex-shrink-0 group cursor-pointer"
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            onClick={onSelect}
            layout
        >
            <motion.div
                className="w-full h-[210px] md:h-[240px] relative rounded-lg overflow-hidden shadow-md bg-slate-200 transition-all duration-300 hover:shadow-xl"
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
                <Image src={libro.portada} alt={libro.nombre} layout="fill" objectFit="cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{libro.nombre}</h3>
                    <p className="text-indigo-200 text-xs mt-1">Ver detalles</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// COMPONENTE PARA EL ESTANTE DE LIBROS (CARRUSEL)
function CategoriaEstante({
  categoria,
  libros,
  onLibroSelect
}: {
  categoria: string;
  libros: Libro[];
  onLibroSelect: (libro: Libro) => void;
}) {
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
        if (currentRef) {
          currentRef.removeEventListener('scroll', revisarScroll);
        }
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
    <motion.section
      key={categoria}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{categoria}</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')} 
            disabled={!puedeScrollIzquierda}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll Izquierda"
          >
            <FaChevronLeft className="text-slate-600" />
          </button>
          <button 
            onClick={() => scroll('right')} 
            disabled={!puedeScrollDerecha}
            className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Scroll Derecha"
          >
            <FaChevronRight className="text-slate-600" />
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


// COMPONENTE ESQUELETO DE CARGA
function SkeletonCard() {
    return (
        <div className="w-[150px] md:w-[160px] flex-shrink-0">
            <div className="w-full h-[225px] md:h-[240px] bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded mt-3 w-3/4 mx-auto animate-pulse"></div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function ColeccionesPage() {
  const [todosLosLibros, setTodosLosLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
  const [categoriasUnicas, setCategoriasUnicas] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const res = await fetch('https://ihcbackend.onrender.com/api/libros?populate=*');
        const json = await res.json();
        const libros: Libro[] = json.data.map((libro: any) => {
          const descripcionPlano = Array.isArray(libro.descripcion) ? libro.descripcion.flatMap((block: any) => Array.isArray(block.children) ? block.children.map((child: any) => child.text || '') : [] ).join(' ') : '';
          return {
            id: libro.id,
            nombre: libro.nombre,
            portada: libro.portada?.formats?.small?.url ? `https://ihcbackend.onrender.com${libro.portada.formats.small.url}` : `https://ihcbackend.onrender.com${libro.portada?.url || '/uploads/default.jpg'}`,
            categoriaNombre: libro.categorias?.[0]?.nombre || 'Sin categoría',
            descripcion: descripcionPlano.trim()
          };
        });
        setTodosLosLibros(libros);
        const categorias = new Set(libros.map(l => l.categoriaNombre));
        setCategoriasUnicas(Array.from(categorias));
      } catch (error) { console.error('Error al cargar libros:', error); }
      finally { setLoading(false); }
    };
    fetchLibros();
  }, []);

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
    const params = new URLSearchParams();
    if (busqueda.trim()) {
      params.set('busqueda', busqueda.trim());
    }
    router.push(`/bienvenida/colecciones?${params.toString()}`);
  };
  
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => { 
    if (event.key === 'Enter') { handleBuscar(); } 
  };

  return (
    <>
      {libroSeleccionado && <LibroModal libro={libroSeleccionado} onClose={() => setLibroSeleccionado(null)} todosLosLibros={todosLosLibros} />}

      <main className="min-h-screen px-4 py-8 bg-slate-50 text-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-center">Colecciones</h1>
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
                    className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              onClick={handleBuscar}
              className="px-6 py-2.5 bg-blue-900 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition-all active:scale-95"
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
                  <h1 className="text-3xl font-bold text-slate-800 text-center md:text-left">
                    Colección: <span className="text-indigo-600">{filtroBusqueda}</span>
                  </h1>
                  <button 
                    onClick={() => router.push('/bienvenida/colecciones')}
                    className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-300 transition flex-shrink-0"
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
                          ? <>No se encontraron resultados para <span className="font-semibold text-indigo-600">"{filtroBusqueda}"</span>.</>
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
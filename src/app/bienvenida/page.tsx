'use client'

import { useEffect, useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// Se crea una interfaz que coincide exactamente con tu estructura de datos
interface MiCategoriaDesdeApi {
  nombre?: string;
  attributes?: {
    nombre: string;
  };
  icono?: {
    url?: string;
  };
}

interface Tematica {
  nombre: string;
  icono: string | null;
}

export default function BienvenidaPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [tematicas, setTematicas] = useState<Tematica[]>([])
  const router = useRouter()
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('username')
    if (user) {
      setUsername(user)
      fetchCategorias()
    } else {
      router.push('/login')
    }
  }, [router])

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const apiUrl = 'https://ihcbackend.onrender.com';
      const res = await fetch(`${apiUrl}/api/categorias?populate=*`)
      const data = await res.json()

      if (!data?.data || !Array.isArray(data.data)) {
        console.error('Respuesta inesperada:', data)
        return
      }

      // Se usa la nueva interfaz y se mantiene tu lógica original de mapeo
      const items: Tematica[] = data.data.map((item: MiCategoriaDesdeApi) => ({
        nombre: item.nombre || item.attributes?.nombre || 'Sin nombre',
        icono: item.icono?.url ? `${apiUrl}${item.icono.url}` : null,
      }))

      setTematicas(items)
    } catch (error) {
      console.error('Error al conectar con Strapi:', error)
    } finally {
      setLoading(false);
    }
  }
  
  const handleSearch = () => {
    if (terminoBusqueda.trim() !== '') {
      router.push(`/bienvenida/colecciones?busqueda=${encodeURIComponent(terminoBusqueda)}`)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <svg className="animate-spin h-10 w-10 text-cyan-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center flex-grow text-center px-4 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-4">
        <Image src="/logo-biblioteca.png" alt="Logo Biblioteca Virtual" width={300} height={300} priority />
      </motion.div>

      <motion.p className="text-3xl md:text-4xl text-gray-700 font-semibold mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        Bienvenido, <strong>{username}</strong>
      </motion.p>

      <motion.section className="mb-12 w-full max-w-3xl bg-white/90 rounded-xl shadow-lg px-6 py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <p className="text-base mb-6 text-gray-700">
          Acceso a publicaciones y recursos de información orientados a la comunidad de estudiantes y docentes de la UNAM
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder="Buscar publicaciones..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-4 py-2 rounded-full border w-full sm:w-80 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button 
            onClick={handleSearch}
            className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-2 rounded-full transition duration-300 transform hover:scale-105"
          >
            Buscar
          </button>
        </div>
      </motion.section>

      <motion.section className="w-full max-w-screen-xl bg-white/90 rounded-lg p-6 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-xl font-semibold text-left mb-4">Categorías Temáticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tematicas.map((tema, index) => (
            <Link 
              key={index} 
              href={`/bienvenida/colecciones?busqueda=${encodeURIComponent(tema.nombre)}`}
              className="bg-gradient-to-br from-[#001f3f] to-cyan-600 text-white p-4 rounded-lg text-center shadow hover:scale-105 transition transform duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[120px]"
            >
              {tema.icono && (
                <Image src={tema.icono} alt={`Icono de ${tema.nombre}`} width={48} height={48} className="mb-2" />
              )}
              <span className="font-medium">{tema.nombre}</span>
            </Link>
          ))}
        </div>
      </motion.section>
    </main>
  )
}
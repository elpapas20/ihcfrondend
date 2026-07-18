'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
      const response = await axios.post(`${apiUrl}/api/auth/local`, {
        identifier,
        password,
      })
      const { user } = response.data
      localStorage.setItem('username', user.username)
      router.push('/bienvenida')
    } catch (err) {
      console.error('Error de login:', err)
      setError('Usuario o contraseña incorrectos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 text-black bg-cover bg-center relative"
      style={{ backgroundImage: "url('/fondo-biblioteca.png')" }}
    >
      {/* Overlay para oscurecer un poco el fondo e incrementar contraste */}
      <div className="absolute inset-0 bg-black/35 z-0"></div>

      <div className="bg-white/85 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl p-6 md:p-10 max-w-7xl w-full flex flex-col md:flex-row gap-12 z-10">
        <div className="w-full md:w-[32%] flex flex-col justify-center md:border-r border-gray-300/60 md:pr-10">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-biblioteca.png"
              alt="Logo UNAM"
              width={180}
              height={180}
              className="object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          <h2 className="text-xl font-extrabold mb-6 text-center text-slate-800 tracking-tight">Biblioteca UNAM - Ingrese</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 text-black">
            <input
              type="text"
              placeholder="Usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all duration-200"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-teal-600 focus:outline-none transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            
            {error && <p className="text-red-600 text-sm text-center font-semibold">{error}</p>}

            {isLoading ? (
              <div className="flex justify-center items-center h-12">
                <svg
                  className="animate-spin h-6 w-6 text-teal-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform active:scale-[0.98]"
              >
                Ingresar
              </button>
            )}
            <div className="text-right">
              <a 
                href="https://simuladoretiquetado.promperu.gob.pe/SimuladorWeb/Seguridad/RestorePassword" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-teal-800 hover:text-teal-600 hover:underline font-semibold"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
        </div>

        <div className="w-full md:w-[68%] pl-6 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4 text-center text-slate-800">Centro de Ayuda - Biblioteca Virtual</h2>

          <table className="w-full text-sm border border-gray-300 rounded-xl overflow-hidden text-black shadow-sm">
            <thead className="bg-[#001f3f] text-white text-left">
              <tr>
                <th className="p-3 w-2/3 border-b border-gray-350">¿Tienes dudas sobre...?</th>
                <th className="p-3 border-b border-gray-350">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white/70">
              <tr className="hover:bg-slate-100/50 transition-colors">
                <td className="p-3">
                  Matrícula, reserva de matrícula, cursos no habilitados, ficha de matrícula, ranking académico
                </td>
                <td className="p-3">
                  DASA<br />
                  dasa@unam.edu.pe<br />
                  ANEXO 302<br />
                  Celular: 953967519
                </td>
              </tr>
              <tr className="hover:bg-slate-100/50 transition-colors">
                <td className="p-3">Acceso a Biblioteca Virtual, libros disponibles, usuario y contraseña</td>
                <td className="p-3">
                  Moquegua: 964611430<br />
                  Ilo: 989895105
                </td>
              </tr>
              <tr className="hover:bg-slate-100/50 transition-colors">
                <td className="p-3">Horarios, docentes, secciones y turnos</td>
                <td className="p-3">Consulta directamente con tu Escuela Profesional</td>
              </tr>
              <tr className="hover:bg-slate-100/50 transition-colors">
                <td className="p-3">Problemas con sistema estudiante, aula virtual o correo institucional</td>
                <td className="p-3">Soporte Técnico / Informática</td>
              </tr>
              <tr className="hover:bg-slate-100/50 transition-colors">
                <td className="p-3 font-semibold text-teal-800">Contactos por Escuela Profesional</td>
                <td className="p-3">
                  GPDS: 945650473 | Minas: 945647065<br />
                  Agroindustrial: 945647154 | Civil: 923234699<br />
                  Sistemas: 945649660 | Ambiental: 945647792<br />
                  Pesquera: 945647542 | Administración: 936670981<br />
                  Medicina: Anexo 606 | Derecho: 975703540<br />
                  Contabilidad: 912374914 (Moquegua), 908892980 (Ilo)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
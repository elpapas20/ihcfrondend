'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post('https://ihcbackend.onrender.com/api/auth/local', {
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
      className="min-h-screen flex items-center justify-center px-4 py-10 text-black bg-cover bg-center"
      style={{ backgroundImage: "url('/fondo-biblioteca.png')" }}
    >
      <div className="bg-white/90 rounded-xl shadow-xl p-6 md:p-10 max-w-7xl w-full flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-[28%] flex flex-col justify-center border-r border-gray-300 pr-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo-biblioteca.png"
              alt="Logo UNAM"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>

          <h2 className="text-xl font-bold mb-4 text-center">Biblioteca UNAM - Ingrese</h2>

          <div className="space-y-4 text-black">
            <input
              type="text"
              placeholder="Usuario"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-cyan-600 outline-none"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded border border-gray-300 focus:ring-2 focus:ring-cyan-600 outline-none"
            />
            
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            {isLoading ? (
              <div className="flex justify-center items-center h-12">
                <svg
                  className="animate-spin h-6 w-6 text-cyan-600"
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
                onClick={handleLogin}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 rounded transition"
              >
                Ingresar
              </button>
              
            )}
            <div className="text-right">
              <a 
                href="https://simuladoretiquetado.promperu.gob.pe/SimuladorWeb/Seguridad/RestorePassword" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-cyan-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[72%] pl-6">
          <h2 className="text-xl font-bold mb-4 text-center">Centro de Ayuda - Biblioteca Virtual</h2>

          <table className="w-full text-sm border border-gray-300 rounded overflow-hidden text-black">
            <thead className="bg-[#001f3f] text-white text-left">
              <tr>
                <th className="p-2 w-2/3">¿Tienes dudas sobre...?</th>
                <th className="p-2">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-2">
                  Matrícula, reserva de matrícula, cursos no habilitados, ficha de matrícula, ranking académico
                </td>
                <td className="p-2">
                  DASA<br />
                  dasa@unam.edu.pe<br />
                  ANEXO 302<br />
                  Celular: 953967519
                </td>
              </tr>
              <tr>
                <td className="p-2">Acceso a Biblioteca Virtual, libros disponibles, usuario y contraseña</td>
                <td className="p-2">
                  Moquegua: 964611430<br />
                  Ilo: 989895105
                </td>
              </tr>
              <tr>
                <td className="p-2">Horarios, docentes, secciones y turnos</td>
                <td className="p-2">Consulta directamente con tu Escuela Profesional</td>
              </tr>
              <tr>
                <td className="p-2">Problemas con sistema estudiante, aula virtual o correo institucional</td>
                <td className="p-2">Soporte Técnico / Informática</td>
              </tr>
              <tr>
                <td className="p-2">Contactos por Escuela Profesional</td>
                <td className="p-2">
                  GPDS: 945650473<br />
                  Minas: 945647065<br />
                  Agroindustrial: 945647154<br />
                  Civil: 923234699<br />
                  Sistemas: 945649660<br />
                  Ambiental: 945647792<br />
                  Pesquera: 945647542<br />
                  Administración: 936670981<br />
                  Medicina: Anexo 606<br />
                  Derecho: 975703540<br />
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
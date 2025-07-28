'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import Image from 'next/image'
import {
  FaSignOutAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaUserCircle,
  FaBars,
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function BienvenidaLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : ''

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }
  
  // Array de navegación actualizado (sin "Revistas")
  const navLinks = [
    { href: '/bienvenida', label: 'Inicio' },
    { href: '/bienvenida/acerca-de', label: 'Acerca de' },
    { href: '/bienvenida/colecciones', label: 'Colecciones' },
  ]

  return (
    <div
      className="flex flex-col min-h-screen text-blue-900 relative"
      style={{
        backgroundImage: pathname !== '/bienvenida/acerca-de' ? 'url("/fondo-biblioteca.png")' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {pathname !== '/bienvenida/acerca-de' && (
        <div className="absolute inset-0 bg-white/80 z-0"></div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="relative z-50 flex justify-between items-center px-6 py-4 bg-[#001f3f]">
          <div className="flex items-center gap-3 w-full">
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
              <FaBars size={24} />
            </button>
            <Image src="/logo-unam.png" alt="Logo UNAM" width={70} height={70} />
            <div className="flex-grow flex justify-center">
              <nav className="hidden md:flex gap-2 text-lg text-white">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div key={link.href} className="relative">
                      <Link 
                        href={link.href} 
                        className="relative transition duration-300 hover:text-cyan-300 block px-4 py-1"
                      >
                        {link.label}
                      </Link>
                      <motion.div
                        className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-cyan-300"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-white/20 rounded-full"
                          style={{ zIndex: -1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </nav>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-white">
            <FaUserCircle size={40} />
            <span className="text-sm font-medium">{username}</span>
            <button onClick={handleLogout} className="hover:text-cyan-300 transition" title="Cerrar sesión">
              <FaSignOutAlt size={24} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="md:hidden bg-[#001f3f] text-white px-6 py-3 text-sm overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <div className="flex flex-col gap-3 mb-4">
                {navLinks.map((link) => (
                   <Link key={link.href} href={link.href} className={pathname === link.href ? 'text-cyan-300 font-bold' : ''}>
                     {link.label}
                   </Link>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-3">
                <div className="flex items-center gap-2">
                  <FaUserCircle size={30} />
                  <span>{username}</span>
                </div>
                <button onClick={handleLogout} className="hover:text-cyan-300 transition" title="Cerrar sesión">
                  <FaSignOutAlt size={30} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-grow">{children}</div>

        <footer className="relative z-50 text-white py-6 px-6 flex flex-col md:flex-row justify-between items-center mt-auto bg-[#001f3f]">
          <div className="mb-4 md:mb-0 text-sm flex items-center gap-4">
            <span className="font-semibold">Redes:</span>
            <a href="#" target="_blank" className="hover:text-cyan-300" rel="noreferrer"><FaFacebook size={20} /></a>
            <a href="#" target="_blank" className="hover:text-cyan-300" rel="noreferrer"><FaTwitter size={20} /></a>
            <a href="#" target="_blank" className="hover:text-cyan-300" rel="noreferrer"><FaInstagram size={20} /></a>
          </div>
          <div className="text-sm text-center md:text-right">
            <p className="flex items-center justify-center md:justify-end gap-2">
              <FaEnvelope size={16} />
              <a href="mailto:biblioteca@unam.edu.pe" className="hover:underline">biblioteca@unam.edu.pe</a>
            </p>
            <p>Av. Simón Bolívar s/n, Moquegua, Perú</p>
            <p>Tel: (53) 123-4567</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
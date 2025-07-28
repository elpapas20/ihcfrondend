'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
type ChevronIconProps = {
  expanded: boolean;
};
// --- Icono de flecha para el acordeón ---
function ChevronIcon({ expanded }: ChevronIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={3}
      stroke="currentColor"
      className="w-5 h-5 text-gray-600"
      animate={{ rotate: expanded ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </motion.svg>
  )
}

// --- Hook para detectar el dispositivo móvil (sin cambios) ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  return isMobile
}

// --- Componente Principal (sin cambios) ---
export default function AcercaDePage() {
  const isMobile = useIsMobile()
  // Se usa 'key' para asegurar que el estado se reinicie al cambiar entre vistas
  return isMobile ? <AcercaDePageMobile key="mobile" /> : <AcercaDePageDesktop key="desktop" />
}

// --- Versión para Escritorio (sin cambios) ---
function AcercaDePageDesktop() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const [currentBackground, setCurrentBackground] = useState(1)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      if (v < 0.35) {
        setCurrentBackground(1)
      } else if (v >= 0.35 && v < 0.85) {
        setCurrentBackground(2)
      } else {
        setCurrentBackground(3)
      }
    })
    return () => unsubscribe()
  }, [scrollYProgress])
  const opacity1 = useTransform(scrollYProgress, [0, 0.25], [1, 0])
  const y1 = useTransform(scrollYProgress, [0, 0.25], [0, -50])
  const scale1 = useTransform(scrollYProgress, [0, 0.25], [1, 0.9])
  const opacity2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0])
  const y2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [80, 0, -80])
  const scale2 = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.95, 1, 0.95])
  const opacity3 = useTransform(scrollYProgress, [0.75, 0.85], [0, 1])
  const y3 = useTransform(scrollYProgress, [0.75, 0.85], [0, 0])
  const scale3 = useTransform(scrollYProgress, [0.75, 0.85], [0.8, 1])
  const opacity4 = useTransform(scrollYProgress, [0.6, 1], [0, 1])
  const y4 = useTransform(scrollYProgress, [0.88, 1], [80, 0])
  const rotate4 = useTransform(scrollYProgress, [0.88, 1], [0, 0])

  return (
    <div ref={containerRef} className="relative h-[1200vh]">
      <motion.div className="fixed inset-0 z-0" style={{ backgroundImage: `url("/fondo-episi.png")`, backgroundSize: 'cover', backgroundPosition: 'center' }} animate={{ opacity: currentBackground === 1 ? 1 : 0 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
      <motion.div className="fixed inset-0 z-0" style={{ backgroundImage: `url("/fondo-biblioteca2.png")`, backgroundSize: 'cover', backgroundPosition: 'center' }} animate={{ opacity: currentBackground === 2 ? 1 : 0 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
      <motion.div className="fixed inset-0 z-0" style={{ backgroundImage: `url("/fondo-biblioteca.png")`, backgroundSize: 'cover', backgroundPosition: 'center' }} animate={{ opacity: currentBackground === 3 ? 1 : 0 }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden z-10">
        <div className="relative w-full max-w-6xl h-[80vh]">
          <motion.div style={{ opacity: opacity1, y: y1, scale: scale1 }} className="absolute inset-0 bg-white/70 backdrop-blur-md shadow-xl rounded-xl p-8 flex flex-row items-start justify-between">
            <div className="flex-1 text-gray-700 text-justify pr-8">
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">Sobre la UNAM</h2>
              <p className="mb-4">La creación de la Universidad Nacional de Moquegua se dio gracias al esfuerzo desplegado por sus propios habitantes, hombres que por mucho tiempo se mantuvieron en pie de lucha con el solo afán de tener en su tierra uno de sus mas anhelados sueños pudiendo hacerlo realidad un 24 de mayo del 2005, fecha en la que mediante Ley Nro 28520 fue creada la Universidad Nacional de Moquegua como persona jurídica de derecho público interno con sede en la ciudad de Moquegua, provincia de Mariscal Nieto, departamento de Moquegua.</p>
              <p className="mb-4">El 10 de julio del 2007, mediante Resolución Nro. 204-2007-CONAFU, se aprueba el Proyecto de Desarrollo Institucional de la Universidad Nacional de Moquegua, presentado por la Promotora Ministerio de Educación y mediante el cual se considera iniciar el funcionamiento de nuestra institución con las carreras profesionales de Ingeniería Pesquera, Ingeniería de Sistemas e Informática e Ingeniería Ambiental en la sede de Ilo; además de Gestión Pública y Desarrollo Social, Ingeniería Agroindustrial e Ingeniería de Minas, en la sede de Mariscal Nieto.</p>
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">VISION</h2>
              <p className="mb-4"> Al 2050, somos un país democrático, respetuoso del Estado de derecho y de la institucionalidad, integrado al mundo y proyectado hacia un futuro que garantiza la defensa de la persona humana y de su dignidad en todo el territorio nacional. </p>
              <p className="mb-4">Estamos orgullosos de nuestra identidad, propia de la diversidad étnica, cultural y lingüística del país. Respetamos nuestra historia y patrimonio milenario, y protegemos nuestra biodiversidad. </p>
              <p className="mb-4">El Estado constitucional es unitario y descentralizado. Su accionar es ético, transparente, eficaz, eficiente, moderno y con enfoque intercultural. </p>
              <p className="mb-4">Juntos, hemos logrado un desarrollo inclusivo, en igualdad de oportunidades, competitivo y sostenible en todo el territorio nacional, que ha permitido erradicar la pobreza extrema y asegurar el fortalecimiento de la familia.</p>
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">MISION</h2>
              <p className="mb-4">Somos una comunidad académica que forma profesionales e investigadores que sean innovadores, competitivos, éticos y multiculturales para contribuir con el bienestar de la sociedad.</p>
            </div>
            <div className="w-[250px]">
              <Image src="/logo-unam.png" alt="Logo UNAM" width={250} height={250} className="object-contain" />
            </div>
          </motion.div>
          <motion.div style={{ opacity: opacity2, y: y2, scale: scale2 }} className="absolute inset-0 bg-white/70 backdrop-blur-md shadow-xl rounded-xl p-8 flex flex-row-reverse items-start justify-between">
            <div className="flex-1 text-gray-700 text-justify pl-8">
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">Sobre la biblioteca</h2>
              <p className="mb-4">Este trabajo fue implementado en julio de 2025, en la sede de Ilo, como una iniciativa estudiantil que busca aportar al desarrollo institucional y académico de la universidad, permitiendo a los estudiantes y docentes acceder a material bibliográfico, revistas, colecciones digitales y recursos educativos en línea de forma centralizada y accesible.</p>
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">VISION</h2>
              <p className="mb-4">Ser una biblioteca virtual referente en el sur del Perú, que facilite el acceso equitativo, moderno y eficiente a la información académica y científica, promoviendo el aprendizaje autónomo, la investigación y la innovación en beneficio de la comunidad universitaria de la Universidad Nacional de Moquegua.</p>
              <h2 className="text-3xl font-bold mb-6 text-cyan-900">MISION</h2>
              <p className='mb-4'>Brindar acceso libre, organizado y actualizado a recursos bibliográficos digitales de calidad, que apoyen la formación académica, la investigación y el desarrollo profesional de los estudiantes, docentes y personal administrativo de la Universidad Nacional de Moquegua, contribuyendo así al fortalecimiento del conocimiento y la cultura en la región.</p>
            </div>
            <div className="w-[300px]">
              <Image src="/logo-biblioteca.png" alt="Logo Biblioteca" width={300} height={300} className="object-contain" />
            </div>
          </motion.div>
          <motion.div style={{ opacity: opacity3, y: y3, scale: scale3 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-transparent px-6 py-4 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#001f3f] drop-shadow-lg">Página diseñada por <br /> D&apos;anyelo Alessandro Segovia Bernedo</h2>
            </div>
          </motion.div>
          <motion.div style={{ opacity: opacity4, y: y4, rotate: rotate4 }} className="absolute inset-x-0 top-[62%] mx-auto w-full max-w-3xl bg-white px-8 py-6 rounded-xl shadow-lg text-center space-y-2">
            <p className="text-gray-800 font-semibold text-lg">Código: 2021204089</p>
            <p className="text-gray-800 font-semibold text-lg">Curso: IHC</p>
            <p className="text-gray-800 font-semibold text-lg">Ciclo: VIII</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// --- VERSIÓN MÓVIL ACTUALIZADA CON ACORDEÓN ---
function AcercaDePageMobile() {
  // Se especifica que el estado puede ser 'number' o 'null'
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // ... (tu array 'sections' sin cambios)
  const sections = [
    {
      title: 'Sobre la UNAM',
      background: '/fondo-episi.png',
      content: (
        <>
          <div className="w-[150px] mb-6">
            <Image src="/logo-unam.png" alt="Logo UNAM" width={150} height={150} className="object-contain" />
          </div>
          <div className="text-gray-700 text-justify">
            <p className="text-sm mb-4">La creación de la Universidad Nacional de Moquegua se dio gracias al esfuerzo desplegado por sus propios habitantes, hombres que por mucho tiempo se mantuvieron en pie de lucha con el solo afán de tener en su tierra uno de sus mas anhelados sueños pudiendo hacerlo realidad un 24 de mayo del 2005, fecha en la que mediante Ley Nro 28520 fue creada la Universidad Nacional de Moquegua como persona jurídica de derecho público interno con sede en la ciudad de Moquegua, provincia de Mariscal Nieto, departamento de Moquegua.</p>
            <p className="text-sm mb-4">El 10 de julio del 2007, mediante Resolución Nro. 204-2007-CONAFU, se aprueba el Proyecto de Desarrollo Institucional de la Universidad Nacional de Moquegua, presentado por la Promotora Ministerio de Educación y mediante el cual se considera iniciar el funcionamiento de nuestra institución con las carreras profesionales de Ingeniería Pesquera, Ingeniería de Sistemas e Informática e Ingeniería Ambiental en la sede de Ilo; además de Gestión Pública y Desarrollo Social, Ingeniería Agroindustrial e Ingeniería de Minas, en la sede de Mariscal Nieto.</p>
            <h3 className="text-xl font-bold mb-2 text-cyan-900">VISION</h3>
            <p className="text-sm mb-4"> Al 2050, somos un país democrático, respetuoso del Estado de derecho y de la institucionalidad, integrado al mundo y proyectado hacia un futuro que garantiza la defensa de la persona humana y de su dignidad en todo el territorio nacional. </p>
              <p className="text-sm mb-4">Estamos orgullosos de nuestra identidad, propia de la diversidad étnica, cultural y lingüística del país. Respetamos nuestra historia y patrimonio milenario, y protegemos nuestra biodiversidad. </p>
              <p className="text-sm mb-4">El Estado constitucional es unitario y descentralizado. Su accionar es ético, transparente, eficaz, eficiente, moderno y con enfoque intercultural. </p>
              <p className="text-sm mb-4">Juntos, hemos logrado un desarrollo inclusivo, en igualdad de oportunidades, competitivo y sostenible en todo el territorio nacional, que ha permitido erradicar la pobreza extrema y asegurar el fortalecimiento de la familia.</p>
              <h3 className="text-xl font-bold mb-2 text-cyan-900">MISION</h3>
            <p className="text-sm mb-4">Somos una comunidad académica que forma profesionales e investigadores que sean innovadores, competitivos, éticos y multiculturales para contribuir con el bienestar de la sociedad.</p>
          </div>
        </>
      ),
    },
    {
      title: 'Sobre la Biblioteca',
      background: '/fondo-biblioteca2.png',
      content: (
        <>
          <div className="w-[200px] mb-6">
            <Image src="/logo-biblioteca.png" alt="Logo Biblioteca" width={200} height={200} className="object-contain" />
          </div>
          <div className="text-gray-700 text-justify">
            <p className="text-sm mb-4">Este trabajo fue implementado en julio de 2025, en la sede de Ilo, como una iniciativa estudiantil que busca aportar al desarrollo institucional y académico de la universidad, permitiendo a los estudiantes y docentes acceder a material bibliográfico, revistas, colecciones digitales y recursos educativos en línea de forma centralizada y accesible.</p>
            <h3 className="text-xl font-bold mb-2 text-cyan-900">VISION</h3>
            <p className="text-sm mb-4">Ser una biblioteca virtual referente en el sur del Perú, que facilite el acceso equitativo, moderno y eficiente a la información académica y científica, promoviendo el aprendizaje autónomo, la investigación y la innovación en beneficio de la comunidad universitaria de la Universidad Nacional de Moquegua.</p>
            <h3 className="text-xl font-bold mb-2 text-cyan-900">MISION</h3>
            <p className='text-sm mb-4'>Brindar acceso libre, organizado y actualizado a recursos bibliográficos digitales de calidad, que apoyen la formación académica, la investigación y el desarrollo profesional de los estudiantes, docentes y personal administrativo de la Universidad Nacional de Moquegua, contribuyendo así al fortalecimiento del conocimiento y la cultura en la región.</p>
          </div>
        </>
      ),
    },
    {
      title: 'Créditos del Proyecto',
      background: '/fondo-biblioteca.png',
      content: (
        <>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">Página diseñada por <br /> D&apos;anyelo Alessandro Segovia Bernedo</h2>
          </div>
          <div className="w-full max-w-sm bg-white/80 p-4 rounded-lg shadow-inner text-center space-y-1">
            <p className="text-gray-800 font-semibold text-base">Código: 2021204089</p>
            <p className="text-gray-800 font-semibold text-base">Curso: IHC</p>
            <p className="text-gray-800 font-semibold text-base">Ciclo: VIII</p>
          </div>
        </>
      ),
    },
  ];

  const handleClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
  }

  return (
    <div className="w-full min-h-screen p-4 space-y-4 bg-gray-100">
      {sections.map((section, index) => {
        const isExpanded = expandedIndex === index
        return (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
            <motion.header
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => handleClick(index)}
            >
              <h2 className="font-bold text-lg text-gray-800">{section.title}</h2>
              <ChevronIcon expanded={isExpanded} />
            </motion.header>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.section
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${section.background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="p-6 flex flex-col items-center">
                    {section.content}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
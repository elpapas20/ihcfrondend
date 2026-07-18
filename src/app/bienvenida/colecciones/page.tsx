// src/app/bienvenida/colecciones/page.tsx

import { Suspense } from 'react'
import ColeccionesCliente from './ColeccionesCliente'

function SkeletonLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 text-center">Colecciones</h1>
        <p className="text-lg text-slate-500 text-center mb-8">Explora nuestro catálogo organizado por temas</p>
        <div className="w-full h-32 bg-slate-200 rounded-lg animate-pulse"></div>
    </div>
  );
}

export default function ColeccionesPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <ColeccionesCliente />
    </Suspense>
  )
}
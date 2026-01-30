'use client'

import { Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground">Sayfa Bulunamadı</h1>
        <p className="mt-3 text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex gap-3 mt-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Home className="h-4 w-4 mr-2" aria-hidden="true" />
            Ana Sayfa
          </Link>
          <Link 
            href="/dashboard/needy"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Search className="h-4 w-4 mr-2" aria-hidden="true" />
            Kayıt Ara
          </Link>
        </div>
        <button 
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Geri Dön
        </button>
      </div>
    </div>
  )
}

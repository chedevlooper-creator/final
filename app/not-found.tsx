import { Button } from '@/components/ui/button'
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
          <Button variant="default" asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Ana Sayfa
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/needy">
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Kayıt Ara
            </Link>
          </Button>
        </div>
        <Button variant="ghost" className="mt-4" asChild>
          <Link href="javascript:history.back()">
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Geri Dön
          </Link>
        </Button>
      </div>
    </div>
  )
}

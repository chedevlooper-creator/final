import { Loader2 } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}

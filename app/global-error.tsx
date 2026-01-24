'use client'

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-4xl font-bold">Kritik Hata</h1>
          <p className="mt-4 text-lg text-muted-foreground">{error.message}</p>
          <button
            onClick={reset}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  )
}

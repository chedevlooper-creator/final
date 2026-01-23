'use client'

/**
 * Takvim (Calendar) Modülü - Error Sayfası
 *
 * @version 2.0.0
 * @since 2026-01-18
 */

import React from 'react'
import Link from 'next/link'
import { AppError, ErrorHandler } from '@/lib/errors'

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const userMessage = ErrorHandler.handle(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Takvim Görüntülemede Hata
          </h1>

          <p className="text-center text-gray-600 mb-8 text-lg">
            {userMessage}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
                Teknik Detaylar
              </summary>
              <div className="text-sm font-mono text-gray-600 whitespace-pre-wrap">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </div>
            </details>
          )}

          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              Tekrar Dene
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/calendar" className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors text-center">
                Takvime Dön
              </Link>

              <Link href="/dashboard" className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors text-center">
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hata Kodu: {error.digest || 'UNKNOWN'}</p>
        </div>
      </div>
    </div>
  )
}

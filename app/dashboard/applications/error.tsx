'use client'

/**
 * Yardım Başvuruları Modülü - Error Sayfası
 *
 * @version 2.0.0
 * @since 2026-01-18
 */

import React from 'react'
import Link from 'next/link'
import { AppError, ErrorHandler } from '@/lib/errors'

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const userMessage = ErrorHandler.handle(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Başvuru İşleminde Hata
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
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
            >
              Tekrar Dene
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/applications" className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors text-center">
                Başvuru Listesi
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

'use client'

/**
 * İhtiyaç Sahipleri Modülü - Error Sayfası
 *
 * İhtiyaç sahipleri modülünde oluşan hatalar için özel error UI
 *
 * @version 2.0.0
 * @since 2026-01-18
 */

import React from 'react'
import Link from 'next/link'
import { AppError, ErrorHandler, ErrorType } from '@/lib/errors'

export default function NeedyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const appError = error instanceof AppError ? error : null
  const userMessage = appError?.getUserMessage() || ErrorHandler.handle(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            İhtiyaç Sahipleri Modülünde Hata
          </h1>

          {/* Message */}
          <p className="text-center text-gray-600 mb-8 text-lg">
            {userMessage}
          </p>

          {/* Error Details (Dev Only) */}
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

          {/* Actions */}
          <div className="space-y-3">
            {/* Primary Action */}
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tekrar Dene
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/needy"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                İhtiyaç Sahipleri Listesi
              </Link>

              <Link
                href="/dashboard"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana Sayfa
              </Link>
            </div>

            {/* Help Link */}
            <Link
              href="/support"
              className="block text-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Destek Ekibiyle İletişime Geç →
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hata Kodu: {error.digest || 'UNKNOWN'}</p>
          <p className="mt-1">Lütfen bu hatayı bildirirken hata kodunu paylaşın.</p>
        </div>
      </div>
    </div>
  )
}

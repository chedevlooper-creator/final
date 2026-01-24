'use client'

import { useEffect, useState, useLayoutEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Top progress bar for page transitions
 * Shows a loading bar at the top of the page during navigation
 */

export function ProgressBar() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Prevent SSR hydration mismatch
  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout

    const startLoading = () => {
      setIsLoading(true)
      setProgress(0)

      // Simulate progress
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 100)
    }

    const stopLoading = () => {
      clearInterval(progressTimer)
      setProgress(100)

      timer = setTimeout(() => {
        setIsLoading(false)
        setProgress(0)
      }, 200)
    }

    // Start loading on route change
    startLoading()

    // Stop loading when route change is complete
    stopLoading()

    return () => {
      clearInterval(progressTimer)
      clearTimeout(timer)
    }
  }, [pathname, searchParams, mounted])

  if (!mounted || !isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

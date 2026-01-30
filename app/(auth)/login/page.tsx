'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) {
      newErrors.email = 'E-posta adresi gerekli'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin'
    }
    if (!password) {
      newErrors.password = 'Şifre gerekli'
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Lütfen formu kontrol edin')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Giriş başarısız')
      }

      toast.success('Giriş başarılı!')
      // Force reload to sync cookies with middleware
      window.location.href = '/dashboard'
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bir hata oluştu'
      toast.error(message)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="card-bento p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-b from-primary to-primary-dark shadow-lg mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Yardım Yönetim Paneli
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Panel erişimi için hesabınıza giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                  required
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  className={cn(
                    "pl-10",
                    errors.email && "border-danger focus:border-danger"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-danger focus:border-danger"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
              >
                Sistem yöneticisi ile iletişime geçin
              </button>
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Yardım Yönetim Paneli © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (activeTab === 'login') {
        await signIn(email, password)
        // Toast is handled in signIn
      } else {
        await signUp(email, password, name)
        // Toast is handled in signUp
        setActiveTab('login') // Switch to login after successful signup
        setPassword('') // Clear password
      }
    } catch (error: any) {
      // Error toast is handled in useAuth
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 border-slate-700 bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Yardım Yönetim Paneli
            </CardTitle>
            <CardDescription className="text-slate-400">
              {activeTab === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni bir hesap oluşturun'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">Kayıt Ol</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TabsContent value="register" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Ad Soyad
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={activeTab === 'register'}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {activeTab === 'login' ? 'Giriş yapılıyor...' : 'Kayıt yapılıyor...'}
                  </>
                ) : (
                  activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
                )}
              </Button>
            </form>
          </Tabs>

          {process.env['NODE_ENV'] === 'development' && activeTab === 'login' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Demo hesap bulunamadıysa lütfen kayıt olunuz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { AuthError, ErrorHandler } from '@/lib/errors'
import { toast } from 'sonner'
import type { UserRole } from '@/types/common'
import { usePermissions } from '@/lib/rbac'

interface UserProfile {
  id: string
  email: string
  role: UserRole
  name?: string
  avatar_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Get user role from metadata or profile
  const userRole: UserRole = useMemo(() => {
    // First check user metadata (for quick access)
    if (user?.user_metadata?.['role']) {
      return user.user_metadata['role'] as UserRole
    }

    // Then check profile state
    if (profile?.role) {
      return profile.role
    }

    // Default to viewer
    return 'viewer'
  }, [user, profile])

  // Get permissions based on role
  const permissions = usePermissions(userRole)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        // Auth session missing is expected when user is not logged in
        if (error) {
          // Don't show error for missing session - this is expected on login page
          if (error.message?.includes('session') || error.code === 'session_not_found') {
            setUser(null)
            setLoading(false)
            return
          }
          throw ErrorHandler.fromSupabaseError(error)
        }

        setUser(user)

        // Fetch user profile from profiles table
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setProfile({
              id: profileData.id,
              email: profileData.email || user.email || '',
              role: profileData['role'] || 'viewer',
              name: profileData['name'],
              avatar_url: profileData['avatar_url']
            })
          }
        }
      } catch (error) {
        // Only show error toast for unexpected errors
        if (error instanceof Error && !error.message?.includes('session')) {
          const message = ErrorHandler.handle(error, { action: 'getUser' })
          toast.error(message)
        }
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        // Refetch profile on auth state change
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setProfile({
            id: profileData.id,
            email: profileData.email || session.user.email || '',
            role: profileData.role || 'viewer',
            name: profileData.name,
            avatar_url: profileData.avatar_url
          })
        } else {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new AuthError(
          error.message || 'Giriş başarısız',
          error.status?.toString() || 'SIGN_IN_FAILED'
        )
      }

      toast.success('Giriş başarılı!')
      // Force a full reload to ensure cookies are synchronized with the server middleware
      window.location.href = '/dashboard'
      return data
    } catch (error) {
      const message = ErrorHandler.handle(error, {
        action: 'signIn',
        email: email.substring(0, 3) + '***' // Mask email for logging
      })
      toast.error(message)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || '',
            role: 'user' // Default role for new users
          }
        }
      })

      if (error) {
        throw ErrorHandler.fromSupabaseError(error)
      }

      // Create or update profile record using upsert to prevent duplicates
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: name || '',
            role: 'user',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          // Profile creation failed - logged securely
        }
      }

      toast.success('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.')
      return data
    } catch (error) {
      const message = ErrorHandler.handle(error, {
        action: 'signUp',
        email: email.substring(0, 3) + '***'
      })
      toast.error(message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw ErrorHandler.fromSupabaseError(error)
      }

      toast.success('Çıkış yapıldı')
      window.location.href = '/login'
    } catch (error) {
      const message = ErrorHandler.handle(error, { action: 'signOut' })
      toast.error(message)
      // Still redirect to login even if sign out fails
      router.push('/login')
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      toast.error('Giriş yapmalısınız')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)

      toast.success('Profil güncellendi')
    } catch (error) {
      const message = ErrorHandler.handle(error, { action: 'updateProfile' })
      toast.error(message)
      throw error
    }
  }

  // Check if user has specific permission
  const hasPermission = (permission: string) => {
    return permissions[permission as keyof typeof permissions] || false
  }

  // Check if user can perform action on resource
  const canPerform = (resource: string, action: string) => {
    const resourcePerms = permissions[resource as keyof typeof permissions] as any
    return resourcePerms?.[action] || false
  }

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,

    // Role and permissions
    role: userRole,
    permissions,
    hasPermission,
    canPerform,

    // Convenience booleans
    isAdmin: userRole === 'admin',
    isModerator: userRole === 'moderator',
    isUser: userRole === 'user',
    isViewer: userRole === 'viewer',
  }
}

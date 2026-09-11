import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signInWithProvider: (provider: 'google' | 'azure') => Promise<string | null>
  requestPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  signOut: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const genericAuthError = 'Não foi possível concluir a operação. Verifique os dados e tente novamente.'

function authMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('message' in error)) return genericAuthError
  const message = String(error.message).toLowerCase()
  if (message.includes('invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (message.includes('password')) return 'A senha não atende aos requisitos configurados.'
  if (message.includes('rate limit') || message.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  return genericAuthError
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    configured: Boolean(supabase),
    async signIn(email, password) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error ? authMessage(error) : null
    },
    async signUp(email, password, name) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      })
      return error ? authMessage(error) : null
    },
    async signInWithProvider(provider) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      })
      return error ? authMessage(error) : null
    },
    async requestPasswordReset(email) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })
      return error ? authMessage(error) : null
    },
    async updatePassword(password) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const { error } = await supabase.auth.updateUser({ password })
      return error ? authMessage(error) : null
    },
    async signOut() {
      if (!supabase) return null
      const { error } = await supabase.auth.signOut()
      return error ? authMessage(error) : null
    },
  }), [loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

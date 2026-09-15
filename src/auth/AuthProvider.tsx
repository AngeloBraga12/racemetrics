import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  passwordRecovery: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, name: string) => Promise<string | null>
  signInWithProvider: (provider: 'google' | 'azure') => Promise<string | null>
  requestPasswordReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  signOut: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const genericAuthError = 'Não foi possível concluir a operação. Verifique os dados e tente novamente.'
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 128
const MAX_EMAIL_LENGTH = 254
const MAX_NAME_LENGTH = 80

function authMessage(error: unknown) {
  if (!error || typeof error !== 'object' || !('message' in error)) return genericAuthError
  const message = String(error.message).toLowerCase()
  if (message.includes('invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (message.includes('password')) return 'A senha não atende aos requisitos configurados.'
  if (message.includes('rate limit') || message.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  return genericAuthError
}

function validateEmail(email: string) {
  const value = email.trim()
  if (!value || value.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Informe um e-mail válido.'
  return null
}

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) return `A senha deve ter entre ${MIN_PASSWORD_LENGTH} e ${MAX_PASSWORD_LENGTH} caracteres.`
  return null
}

function validateName(name: string) {
  const value = name.trim()
  if (!value || value.length > MAX_NAME_LENGTH) return `O nome deve ter entre 1 e ${MAX_NAME_LENGTH} caracteres.`
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

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

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setPasswordRecovery(false)
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
    passwordRecovery,
    async signIn(email, password) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const emailError = validateEmail(email)
      if (emailError) return emailError
      if (!password) return 'Informe sua senha.'
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      return error ? authMessage(error) : null
    },
    async signUp(email, password, name) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const emailError = validateEmail(email)
      if (emailError) return emailError
      const passwordError = validatePassword(password)
      if (passwordError) return passwordError
      const nameError = validateName(name)
      if (nameError) return nameError
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
      const emailError = validateEmail(email)
      if (emailError) return emailError
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      })
      return error ? authMessage(error) : null
    },
    async updatePassword(password) {
      if (!supabase) return 'O ambiente de autenticação ainda não foi configurado.'
      const passwordError = validatePassword(password)
      if (passwordError) return passwordError
      const { error } = await supabase.auth.updateUser({ password })
      if (!error) setPasswordRecovery(false)
      return error ? authMessage(error) : null
    },
    async signOut() {
      if (!supabase) return null
      const { error } = await supabase.auth.signOut()
      return error ? authMessage(error) : null
    },
  }), [loading, passwordRecovery, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

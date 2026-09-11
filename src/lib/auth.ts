import type { AuthResponse } from '@supabase/supabase-js'
import { supabase } from './supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('AUTH_NOT_CONFIGURED')
  }
  return supabase
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResponse> {
  const client = requireSupabase()
  return client.auth.signInWithPassword({ email: email.trim(), password })
}

export async function signUpWithPassword(email: string, password: string) {
  const client = requireSupabase()
  return client.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export async function signInWithGoogle() {
  const client = requireSupabase()
  return client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export async function signInWithMicrosoft() {
  const client = requireSupabase()
  return client.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email',
    },
  })
}

export async function requestPasswordReset(email: string) {
  const client = requireSupabase()
  return client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
}

export async function signOut() {
  const client = requireSupabase()
  return client.auth.signOut()
}

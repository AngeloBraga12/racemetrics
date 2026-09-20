import { supabase } from './supabase'
import type { Database } from './database.types'

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type Preferences = Database['public']['Tables']['preferences']['Row']
type Favorite = Database['public']['Tables']['favorites']['Row']
type SavedComparison = Database['public']['Tables']['saved_comparisons']['Row']

function requireClient() {
  if (!supabase) throw new Error('Supabase não está configurado.')
  return supabase
}

export async function ensureUserData(userId: string, displayName?: string | null) {
  const client = requireClient()
  const profile: ProfileInsert = { id: userId, display_name: displayName?.trim() || null }
  const { error: profileError } = await client.from('profiles').upsert(profile, { onConflict: 'id' })
  if (profileError) throw profileError
  const { error: preferenceError } = await client.from('preferences').upsert(
    { user_id: userId },
    { onConflict: 'user_id', ignoreDuplicates: true },
  )
  if (preferenceError) throw preferenceError
}

export async function getProfile(userId: string) {
  const client = requireClient()
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, patch: Pick<ProfileInsert, 'display_name' | 'avatar_url'>) {
  const client = requireClient()
  const { data, error } = await client.from('profiles').update(patch).eq('id', userId).select().single()
  if (error) throw error
  return data
}

export async function getPreferences(userId: string): Promise<Preferences | null> {
  const client = requireClient()
  const { data, error } = await client.from('preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function updatePreferences(userId: string, patch: Pick<Preferences, 'theme' | 'density' | 'favorite_series'>) {
  const client = requireClient()
  const { data, error } = await client.from('preferences').upsert(
    { user_id: userId, ...patch },
    { onConflict: 'user_id' },
  ).select().single()
  if (error) throw error
  return data
}

export async function listFavorites(userId: string) {
  const client = requireClient()
  const { data, error } = await client.from('favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function isFavorite(userId: string, entityType: Favorite['entity_type'], entityId: string) {
  const client = requireClient()
  const { data, error } = await client.from('favorites').select('id').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function addFavorite(userId: string, entityType: Favorite['entity_type'], entityId: string) {
  const client = requireClient()
  const { data, error } = await client.from('favorites').insert({ user_id: userId, entity_type: entityType, entity_id: entityId }).select().single()
  if (error) throw error
  return data
}

export async function removeFavorite(userId: string, entityType: Favorite['entity_type'], entityId: string) {
  const client = requireClient()
  const { error } = await client.from('favorites').delete().eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId)
  if (error) throw error
}

export async function listSavedComparisons(userId: string) {
  const client = requireClient()
  const { data, error } = await client.from('saved_comparisons').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function saveComparison(
  userId: string,
  input: Omit<Database['public']['Tables']['saved_comparisons']['Insert'], 'user_id'>,
) {
  const client = requireClient()
  const { data, error } = await client.from('saved_comparisons').insert({ user_id: userId, ...input }).select().single()
  if (error) throw error
  return data
}

export async function updateSavedComparison(
  userId: string,
  id: string,
  patch: Partial<Pick<SavedComparison, 'title' | 'comparison_type' | 'left_entity_id' | 'right_entity_id'>>,
) {
  const client = requireClient()
  const { data, error } = await client.from('saved_comparisons').update(patch).eq('id', id).eq('user_id', userId).select().single()
  if (error) throw error
  return data
}

export async function deleteSavedComparison(userId: string, id: string) {
  const client = requireClient()
  const { error } = await client.from('saved_comparisons').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

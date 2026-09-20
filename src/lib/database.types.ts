export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" }
  public: {
    Tables: {
      favorites: {
        Row: { created_at: string; entity_id: string; entity_type: string; id: string; user_id: string }
        Insert: { created_at?: string; entity_id: string; entity_type: string; id?: string; user_id: string }
        Update: { created_at?: string; entity_id?: string; entity_type?: string; id?: string; user_id?: string }
        Relationships: []
      }
      preferences: {
        Row: { density: string; favorite_series: string; theme: string; updated_at: string; user_id: string }
        Insert: { density?: string; favorite_series?: string; theme?: string; updated_at?: string; user_id: string }
        Update: { density?: string; favorite_series?: string; theme?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
      profiles: {
        Row: { avatar_url: string | null; created_at: string; display_name: string | null; id: string; updated_at: string }
        Insert: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id: string; updated_at?: string }
        Update: { avatar_url?: string | null; created_at?: string; display_name?: string | null; id?: string; updated_at?: string }
        Relationships: []
      }
      saved_comparisons: {
        Row: { comparison_type: string; created_at: string; id: string; left_entity_id: string; right_entity_id: string; title: string; updated_at: string; user_id: string }
        Insert: { comparison_type: string; created_at?: string; id?: string; left_entity_id: string; right_entity_id: string; title: string; updated_at?: string; user_id: string }
        Update: { comparison_type?: string; created_at?: string; id?: string; left_entity_id?: string; right_entity_id?: string; title?: string; updated_at?: string; user_id?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      spaces: {
        Row: {
          id: string
          title: string
          description: string
          address: string
          price_per_hour: number
          size_m2: number
          image_urls: string[]
          amenities: string[]
          host_id: string
          status: 'active' | 'pending' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          address: string
          price_per_hour: number
          size_m2: number
          image_urls?: string[]
          amenities?: string[]
          host_id: string
          status?: 'active' | 'pending' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          address?: string
          price_per_hour?: number
          size_m2?: number
          image_urls?: string[]
          amenities?: string[]
          host_id?: string
          status?: 'active' | 'pending' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          phone_number: string | null
          created_at: string
          updated_at: string
          avatar_url: string | null
          preferred_language: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          preferred_language?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          preferred_language?: string | null
        }
      }
    }
  }
}
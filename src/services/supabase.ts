import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Criação do client com persistência local garantida
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage, // Garante uso do localStorage
    persistSession: true,  // Garante persistência
    autoRefreshToken: true // Garante refresh automático
  }
})

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  created_at: string;
}
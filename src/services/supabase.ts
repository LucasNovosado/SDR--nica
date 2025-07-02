/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'

// Declaração global para suportar import.meta.env no Vite

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

console.log('[supabase] VITE_SUPABASE_URL:', supabaseUrl)
console.log('[supabase] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.slice(0, 8) + '...' : 'MISSING')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase] Missing Supabase environment variables', { supabaseUrl, supabaseAnonKey })
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
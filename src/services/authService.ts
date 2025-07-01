import { supabase } from './supabase'

/**
 * Cria um novo usuário no Supabase Auth
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns {Promise<{ user: any, error: any }>} Resultado da criação
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data?.user, error }
} 
import { supabase } from './supabase'

/**
 * Cria uma nova loja na tabela 'lojas'
 * @param loja Objeto com nome, cidade, estado, populacao
 * @returns {Promise<{ error: any }>} Resultado da inserção
 */
export async function createLoja(loja: { nome: string, cidade: string, estado: string, populacao: number }) {
  const { error } = await supabase.from('lojas').insert([loja])
  return { error }
}

/**
 * Busca todas as lojas cadastradas
 * @returns {Promise<{ data: any[], error: any }>} Lojas e erro
 */
export async function getLojas() {
  const { data, error } = await supabase.from('lojas').select('*')
  return { data, error }
} 
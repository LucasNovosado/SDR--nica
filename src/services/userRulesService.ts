import { supabase } from './supabase'

/**
 * Cria um registro na tabela users_regras
 * @param dados Dados do usuário (nome, email, nivel, loja_id, user_ref)
 * @returns {Promise<{ error: any }>} Resultado da inserção
 */
export async function createUserRule(dados: {
  nome: string,
  email: string,
  nivel: string,
  loja_id?: string | null,
  user_ref: string
}) {
  const { error } = await supabase.from('users_regras').insert([dados])
  return { error }
}

/**
 * Associa gerente a múltiplas lojas na tabela gerente_lojas
 * @param gerenteId ID do gerente
 * @param lojasIds Array de IDs das lojas
 * @returns {Promise<{ error: any }>} Resultado da inserção
 */
export async function associarGerenteLojas(gerenteId: string, lojasIds: string[]) {
  const relacoes = lojasIds.map(lojaId => ({ gerente_id: gerenteId, loja_id: lojaId }))
  const { error } = await supabase.from('gerente_lojas').insert(relacoes)
  return { error }
} 
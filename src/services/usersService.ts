import { supabase } from './supabase'

// Busca todos os usuários cadastrados na tabela users_regras
export async function getAllUsers() {
  // Busca todos os usuários, sem join
  const { data, error } = await supabase
    .from('users_regras')
    .select('*')
    .order('criado_em', { ascending: false })
  return { data, error }
}

// Busca todas as lojas cadastradas
export async function getAllLojas() {
  const { data, error } = await supabase
    .from('lojas')
    .select('id, nome')
    .order('nome', { ascending: true })
  return { data, error }
}

// Busca todas as lojas vinculadas a um user_regra_id (para gerente/supervisor)
export async function getLojasByUserRegraId(userRegraId: string) {
  const { data, error } = await supabase
    .from('users_regras_lojas')
    .select('loja_id')
    .eq('user_regra_id', userRegraId)
  return { data, error }
}

// Atualiza as lojas vinculadas a um user_regra_id (para gerente/supervisor)
export async function updateUserLojas(userRegraId: string, lojaIds: string[]) {
  // Remove todas as lojas antigas
  await supabase.from('users_regras_lojas').delete().eq('user_regra_id', userRegraId)
  // Insere as novas lojas
  if (lojaIds.length > 0) {
    const insertData = lojaIds.map(loja_id => ({ user_regra_id: userRegraId, loja_id }))
    await supabase.from('users_regras_lojas').insert(insertData)
  }
}

// Atualiza dados do usuário (exceto senha)
export async function updateUser(id: string, updates: any) {
  return await supabase
    .from('users_regras')
    .update(updates)
    .eq('id', id)
}

// Exclui usuário (regra e auth)
export async function deleteUser(id: string) {
  return await supabase
    .from('users_regras')
    .delete()
    .eq('id', id)
} 
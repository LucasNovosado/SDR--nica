import { supabase } from './supabase'

export type UserLevel = 'diretor' | 'gerente' | 'vendedor' | 'entregador'

export interface UserRegra {
  id: string
  nome: string
  email: string
  nivel: UserLevel
  loja_id: string | null
  user_ref: string
  criado_em: string
  updated_at: string
}

export interface UserWithLevel {
  id: string
  email: string
  created_at: string
  nivel?: UserLevel
  nome?: string
  loja_id?: string | null
}

export const userLevelsService = {
  // Buscar informações do usuário com nível
  async getUserWithLevel(userId: string): Promise<UserWithLevel | null> {
    try {
      console.log('Buscando usuário:', userId)
      
      const { data, error } = await supabase
        .from('users_regras')
        .select('*')
        .eq('user_ref', userId)
        .maybeSingle() // Use maybeSingle() em vez de single() para evitar erro se não encontrar

      if (error) {
        console.log('Usuário não encontrado na tabela users_regras:', error.message)
        return null
      }

      if (!data) {
        console.log('Nenhum registro encontrado para o usuário:', userId)
        return null
      }

      const userWithLevel: UserWithLevel = {
        id: userId,
        email: data.email,
        created_at: data.criado_em,
        nivel: data.nivel,
        nome: data.nome,
        loja_id: data.loja_id
      }

      console.log('Usuário encontrado:', userWithLevel)
      return userWithLevel
      
    } catch (error) {
      console.error('Erro ao buscar usuário com nível:', error)
      return null
    }
  },

  // Criar registro na tabela users_regras
  async createUserRegra(userData: {
    user_ref: string
    nome: string
    email: string
    nivel: UserLevel
    loja_id?: string | null
  }): Promise<{ data: UserRegra | null; error: any }> {
    try {
      console.log('Criando user_regra:', userData)
      
      const { data, error } = await supabase
        .from('users_regras')
        .insert({
          user_ref: userData.user_ref,
          nome: userData.nome,
          email: userData.email,
          nivel: userData.nivel,
          loja_id: userData.loja_id || null
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar user_regra:', error)
      } else {
        console.log('User_regra criado com sucesso:', data)
      }

      return { data, error }
    } catch (error) {
      console.error('Erro ao criar user_regra:', error)
      return { data: null, error }
    }
  },

  // Atualizar nível do usuário
  async updateUserLevel(userId: string, nivel: UserLevel): Promise<{ data: UserRegra | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('users_regras')
        .update({ 
          nivel, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_ref', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Erro ao atualizar nível do usuário:', error)
      return { data: null, error }
    }
  },

  // Listar todos os usuários com seus níveis
  async getAllUsersWithLevels(): Promise<UserRegra[]> {
    try {
      const { data, error } = await supabase
        .from('users_regras')
        .select('*')
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('Erro ao buscar usuários:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar usuários com níveis:', error)
      return []
    }
  },

  // Verificar permissões baseadas no nível
  hasPermission(userLevel: UserLevel, requiredLevel: UserLevel): boolean {
    const hierarchy: Record<UserLevel, number> = {
      'diretor': 4,
      'gerente': 3,
      'vendedor': 2,
      'entregador': 1
    }

    return hierarchy[userLevel] >= hierarchy[requiredLevel]
  },

  // Obter permissões do usuário
  getUserPermissions(userLevel: UserLevel) {
    const permissions = {
      // Permissões básicas que todos têm
      canViewDashboard: true,
      canViewProfile: true,

      // Permissões específicas por nível
      canManageUsers: userLevel === 'diretor',
      canManageStores: userLevel === 'diretor' || userLevel === 'gerente',
      canViewReports: userLevel === 'diretor' || userLevel === 'gerente',
      canManageProducts: userLevel === 'diretor' || userLevel === 'gerente' || userLevel === 'vendedor',
      canProcessOrders: userLevel === 'diretor' || userLevel === 'gerente' || userLevel === 'vendedor',
      canManageDeliveries: userLevel === 'diretor' || userLevel === 'gerente' || userLevel === 'entregador',
      
      // Permissões administrativas
      canViewFinancial: userLevel === 'diretor' || userLevel === 'gerente',
      canManageSettings: userLevel === 'diretor',
      canViewAllStores: userLevel === 'diretor',
      canViewOwnStore: true, // Todos podem ver a própria loja
    }

    return permissions
  },

  // Verificar se usuário pode acessar uma loja específica
  canAccessStore(userLevel: UserLevel, userLojaId: string | null, targetLojaId: string): boolean {
    // Diretor pode acessar todas as lojas
    if (userLevel === 'diretor') return true
    
    // Outros níveis só podem acessar sua própria loja
    return userLojaId === targetLojaId
  },

  async criarUsuarioComRegra({ nome, email, senha, nivel, loja_id }: { nome: string, email: string, senha: string, nivel: UserLevel, loja_id?: string }) {
    // 1. Cria usuário no Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha
    })
    if (signUpError || !signUpData.user) {
      throw new Error(signUpError?.message || 'Erro ao criar usuário no Auth')
    }
    // 2. Insere dados adicionais na tabela users_regras
    const { data: regraData, error: regraError } = await supabase.from('users_regras').insert({
      user_ref: signUpData.user.id,
      nome,
      email,
      nivel,
      loja_id: loja_id || null
    })
    if (regraError) {
      throw new Error(regraError.message || 'Erro ao salvar dados adicionais do usuário')
    }
    return { user: signUpData.user, regra: regraData }
  }
}
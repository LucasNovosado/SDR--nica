import { supabase } from './supabase'

export interface Pontuacao {
  id: string
  usuario_id: string
  loja_id: string
  data: string
  pontos: number
  criado_em: string
}

export interface PontuacaoResponse {
  data: Pontuacao | null
  error: any
}

export interface UserRanking {
  usuario_id: string
  nome: string
  email: string
  pontos: number
}

export const pontosService = {
  // Adicionar pontos para um usuário
  async adicionarPontos(
    usuarioId: string,
    lojaId: string,
    pontos: number = 50
  ): Promise<PontuacaoResponse> {
    try {
      console.log('🎯 [pontosService] Adicionando pontos:', { usuarioId, lojaId, pontos })
      
      const hoje = new Date().toISOString().split('T')[0]
      
      const pontuacaoData = {
        usuario_id: usuarioId,
        loja_id: lojaId,
        data: hoje,
        pontos
      }

      const { data: pontuacao, error } = await supabase
        .from('pontuacoes')
        .insert(pontuacaoData)
        .select()
        .single()

      if (error) {
        console.error('❌ [pontosService] Erro ao adicionar pontos:', error)
        return { data: null, error }
      }

      console.log('✅ [pontosService] Pontos adicionados com sucesso:', pontuacao)
      return { data: pontuacao, error: null }
    } catch (error) {
      console.error('❌ [pontosService] Erro na função adicionarPontos:', error)
      return { data: null, error }
    }
  },

  // Buscar total de pontos do usuário com query otimizada
  async getTotalPontosUsuario(usuarioId: string): Promise<number> {
    try {
      console.log('📊 [pontosService] Buscando total de pontos para usuário:', usuarioId)
      
      // Usar uma query mais específica para somar os pontos
      const { data, error } = await supabase
        .rpc('get_total_pontos_usuario', { p_usuario_id: usuarioId })

      if (error) {
        console.log('⚠️ [pontosService] RPC não disponível, usando query manual')
        
        // Fallback para query manual
        const { data: pontuacoes, error: queryError } = await supabase
          .from('pontuacoes')
          .select('pontos')
          .eq('usuario_id', usuarioId)

        if (queryError) {
          console.error('❌ [pontosService] Erro ao buscar pontos:', queryError)
          return 0
        }

        const totalPontos = pontuacoes?.reduce((total, item) => total + item.pontos, 0) || 0
        console.log('📈 [pontosService] Total de pontos (query manual):', totalPontos)
        
        return totalPontos
      }

      const totalPontos = data || 0
      console.log('📈 [pontosService] Total de pontos (RPC):', totalPontos)
      
      return totalPontos
    } catch (error) {
      console.error('❌ [pontosService] Erro ao calcular total de pontos:', error)
      
      // Fallback final
      try {
        const { data: pontuacoes, error: fallbackError } = await supabase
          .from('pontuacoes')
          .select('pontos')
          .eq('usuario_id', usuarioId)

        if (fallbackError) {
          console.error('❌ [pontosService] Erro no fallback:', fallbackError)
          return 0
        }

        const totalPontos = pontuacoes?.reduce((total, item) => total + item.pontos, 0) || 0
        console.log('📈 [pontosService] Total de pontos (fallback):', totalPontos)
        
        return totalPontos
      } catch (fallbackError) {
        console.error('❌ [pontosService] Erro no fallback final:', fallbackError)
        return 0
      }
    }
  },

  // Buscar pontos por período
  async getPontosPorPeriodo(
    usuarioId: string,
    dataInicio: string,
    dataFim: string
  ): Promise<Pontuacao[]> {
    try {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('criado_em', { ascending: false })

      if (error) {
        console.error('❌ [pontosService] Erro ao buscar pontos por período:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ [pontosService] Erro ao buscar pontos por período:', error)
      return []
    }
  },

  // Buscar pontos de hoje
  async getPontosHoje(usuarioId: string): Promise<number> {
    try {
      const hoje = new Date().toISOString().split('T')[0]
      console.log('📅 [pontosService] Buscando pontos de hoje:', hoje, 'para usuário:', usuarioId)
      
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('pontos')
        .eq('usuario_id', usuarioId)
        .eq('data', hoje)

      if (error) {
        console.error('❌ [pontosService] Erro ao buscar pontos de hoje:', error)
        return 0
      }

      const pontosHoje = data?.reduce((total, item) => total + item.pontos, 0) || 0
      console.log('📅 [pontosService] Pontos de hoje calculados:', pontosHoje)
      
      return pontosHoje
    } catch (error) {
      console.error('❌ [pontosService] Erro ao buscar pontos de hoje:', error)
      return 0
    }
  },

  // Buscar histórico de pontuações
  async getHistoricoPontos(usuarioId: string, limite: number = 10): Promise<Pontuacao[]> {
    try {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('criado_em', { ascending: false })
        .limit(limite)

      if (error) {
        console.error('❌ [pontosService] Erro ao buscar histórico:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ [pontosService] Erro ao buscar histórico:', error)
      return []
    }
  },

  // Buscar ranking de pontos (todos os usuários)
  async getRankingPontos(limite: number = 10): Promise<UserRanking[]> {
    try {
      const { data, error } = await supabase
        .from('pontuacoes')
        .select(`
          usuario_id,
          pontos,
          users_regras!inner(nome, email)
        `)
        .order('pontos', { ascending: false })
        .limit(limite * 5) // Buscar mais dados para agrupar depois

      if (error) {
        console.error('❌ [pontosService] Erro ao buscar ranking:', error)
        return []
      }

      // Agrupar pontos por usuário
      const rankingMap = new Map<string, UserRanking>()
      
      data?.forEach((item: any) => {
        const userId = item.usuario_id
        // users_regras pode vir como array ou objeto dependendo da query
        const userRegra = Array.isArray(item.users_regras) 
          ? item.users_regras[0] 
          : item.users_regras
        
        if (rankingMap.has(userId)) {
          const existing = rankingMap.get(userId)!
          existing.pontos += item.pontos
        } else {
          rankingMap.set(userId, {
            usuario_id: userId,
            nome: userRegra?.nome || 'Usuário',
            email: userRegra?.email || '',
            pontos: item.pontos
          })
        }
      })

      // Converter para array e ordenar
      const ranking = Array.from(rankingMap.values())
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, limite)

      return ranking
    } catch (error) {
      console.error('❌ [pontosService] Erro ao calcular ranking:', error)
      return []
    }
  },

  // Função para invalidar cache (se necessário)
  async invalidarCachePontos(usuarioId: string): Promise<void> {
    console.log('🔄 [pontosService] Invalidando cache para usuário:', usuarioId)
    // Esta função pode ser usada para invalidar qualquer cache local se implementado
  }
}
import { supabase } from './supabase'

export interface Loja {
  id: string
  nome: string
  cidade: string
  estado: string
  populacao: number
  supervisor: string | null
  criado_em: string
}

export interface Lead {
  id: string
  loja_id: string
  data: string
  hora: string
  convertido: boolean | null
  motivo_perda: string | null
  criado_em: string
  tipo: 'whatsapp/telefone' | 'cliente físico'
}

export interface Pontuacao {
  id: string
  usuario_id: string
  loja_id: string
  data: string
  pontos: number
  criado_em: string
}

export const motivosPerdaOptions = [
  'Preço muito alto',
  'Não tinha o produto desejado',
  'Atendimento insatisfatório',
  'Cliente apenas pesquisando',
  'Decidiu comprar em outro lugar'
]

export const diarioService = {
  // ===== LOJAS =====
  async getLojasByUser(userId: string, userLevel: string, userLojaId?: string | null): Promise<Loja[]> {
    try {
      let query = supabase.from('lojas').select('*')

      if (userLevel === 'diretor') {
        // Diretor vê todas as lojas
        // Sem filtro adicional
      } else if (userLevel === 'gerente') {
        // Gerente vê lojas que supervisiona
        query = query.eq('supervisor', userId)
      } else if (userLevel === 'vendedor' && userLojaId) {
        // Vendedor vê apenas sua loja
        query = query.eq('id', userLojaId)
      } else {
        // Outros níveis sem acesso
        return []
      }

      const { data, error } = await query.order('nome')

      if (error) {
        console.error('Erro ao buscar lojas:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
      return []
    }
  },

  // ===== LEADS =====
  async getLeadsByLoja(lojaId: string, data?: string): Promise<Lead[]> {
    try {
      console.log('🔍 Buscando leads para loja:', lojaId, 'data:', data)
      
      let query = supabase
        .from('leads')
        .select('*')
        .eq('loja_id', lojaId)

      if (data) {
        query = query.eq('data', data)
      }

      const { data: leads, error } = await query.order('criado_em', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar leads:', error)
        return []
      }

      console.log('✅ Leads encontrados:', leads?.length || 0)
      console.log('📋 Dados dos leads:', leads)

      return leads || []
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error)
      return []
    }
  },

  async createLead(leadData: {
    loja_id: string
    tipo: 'whatsapp/telefone' | 'cliente físico'
  }): Promise<{ data: Lead | null; error: any }> {
    try {
      console.log('📝 Dados recebidos para criar lead:', leadData)
      
      const now = new Date()
      const data = now.toISOString().split('T')[0] // YYYY-MM-DD
      const hora = now.toTimeString().split(' ')[0] // HH:MM:SS

      const leadToInsert = {
        loja_id: leadData.loja_id,
        data,
        hora,
        convertido: null,
        motivo_perda: null,
        tipo: leadData.tipo
      }

      console.log('📤 Dados que serão inseridos:', leadToInsert)

      const { data: lead, error } = await supabase
        .from('leads')
        .insert(leadToInsert)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro detalhado ao criar lead:', error)
        console.error('Código do erro:', error.code)
        console.error('Mensagem do erro:', error.message)
        console.error('Detalhes do erro:', error.details)
      } else {
        console.log('✅ Lead criado com sucesso:', lead)
      }

      return { data: lead, error }
    } catch (error) {
      console.error('❌ Erro na função createLead:', error)
      return { data: null, error }
    }
  },

  async updateLeadConversao(
    leadId: string, 
    convertido: boolean, 
    motivoPerda?: string,
    userId?: string,
    lojaId?: string
  ): Promise<{ data: Lead | null; error: any; pontosAdicionados?: boolean }> {
    try {
      console.log('🔄 Atualizando conversão do lead:', leadId, 'convertido:', convertido, 'motivo:', motivoPerda)
      
      const updateData: any = { convertido }
      
      if (!convertido && motivoPerda) {
        updateData.motivo_perda = motivoPerda
      } else if (convertido) {
        updateData.motivo_perda = null
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar lead:', error)
        return { data: null, error }
      }

      console.log('✅ Lead atualizado com sucesso:', lead)

      // Adicionar pontos para o usuário (tanto para conversão quanto para perda)
      let pontosAdicionados = false
      if (userId && lojaId) {
        try {
          console.log('🎯 Adicionando pontos para usuário:', userId)
          const pontosResult = await this.adicionarPontosUsuario(userId, lojaId, 50)
          pontosAdicionados = !pontosResult.error
          console.log('🎯 Resultado dos pontos:', pontosResult)
          console.log('🎯 Pontos adicionados com sucesso:', pontosAdicionados)
        } catch (pontosError) {
          console.error('❌ Erro ao adicionar pontos:', pontosError)
        }
      }

      return { data: lead, error: null, pontosAdicionados }
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error)
      return { data: null, error }
    }
  },

  async deleteLead(leadId: string): Promise<{ data: any; error: any }> {
    try {
      console.log('🗑️ Deletando lead:', leadId)
      
      const { data, error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .select()

      if (error) {
        console.error('❌ Erro ao deletar lead:', error)
        console.error('Código do erro:', error.code)
        console.error('Mensagem do erro:', error.message)
        console.error('Detalhes do erro:', error.details)
      } else {
        console.log('✅ Lead deletado com sucesso:', data)
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Erro na função deleteLead:', error)
      return { data: null, error }
    }
  },

  async updateLead(leadId: string, updateData: {
    tipo?: 'whatsapp/telefone' | 'cliente físico'
    data?: string
    hora?: string
  }): Promise<{ data: Lead | null; error: any }> {
    try {
      console.log('📝 Atualizando lead:', leadId, updateData)

      const { data: lead, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao atualizar lead:', error)
      } else {
        console.log('✅ Lead atualizado com sucesso:', lead)
      }

      return { data: lead, error }
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error)
      return { data: null, error }
    }
  },

  // ===== PONTUAÇÕES =====
  async getPontuacoesByLoja(lojaId: string, data?: string): Promise<Pontuacao[]> {
    try {
      let query = supabase
        .from('pontuacoes')
        .select('*')
        .eq('loja_id', lojaId)

      if (data) {
        query = query.eq('data', data)
      }

      const { data: pontuacoes, error } = await query.order('criado_em', { ascending: false })

      if (error) {
        console.error('Erro ao buscar pontuações:', error)
        return []
      }

      return pontuacoes || []
    } catch (error) {
      console.error('Erro ao buscar pontuações:', error)
      return []
    }
  },

  async createPontuacao(pontuacaoData: {
    loja_id: string
    pontos: number
  }): Promise<{ data: Pontuacao | null; error: any }> {
    try {
      const data = new Date().toISOString().split('T')[0] // YYYY-MM-DD

      const { data: pontuacao, error } = await supabase
        .from('pontuacoes')
        .insert({
          ...pontuacaoData,
          data
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar pontuação:', error)
      }

      return { data: pontuacao, error }
    } catch (error) {
      console.error('Erro ao criar pontuação:', error)
      return { data: null, error }
    }
  },

  async adicionarPontosUsuario(
    usuarioId: string, 
    lojaId: string, 
    pontos: number = 50
  ): Promise<{ data: Pontuacao | null; error: any }> {
    try {
      console.log('🎯 [diarioService] Adicionando pontos para usuário:', usuarioId, 'loja:', lojaId, 'pontos:', pontos)
      
      const hoje = new Date().toISOString().split('T')[0]
      
      const pontuacaoData = {
        usuario_id: usuarioId,
        loja_id: lojaId,
        data: hoje,
        pontos
      }

      console.log('📤 [diarioService] Dados da pontuação:', pontuacaoData)

      const { data: pontuacao, error } = await supabase
        .from('pontuacoes')
        .insert(pontuacaoData)
        .select()
        .single()

      if (error) {
        console.error('❌ [diarioService] Erro ao adicionar pontos:', error)
        return { data: null, error }
      }

      console.log('✅ [diarioService] Pontos adicionados com sucesso:', pontuacao)
      return { data: pontuacao, error: null }
    } catch (error) {
      console.error('❌ [diarioService] Erro na função adicionarPontosUsuario:', error)
      return { data: null, error }
    }
  },

  // ===== ESTATÍSTICAS =====
  async getEstatisticasDiarias(lojaId: string, data?: string) {
    try {
      console.log('📊 Calculando estatísticas para loja:', lojaId, 'data:', data)
      
      const dataFiltro = data || new Date().toISOString().split('T')[0]
      
      const leads = await this.getLeadsByLoja(lojaId, dataFiltro)
      
      const estatisticas = {
        totalLeads: leads.length,
        leadsWhatsapp: leads.filter(lead => lead.tipo === 'whatsapp/telefone').length,
        leadsFisicos: leads.filter(lead => lead.tipo === 'cliente físico').length,
        leadsConvertidos: leads.filter(lead => lead.convertido === true).length,
        leadsPerdidos: leads.filter(lead => lead.convertido === false).length,
        leadsPendentes: leads.filter(lead => lead.convertido === null).length,
        taxaConversao: 0
      }

      if (estatisticas.totalLeads > 0) {
        estatisticas.taxaConversao = (estatisticas.leadsConvertidos / estatisticas.totalLeads) * 100
      }

      console.log('📊 Estatísticas calculadas:', estatisticas)

      return estatisticas
    } catch (error) {
      console.error('❌ Erro ao calcular estatísticas:', error)
      return {
        totalLeads: 0,
        leadsWhatsapp: 0,
        leadsFisicos: 0,
        leadsConvertidos: 0,
        leadsPerdidos: 0,
        leadsPendentes: 0,
        taxaConversao: 0
      }
    }
  },

  // ===== RELATÓRIOS =====
  async getLeadsByPeriodo(lojaId: string, dataInicio: string, dataFim: string): Promise<Lead[]> {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('loja_id', lojaId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: false })
        .order('hora', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads por período:', error)
        return []
      }

      return leads || []
    } catch (error) {
      console.error('Erro ao buscar leads por período:', error)
      return []
    }
  },

  async getEstatisticasPorPeriodo(lojaId: string, dataInicio: string, dataFim: string) {
    try {
      const leads = await this.getLeadsByPeriodo(lojaId, dataInicio, dataFim)
      
      const estatisticas = {
        totalLeads: leads.length,
        leadsWhatsapp: leads.filter(lead => lead.tipo === 'whatsapp/telefone').length,
        leadsFisicos: leads.filter(lead => lead.tipo === 'cliente físico').length,
        leadsConvertidos: leads.filter(lead => lead.convertido === true).length,
        leadsPerdidos: leads.filter(lead => lead.convertido === false).length,
        leadsPendentes: leads.filter(lead => lead.convertido === null).length,
        taxaConversao: 0,
        // Estatísticas por dia
        estatisticasPorDia: {} as Record<string, any>
      }

      if (estatisticas.totalLeads > 0) {
        estatisticas.taxaConversao = (estatisticas.leadsConvertidos / estatisticas.totalLeads) * 100
      }

      // Agrupar estatísticas por dia
      leads.forEach(lead => {
        if (!estatisticas.estatisticasPorDia[lead.data]) {
          estatisticas.estatisticasPorDia[lead.data] = {
            data: lead.data,
            total: 0,
            convertidos: 0,
            perdidos: 0,
            pendentes: 0,
            whatsapp: 0,
            fisicos: 0
          }
        }

        const dia = estatisticas.estatisticasPorDia[lead.data]
        dia.total++
        
        if (lead.convertido === true) dia.convertidos++
        else if (lead.convertido === false) dia.perdidos++
        else dia.pendentes++
        
        if (lead.tipo === 'whatsapp/telefone') dia.whatsapp++
        else dia.fisicos++
      })

      return estatisticas
    } catch (error) {
      console.error('Erro ao calcular estatísticas por período:', error)
      return {
        totalLeads: 0,
        leadsWhatsapp: 0,
        leadsFisicos: 0,
        leadsConvertidos: 0,
        leadsPerdidos: 0,
        leadsPendentes: 0,
        taxaConversao: 0,
        estatisticasPorDia: {}
      }
    }
  },

  // ===== UTILITÁRIOS =====
  async verificarPermissaoLoja(userId: string, userLevel: string, lojaId: string): Promise<boolean> {
    try {
      if (userLevel === 'diretor') {
        return true // Diretor tem acesso a todas as lojas
      }

      const lojas = await this.getLojasByUser(userId, userLevel)
      return lojas.some(loja => loja.id === lojaId)
    } catch (error) {
      console.error('Erro ao verificar permissão da loja:', error)
      return false
    }
  },

  async buscarLead(leadId: string): Promise<Lead | null> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (error) {
        console.error('Erro ao buscar lead:', error)
        return null
      }

      return lead
    } catch (error) {
      console.error('Erro ao buscar lead:', error)
      return null
    }
  }
}
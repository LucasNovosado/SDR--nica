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
      let query = supabase
        .from('leads')
        .select('*')
        .eq('loja_id', lojaId)

      if (data) {
        query = query.eq('data', data)
      }

      const { data: leads, error } = await query.order('criado_em', { ascending: false })

      if (error) {
        console.error('Erro ao buscar leads:', error)
        return []
      }

      return leads || []
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      return []
    }
  },

  async createLead(leadData: {
    loja_id: string
    tipo: 'whatsapp/telefone' | 'cliente físico'
  }): Promise<{ data: Lead | null; error: any }> {
    try {
      console.log('Dados recebidos para criar lead:', leadData)
      
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

      console.log('Dados que serão inseridos:', leadToInsert)

      const { data: lead, error } = await supabase
        .from('leads')
        .insert(leadToInsert)
        .select()
        .single()

      if (error) {
        console.error('Erro detalhado ao criar lead:', error)
        console.error('Código do erro:', error.code)
        console.error('Mensagem do erro:', error.message)
        console.error('Detalhes do erro:', error.details)
      } else {
        console.log('Lead criado com sucesso:', lead)
      }

      return { data: lead, error }
    } catch (error) {
      console.error('Erro na função createLead:', error)
      return { data: null, error }
    }
  },

  async updateLeadConversao(leadId: string, convertido: boolean, motivoPerda?: string): Promise<{ data: Lead | null; error: any }> {
    try {
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
        console.error('Erro ao atualizar lead:', error)
      }

      return { data: lead, error }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error)
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

  // ===== ESTATÍSTICAS =====
  async getEstatisticasDiarias(lojaId: string, data?: string) {
    try {
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

      return estatisticas
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
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
  }
}
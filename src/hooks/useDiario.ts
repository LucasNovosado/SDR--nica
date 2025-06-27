import { useState, useEffect } from 'react'
import { diarioService, Loja, Lead } from '../services/diarioService'
import { useAuth } from './useAuth'

export const useDiario = () => {
  const { userWithLevel } = useAuth()
  const [lojas, setLojas] = useState<Loja[]>([])
  const [lojaSelecionada, setLojaSelecionada] = useState<string>('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [estatisticas, setEstatisticas] = useState({
    totalLeads: 0,
    leadsWhatsapp: 0,
    leadsFisicos: 0,
    leadsConvertidos: 0,
    leadsPerdidos: 0,
    leadsPendentes: 0,
    taxaConversao: 0
  })

  // Carregar lojas baseado no usuário
  const carregarLojas = async () => {
    if (!userWithLevel) return

    try {
      setLoading(true)
      const lojasData = await diarioService.getLojasByUser(
        userWithLevel.id,
        userWithLevel.nivel || 'vendedor',
        userWithLevel.loja_id
      )
      
      setLojas(lojasData)
      
      // Auto-selecionar se só tem uma loja ou é vendedor
      if (lojasData.length === 1 || userWithLevel.nivel === 'vendedor') {
        setLojaSelecionada(lojasData[0]?.id || '')
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados da loja selecionada
  const carregarDadosLoja = async (data?: string) => {
    if (!lojaSelecionada) return

    try {
      const dataFiltro = data || new Date().toISOString().split('T')[0]
      
      // Carregar leads
      const leadsData = await diarioService.getLeadsByLoja(lojaSelecionada, dataFiltro)
      setLeads(leadsData)
      
      // Calcular estatísticas
      const stats = await diarioService.getEstatisticasDiarias(lojaSelecionada, dataFiltro)
      setEstatisticas(stats)
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error)
    }
  }

  // Adicionar novo lead
  const adicionarLead = async (tipo: 'whatsapp/telefone' | 'cliente físico') => {
    if (!userWithLevel || !lojaSelecionada) return { success: false }

    try {
      const { data, error } = await diarioService.createLead({
        loja_id: lojaSelecionada,
        tipo
      })

      if (error) {
        console.error('Erro ao adicionar lead:', error)
        return { success: false, error }
      }

      // Recarregar dados
      await carregarDadosLoja()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao adicionar lead:', error)
      return { success: false, error }
    }
  }

  // Atualizar conversão do lead
  const atualizarConversao = async (leadId: string, convertido: boolean, motivoPerda?: string) => {
    try {
      const { data, error } = await diarioService.updateLeadConversao(leadId, convertido, motivoPerda)
      
      if (error) {
        console.error('Erro ao atualizar conversão:', error)
        return { success: false, error }
      }

      // Recarregar dados
      await carregarDadosLoja()
      return { success: true, data }
    } catch (error) {
      console.error('Erro ao atualizar conversão:', error)
      return { success: false, error }
    }
  }

  // Obter loja atual
  const lojaAtual = lojas.find(loja => loja.id === lojaSelecionada)

  // Effects
  useEffect(() => {
    carregarLojas()
  }, [userWithLevel])

  useEffect(() => {
    if (lojaSelecionada) {
      carregarDadosLoja()
    }
  }, [lojaSelecionada])

  return {
    // Estados
    lojas,
    lojaSelecionada,
    setLojaSelecionada,
    leads,
    loading,
    estatisticas,
    lojaAtual,
    
    // Funções
    carregarLojas,
    carregarDadosLoja,
    adicionarLead,
    atualizarConversao,
    
    // Utilitários
    podeVerTodasLojas: userWithLevel?.nivel === 'diretor',
    podeGerenciarLojas: userWithLevel?.nivel === 'diretor' || userWithLevel?.nivel === 'gerente',
    isVendedor: userWithLevel?.nivel === 'vendedor'
  }
}
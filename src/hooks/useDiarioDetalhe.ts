import { useState, useEffect, useCallback } from 'react'
import { diarioService, Loja, Lead, motivosPerdaOptions } from '../services/diarioService'
import { userLevelsService, UserRegra } from '../services/userLevelsService'
import { useAuth } from './useAuth'

export interface FiltrosDetalhe {
  dataInicio: string
  dataFim: string
  lojaId: string
  usuarioId: string
  status: 'Todos' | 'Convertido' | 'Perdido' | 'Pendente'
  tipo: 'Todos' | 'whatsapp/telefone' | 'cliente físico'
}

export const useDiarioDetalhe = () => {
  const { userWithLevel, userLevel, isDirector, isManager } = useAuth()
  const [lojas, setLojas] = useState<Loja[]>([])
  const [usuarios, setUsuarios] = useState<UserRegra[]>([])
  const [filtros, setFiltros] = useState<FiltrosDetalhe>(() => {
    const hoje = new Date().toISOString().split('T')[0]
    return {
      dataInicio: hoje,
      dataFim: hoje,
      lojaId: '',
      usuarioId: '',
      status: 'Todos',
      tipo: 'Todos',
    }
  })
  const [leads, setLeads] = useState<Lead[]>([])
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Carregar lojas conforme permissão
  const carregarLojas = useCallback(async () => {
    if (!userWithLevel) return
    setLoading(true)
    const lojasData = await diarioService.getLojasByUser(
      userWithLevel.id,
      userWithLevel.nivel || 'vendedor',
      userWithLevel.loja_id
    )
    setLojas(lojasData)
    // Auto-selecionar loja se só houver uma
    setFiltros(f => ({ ...f, lojaId: lojasData[0]?.id || '' }))
    setLoading(false)
  }, [userWithLevel])

  // Carregar usuários conforme permissão
  const carregarUsuarios = useCallback(async () => {
    if (isDirector) {
      setUsuarios(await userLevelsService.getAllUsersWithLevels())
    } else if (isManager && filtros.lojaId) {
      // Gerente: só usuários da(s) loja(s) que gerencia
      const todos = await userLevelsService.getAllUsersWithLevels()
      setUsuarios(todos.filter(u => u.loja_id === filtros.lojaId))
    } else if (userWithLevel) {
      // Vendedor/entregador: só ele mesmo
      setUsuarios(t => t.filter(u => u.id === userWithLevel.id))
    }
  }, [isDirector, isManager, filtros.lojaId, userWithLevel])

  // Carregar leads e estatísticas filtrados
  const carregarDados = useCallback(async () => {
    if (!filtros.lojaId) return
    setLoading(true)
    // Leads do período
    let leadsData = await diarioService.getLeadsByPeriodo(filtros.lojaId, filtros.dataInicio, filtros.dataFim)
    // Filtros adicionais
    if (filtros.status !== 'Todos') {
      leadsData = leadsData.filter(l =>
        filtros.status === 'Convertido' ? l.convertido === true :
        filtros.status === 'Perdido' ? l.convertido === false :
        l.convertido === null
      )
    }
    if (filtros.tipo !== 'Todos') {
      leadsData = leadsData.filter(l => l.tipo === filtros.tipo)
    }
    setLeads(leadsData)
    // Estatísticas do período
    const stats = await diarioService.getEstatisticasPorPeriodo(filtros.lojaId, filtros.dataInicio, filtros.dataFim)
    setEstatisticas(stats)
    setLoading(false)
  }, [filtros])

  // Carregar lojas e usuários ao iniciar
  useEffect(() => { carregarLojas() }, [carregarLojas])
  useEffect(() => { carregarUsuarios() }, [carregarUsuarios])
  // Carregar dados ao mudar filtros
  useEffect(() => { carregarDados() }, [carregarDados])

  // Atualizar filtro de loja e resetar usuário
  const setLojaId = (lojaId: string) => setFiltros(f => ({ ...f, lojaId, usuarioId: '' }))
  // Atualizar filtro de usuário
  const setUsuarioId = (usuarioId: string) => setFiltros(f => ({ ...f, usuarioId }))
  // Atualizar filtro de datas
  const setDataInicio = (dataInicio: string) => setFiltros(f => ({ ...f, dataInicio }))
  const setDataFim = (dataFim: string) => setFiltros(f => ({ ...f, dataFim }))
  // Atualizar filtro de status
  const setStatus = (status: FiltrosDetalhe['status']) => setFiltros(f => ({ ...f, status }))
  // Atualizar filtro de tipo
  const setTipo = (tipo: FiltrosDetalhe['tipo']) => setFiltros(f => ({ ...f, tipo }))

  // Motivo de perda mais frequente
  const principalMotivoPerda = leads
    .filter(l => l.motivo_perda)
    .map(l => l.motivo_perda)
    .reduce((acc: Record<string, number>, motivo) => {
      if (motivo) acc[motivo] = (acc[motivo] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const motivoMaisFrequente = Object.entries(principalMotivoPerda).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

  return {
    filtros,
    setLojaId,
    setUsuarioId,
    setDataInicio,
    setDataFim,
    setStatus,
    setTipo,
    lojas,
    usuarios,
    leads,
    estatisticas,
    motivoMaisFrequente,
    motivosPerdaOptions,
    loading
  }
  
} 

//testec
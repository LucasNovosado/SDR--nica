import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { diarioService, Loja, Lead } from '../../services/diarioService'
import { 
  ArrowLeft,
  Plus,
  Users,
  MessageCircle,
  TrendingUp,
  Store,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from 'lucide-react'
import MotivoPerdaModal from './MotivoPerdaModal'
import AdicionarLeadModal from './AdicionarLeadModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import CalendarDateFilter from './CalendarDateFilter'
import './DiarioLojaPage.css'

const DiarioLojaPage: React.FC = () => {
  const { userWithLevel } = useAuth()
  const navigate = useNavigate()
  
  const [lojas, setLojas] = useState<Loja[]>([])
  const [lojaSelecionada, setLojaSelecionada] = useState<string>('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [dataInicio, setDataInicio] = useState<string>(new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState<string>(new Date().toISOString().split('T')[0])
  const [estatisticas, setEstatisticas] = useState({
    totalLeads: 0,
    leadsWhatsapp: 0,
    leadsFisicos: 0,
    leadsConvertidos: 0,
    leadsPerdidos: 0,
    leadsPendentes: 0,
    taxaConversao: 0
  })
  const [loading, setLoading] = useState(true)
  const [showMotivoPerdaModal, setShowMotivoPerdaModal] = useState(false)
  const [showAdicionarLeadModal, setShowAdicionarLeadModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [leadSelecionado, setLeadSelecionado] = useState<string>('')
  const [leadParaDeletar, setLeadParaDeletar] = useState<Lead | null>(null)

  useEffect(() => {
    console.log('🔄 useEffect - userWithLevel mudou:', userWithLevel)
    carregarLojas()
  }, [userWithLevel])

  useEffect(() => {
    console.log('🔄 useEffect - lojaSelecionada mudou:', lojaSelecionada)
    if (lojaSelecionada) {
      carregarDadosLoja()
    } else {
      console.log('⚠️ Nenhuma loja selecionada, resetando dados')
      setLeads([])
      setEstatisticas({
        totalLeads: 0,
        leadsWhatsapp: 0,
        leadsFisicos: 0,
        leadsConvertidos: 0,
        leadsPerdidos: 0,
        leadsPendentes: 0,
        taxaConversao: 0
      })
    }
  }, [lojaSelecionada, dataInicio, dataFim])

  const carregarLojas = async () => {
    if (!userWithLevel) {
      console.log('⚠️ Usuário não encontrado, pulando carregamento de lojas')
      return
    }

    console.log('🏪 Carregando lojas para usuário:', userWithLevel.email, 'nível:', userWithLevel.nivel)

    try {
      setLoading(true)
      const lojasData = await diarioService.getLojasByUser(
        userWithLevel.id,
        userWithLevel.nivel || 'vendedor',
        userWithLevel.loja_id
      )
      
      console.log('✅ Lojas carregadas:', lojasData.length, lojasData)
      setLojas(lojasData)
      
      if (lojasData.length === 1 || userWithLevel.nivel === 'vendedor') {
        const lojaId = lojasData[0]?.id || ''
        console.log('🎯 Auto-selecionando loja:', lojaId)
        setLojaSelecionada(lojaId)
      } else {
        console.log('🔄 Múltiplas lojas disponíveis, aguardando seleção manual')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarDadosLoja = async () => {
    if (!lojaSelecionada) {
      console.log('⚠️ Nenhuma loja selecionada, pulando carregamento de dados')
      return
    }

    console.log('📊 Carregando dados da loja:', lojaSelecionada, 'período:', dataInicio, 'até', dataFim)

    try {
      // Carregar leads por período
      console.log('🔍 Buscando leads...')
      const leadsData = await diarioService.getLeadsByPeriodo(lojaSelecionada, dataInicio, dataFim)
      console.log('📋 Leads carregados:', leadsData.length, leadsData)
      setLeads(leadsData)
      
      // Carregar estatísticas por período
      console.log('📊 Calculando estatísticas...')
      const stats = await diarioService.getEstatisticasPorPeriodo(lojaSelecionada, dataInicio, dataFim)
      console.log('📈 Estatísticas carregadas:', stats)
      setEstatisticas(stats)
    } catch (error) {
      console.error('❌ Erro ao carregar dados da loja:', error)
    }
  }

  const adicionarLead = async (tipo: 'whatsapp/telefone' | 'cliente físico', lojaId?: string) => {
    const lojaParaUsar = lojaId || lojaSelecionada
    
    console.log('➕ Adicionando lead:', tipo, 'para loja:', lojaParaUsar)
    
    if (!lojaParaUsar) {
      console.log('❌ Nenhuma loja especificada')
      return
    }

    try {
      const { data, error } = await diarioService.createLead({
        loja_id: lojaParaUsar,
        tipo
      })

      if (error) {
        console.error('❌ Erro ao adicionar lead:', error)
        alert(`Erro ao adicionar lead: ${error.message || 'Erro desconhecido'}`)
        return
      }

      if (data) {
        console.log('✅ Lead adicionado com sucesso:', data)
        
        if (lojaParaUsar !== lojaSelecionada) {
          console.log('🔄 Mudando loja selecionada para:', lojaParaUsar)
          setLojaSelecionada(lojaParaUsar)
        } else {
          await carregarDadosLoja()
        }
      }
    } catch (error) {
      console.error('❌ Erro na função adicionarLead:', error)
      alert('Erro inesperado ao adicionar lead')
    }
  }

  const handleLeadConversao = async (leadId: string, convertido: boolean) => {
    console.log('🔄 Alterando conversão do lead:', leadId, 'para:', convertido)
    
    if (convertido) {
      try {
        const { error } = await diarioService.updateLeadConversao(leadId, true)
        if (!error) {
          await carregarDadosLoja()
        }
      } catch (error) {
        console.error('❌ Erro ao converter lead:', error)
      }
    } else {
      setLeadSelecionado(leadId)
      setShowMotivoPerdaModal(true)
    }
  }

  const handleMotivoPerdaConfirm = async (motivo: string) => {
    console.log('💼 Registrando motivo de perda:', motivo, 'para lead:', leadSelecionado)
    
    try {
      const { error } = await diarioService.updateLeadConversao(leadSelecionado, false, motivo)
      if (!error) {
        await carregarDadosLoja()
      }
    } catch (error) {
      console.error('❌ Erro ao registrar perda:', error)
    } finally {
      setShowMotivoPerdaModal(false)
      setLeadSelecionado('')
    }
  }

  const handleDeleteLead = (lead: Lead) => {
    console.log('🗑️ Preparando para deletar lead:', lead.id)
    setLeadParaDeletar(lead)
    setShowDeleteModal(true)
  }

  const confirmDeleteLead = async () => {
    if (!leadParaDeletar) return

    console.log('🗑️ Confirmando deleção do lead:', leadParaDeletar.id)

    try {
      const { error } = await diarioService.deleteLead(leadParaDeletar.id)
      if (!error) {
        console.log('✅ Lead deletado com sucesso')
        await carregarDadosLoja()
      } else {
        console.error('❌ Erro ao deletar lead:', error)
        alert('Erro ao excluir cliente')
      }
    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error)
      alert('Erro inesperado ao excluir cliente')
    } finally {
      setShowDeleteModal(false)
      setLeadParaDeletar(null)
    }
  }

  const formatarHora = (hora: string) => {
    return hora.substring(0, 5)
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    console.log('📅 Período alterado:', startDate, 'até', endDate)
    setDataInicio(startDate)
    setDataFim(endDate)
  }

  const formatarDataExibicao = (dataInicio: string, dataFim: string) => {
    const hoje = new Date().toISOString().split('T')[0]
    
    if (dataInicio === dataFim && dataInicio === hoje) return 'Hoje'
    if (dataInicio === dataFim) {
      const dataObj = new Date(dataInicio + 'T00:00:00')
      return dataObj.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    const inicioObj = new Date(dataInicio + 'T00:00:00')
    const fimObj = new Date(dataFim + 'T00:00:00')
    
    return `${inicioObj.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit'
    })} - ${fimObj.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })}`
  }

  // Verificações de estado
  console.log('🔍 Estado atual:')
  console.log('  - userWithLevel:', userWithLevel?.email, userWithLevel?.nivel)
  console.log('  - lojas:', lojas.length)
  console.log('  - lojaSelecionada:', lojaSelecionada)
  console.log('  - leads:', leads.length)
  console.log('  - loading:', loading)

  const loja = lojas.find(l => l.id === lojaSelecionada)
  const showLojaSelector = lojas.length > 1 && userWithLevel?.nivel !== 'vendedor'

  if (loading) {
    return (
      <div className="diario-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="diario-container">
      <div className="diario-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1 className="page-title">Diário da Loja</h1>
        </div>

        {showLojaSelector && (
          <select 
            value={lojaSelecionada} 
            onChange={(e) => {
              console.log('🏪 Loja selecionada manualmente:', e.target.value)
              setLojaSelecionada(e.target.value)
            }}
            className="loja-select"
          >
            <option value="">Selecione uma loja</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {lojaSelecionada && loja && (
        <div className="diario-content">
          {/* Header da Loja */}
          <div className="loja-header">
            <h2>{loja.nome}</h2>
          </div>

          {/* Filtro de Data */}
          <div className="date-filter-section">
            <CalendarDateFilter
              onDateRangeChange={handleDateRangeChange}
              initialStartDate={dataInicio}
              initialEndDate={dataFim}
            />
          </div>

          {/* Métricas Principais */}
          <div className="metrics-card">
            <div className="metrics-row main">
              <div className="metric">
                <div className="metric-number total">{estatisticas.totalLeads}</div>
                <div className="metric-label">Clientes</div>
              </div>
              <div className="metric">
                <div className="metric-number success">{estatisticas.leadsConvertidos}</div>
                <div className="metric-label">Vendas</div>
              </div>
              <div className="metric">
                <div className="metric-number danger">{estatisticas.leadsPerdidos}</div>
                <div className="metric-label">Perdidas</div>
              </div>
            </div>

            <div className="metrics-row secondary">
              <div className="metric">
                <div className="metric-number">{estatisticas.taxaConversao.toFixed(0)}%</div>
                <div className="metric-label">Conversão</div>
              </div>
            </div>
          </div>

          {/* Lista de Leads */}
          <div className="leads-card">
            <div className="leads-header">
              <h3>Clientes ({leads.length})</h3>
            </div>

            {leads.length > 0 ? (
              <div className="leads-list">
                {leads.map((lead) => (
                  <div key={lead.id} className={`lead-item ${lead.convertido === true ? 'success' : lead.convertido === false ? 'danger' : 'pending'}`}>
                    <div className="lead-info">
                      <div className="lead-tipo">
                        {lead.tipo === 'whatsapp/telefone' ? (
                          <MessageCircle size={16} />
                        ) : (
                          <Users size={16} />
                        )}
                        <span>{lead.tipo === 'whatsapp/telefone' ? 'WhatsApp' : 'Físico'}</span>
                      </div>
                      <div className="lead-hora">{formatarHora(lead.hora)}</div>
                    </div>
                    
                    {lead.motivo_perda && (
                      <div className="lead-motivo">{lead.motivo_perda}</div>
                    )}

                    <div className="lead-actions">
                      {lead.convertido === null && (
                        <>
                          <button
                            className="action-btn success"
                            onClick={() => handleLeadConversao(lead.id, true)}
                            title="Marcar como vendido"
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            className="action-btn danger"
                            onClick={() => handleLeadConversao(lead.id, false)}
                            title="Marcar como perdido"
                          >
                            <ThumbsDown size={14} />
                          </button>
                        </>
                      )}
                      
                      {/* Botão de deletar - sempre visível */}
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteLead(lead)}
                        title="Excluir cliente"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <h3>Nenhum cliente registrado</h3>
                <p>Nenhum cliente foi registrado no período de {formatarDataExibicao(dataInicio, dataFim)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!lojaSelecionada && showLojaSelector && (
        <div className="empty-state">
          <Store size={48} />
          <h3>Selecione uma loja</h3>
          <p>Escolha uma loja para visualizar o diário</p>
        </div>
      )}

      {lojas.length === 0 && (
        <div className="empty-state">
          <Store size={48} />
          <h3>Nenhuma loja encontrada</h3>
          <p>Você não tem permissão para visualizar dados de lojas</p>
        </div>
      )}

      {/* FAB Button */}
      {(lojaSelecionada || showLojaSelector) && (
        <button 
          className="fab-button"
          onClick={() => setShowAdicionarLeadModal(true)}
        >
          <Plus size={24} />
        </button>
      )}

      {/* Modais */}
      <MotivoPerdaModal
        isOpen={showMotivoPerdaModal}
        onClose={() => setShowMotivoPerdaModal(false)}
        onConfirm={handleMotivoPerdaConfirm}
      />

      <AdicionarLeadModal
        isOpen={showAdicionarLeadModal}
        onClose={() => setShowAdicionarLeadModal(false)}
        onConfirm={adicionarLead}
        lojas={lojas}
        lojaSelecionada={lojaSelecionada}
        showLojaSelector={showLojaSelector}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        leadTipo={leadParaDeletar?.tipo || ''}
        leadHora={leadParaDeletar ? formatarHora(leadParaDeletar.hora) : ''}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteLead}
      />
    </div>
  )
}

export default DiarioLojaPage
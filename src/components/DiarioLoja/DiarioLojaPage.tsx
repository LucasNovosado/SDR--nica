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
import './DiarioLojaPage.css'

const DiarioLojaPage: React.FC = () => {
  const { userWithLevel } = useAuth()
  const navigate = useNavigate()
  
  const [lojas, setLojas] = useState<Loja[]>([])
  const [lojaSelecionada, setLojaSelecionada] = useState<string>('')
  const [leads, setLeads] = useState<Lead[]>([])
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
    carregarLojas()
  }, [userWithLevel])

  useEffect(() => {
    if (lojaSelecionada) {
      carregarDadosLoja()
    }
  }, [lojaSelecionada])

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
      
      if (lojasData.length === 1 || userWithLevel.nivel === 'vendedor') {
        setLojaSelecionada(lojasData[0]?.id || '')
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarDadosLoja = async () => {
    if (!lojaSelecionada) return

    try {
      const hoje = new Date().toISOString().split('T')[0]
      const leadsData = await diarioService.getLeadsByLoja(lojaSelecionada, hoje)
      setLeads(leadsData)
      const stats = await diarioService.getEstatisticasDiarias(lojaSelecionada, hoje)
      setEstatisticas(stats)
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error)
    }
  }

  const adicionarLead = async (tipo: 'whatsapp/telefone' | 'cliente físico', lojaId?: string) => {
    const lojaParaUsar = lojaId || lojaSelecionada
    
    if (!lojaParaUsar) return

    try {
      const { data, error } = await diarioService.createLead({
        loja_id: lojaParaUsar,
        tipo
      })

      if (error) {
        alert(`Erro ao adicionar lead: ${error.message || 'Erro desconhecido'}`)
        return
      }

      if (data) {
        if (lojaParaUsar !== lojaSelecionada) {
          setLojaSelecionada(lojaParaUsar)
        }
        await carregarDadosLoja()
      }
    } catch (error) {
      console.error('Erro na função adicionarLead:', error)
      alert('Erro inesperado ao adicionar lead')
    }
  }

  const handleLeadConversao = async (leadId: string, convertido: boolean) => {
    if (convertido) {
      try {
        const { error } = await diarioService.updateLeadConversao(leadId, true)
        if (!error) {
          await carregarDadosLoja()
        }
      } catch (error) {
        console.error('Erro ao converter lead:', error)
      }
    } else {
      setLeadSelecionado(leadId)
      setShowMotivoPerdaModal(true)
    }
  }

  const handleMotivoPerdaConfirm = async (motivo: string) => {
    try {
      const { error } = await diarioService.updateLeadConversao(leadSelecionado, false, motivo)
      if (!error) {
        await carregarDadosLoja()
      }
    } catch (error) {
      console.error('Erro ao registrar perda:', error)
    } finally {
      setShowMotivoPerdaModal(false)
      setLeadSelecionado('')
    }
  }

  const handleDeleteLead = (lead: Lead) => {
    setLeadParaDeletar(lead)
    setShowDeleteModal(true)
  }

  const confirmDeleteLead = async () => {
    if (!leadParaDeletar) return

    try {
      const { error } = await diarioService.deleteLead(leadParaDeletar.id)
      if (!error) {
        await carregarDadosLoja()
      } else {
        console.error('Erro ao deletar lead:', error)
        alert('Erro ao excluir cliente')
      }
    } catch (error) {
      console.error('Erro ao deletar lead:', error)
      alert('Erro inesperado ao excluir cliente')
    } finally {
      setShowDeleteModal(false)
      setLeadParaDeletar(null)
    }
  }

  const formatarHora = (hora: string) => {
    return hora.substring(0, 5)
  }

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
            onChange={(e) => setLojaSelecionada(e.target.value)}
            className="loja-select"
          >
            <option value="">Selecione uma loja</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>
                {loja.nome} - {loja.cidade}
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
            <p>{loja.cidade}, {loja.estado}</p>
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
          {leads.length > 0 && (
            <div className="leads-card">
              <h3>Clientes de Hoje ({leads.length})</h3>
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
            </div>
          )}
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
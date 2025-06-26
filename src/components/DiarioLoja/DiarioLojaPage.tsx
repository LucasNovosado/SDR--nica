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
  Store
} from 'lucide-react'
import ContadorLeads from './ContadorLeads'
import ListaLeads from './ListaLeads'
import MotivoPerdaModal from './MotivoPerdaModal'
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
  const [leadSelecionado, setLeadSelecionado] = useState<string>('')

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
      
      // Se só tem uma loja ou é vendedor, seleciona automaticamente
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
      
      // Carregar leads do dia
      const leadsData = await diarioService.getLeadsByLoja(lojaSelecionada, hoje)
      setLeads(leadsData)
      
      // Calcular estatísticas
      const stats = await diarioService.getEstatisticasDiarias(lojaSelecionada, hoje)
      setEstatisticas(stats)
    } catch (error) {
      console.error('Erro ao carregar dados da loja:', error)
    }
  }

  const adicionarLead = async (tipo: 'whatsapp/telefone' | 'cliente físico') => {
    if (!userWithLevel || !lojaSelecionada) return

    try {
      const { data, error } = await diarioService.createLead({
        usuario_id: userWithLevel.id,
        loja_id: lojaSelecionada,
        tipo,
        origem: 'diario_loja'
      })

      if (error) {
        console.error('Erro ao adicionar lead:', error)
        return
      }

      // Recarregar dados
      await carregarDadosLoja()
    } catch (error) {
      console.error('Erro ao adicionar lead:', error)
    }
  }

  const handleLeadConversao = async (leadId: string, convertido: boolean) => {
    if (convertido) {
      // Conversão positiva - atualizar diretamente
      try {
        const { error } = await diarioService.updateLeadConversao(leadId, true)
        if (!error) {
          await carregarDadosLoja()
        }
      } catch (error) {
        console.error('Erro ao converter lead:', error)
      }
    } else {
      // Conversão negativa - abrir modal para motivo
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

  const loja = lojas.find(l => l.id === lojaSelecionada)

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
      <div className="diario-background">
        <div className="floating-elements">
          <div className="floating-element blue"></div>
          <div className="floating-element yellow"></div>
          <div className="floating-element blue small"></div>
          <div className="floating-element yellow small"></div>
        </div>
      </div>

      <div className="diario-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/menu')}>
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1 className="page-title">
            <span className="text-gradient-blue">Diário da</span>
            <span className="text-gradient-yellow"> Loja</span>
          </h1>
        </div>

        {lojas.length > 1 && (
          <div className="loja-selector">
            <Store size={20} />
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
          </div>
        )}
      </div>

      {lojaSelecionada && loja && (
        <div className="diario-content">
          <div className="loja-info">
            <h2 className="loja-nome">{loja.nome}</h2>
            <p className="loja-detalhes">{loja.cidade}, {loja.estado}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estatisticas.totalLeads}</h3>
                <p className="stat-label">Total de Leads</p>
              </div>
            </div>

            <div className="stat-card yellow">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estatisticas.taxaConversao.toFixed(1)}%</h3>
                <p className="stat-label">Taxa de Conversão</p>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">
                <MessageCircle size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{estatisticas.leadsConvertidos}</h3>
                <p className="stat-label">Convertidos</p>
              </div>
            </div>
          </div>

          <ContadorLeads 
            leadsWhatsapp={estatisticas.leadsWhatsapp}
            leadsFisicos={estatisticas.leadsFisicos}
            onAdicionarLead={adicionarLead}
          />

          <ListaLeads 
            leads={leads}
            onLeadConversao={handleLeadConversao}
          />
        </div>
      )}

      {!lojaSelecionada && lojas.length > 1 && (
        <div className="empty-state">
          <Store size={64} className="empty-icon" />
          <h3>Selecione uma loja</h3>
          <p>Escolha uma loja para visualizar o diário</p>
        </div>
      )}

      {lojas.length === 0 && (
        <div className="empty-state">
          <Store size={64} className="empty-icon" />
          <h3>Nenhuma loja encontrada</h3>
          <p>Você não tem permissão para visualizar dados de lojas</p>
        </div>
      )}

      <MotivoPerdaModal
        isOpen={showMotivoPerdaModal}
        onClose={() => setShowMotivoPerdaModal(false)}
        onConfirm={handleMotivoPerdaConfirm}
      />
    </div>
  )
}

export default DiarioLojaPage
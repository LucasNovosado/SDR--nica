import React from 'react'
import { Lead } from '../../services/diarioService'
import { ThumbsUp, ThumbsDown, MessageCircle, Users, Clock, Edit } from 'lucide-react'
import './ListaLeads.css'

interface ListaLeadsProps {
  leads: Lead[]
  onLeadConversao: (leadId: string, convertido: boolean) => void
  onEditarLead: (lead: Lead) => void
}

const ListaLeads: React.FC<ListaLeadsProps> = ({ leads, onLeadConversao, onEditarLead }) => {
  const formatarHora = (hora: string) => {
    return hora.substring(0, 5) // HH:MM
  }

  const getStatusColor = (convertido: boolean | null) => {
    if (convertido === true) return 'success'
    if (convertido === false) return 'danger'
    return 'pending'
  }

  const getStatusText = (convertido: boolean | null) => {
    if (convertido === true) return 'Convertido'
    if (convertido === false) return 'Perdido'
    return 'Pendente'
  }

  if (leads.length === 0) {
    return (
      <div className="lista-leads-container">
        <h3 className="lista-title">Clientes do Dia</h3>
        <div className="empty-leads">
          <Users size={48} className="empty-icon" />
          <h4>Nenhum lead registrado hoje</h4>
          <p>Use os contadores acima para adicionar novos leads</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lista-leads-container">
      <h3 className="lista-title">Clientes do Dia ({leads.length})</h3>
      
      <div className="leads-grid">
        {leads.map((lead) => (
          <div key={lead.id} className={`lead-card ${getStatusColor(lead.convertido)}`}>
            <div className="lead-header">
              <div className="lead-tipo">
                {lead.tipo === 'whatsapp/telefone' ? (
                  <div className="tipo-icon whatsapp">
                    <MessageCircle size={20} />
                    <span>WhatsApp</span>
                  </div>
                ) : (
                  <div className="tipo-icon fisico">
                    <Users size={20} />
                    <span>Físico</span>
                  </div>
                )}
              </div>
              
              <div className="lead-info">
                <div className="lead-hora">
                  <Clock size={16} />
                  <span>{formatarHora(lead.hora)}</span>
                </div>
                
                <button
                  className="edit-button"
                  onClick={() => onEditarLead(lead)}
                  title="Editar lead"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            <div className="lead-status">
              <span className={`status-badge ${getStatusColor(lead.convertido)}`}>
                {getStatusText(lead.convertido)}
              </span>
            </div>

            {lead.motivo_perda && (
              <div className="motivo-perda">
                <strong>Motivo da perda:</strong> {lead.motivo_perda}
              </div>
            )}

            {lead.convertido === null && (
              <div className="lead-actions">
                <button
                  className="action-button success"
                  onClick={() => onLeadConversao(lead.id, true)}
                  title="Marcar como convertido"
                >
                  <ThumbsUp size={18} />
                  Converteu
                </button>
                
                <button
                  className="action-button danger"
                  onClick={() => onLeadConversao(lead.id, false)}
                  title="Marcar como perdido"
                >
                  <ThumbsDown size={18} />
                  Perdeu
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListaLeads
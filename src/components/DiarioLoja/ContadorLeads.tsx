import React from 'react'
import { Plus, MessageCircle, Users } from 'lucide-react'
import './ContadorLeads.css'

interface ContadorLeadsProps {
  leadsWhatsapp: number
  leadsFisicos: number
  onAdicionarLead: (tipo: 'whatsapp/telefone' | 'cliente físico') => void
}

const ContadorLeads: React.FC<ContadorLeadsProps> = ({
  leadsWhatsapp,
  leadsFisicos,
  onAdicionarLead
}) => {
  return (
    <div className="contador-container">
      <h3 className="contador-title">Contador de Leads</h3>
      
      <div className="contador-grid">
        {/* Cliente Físico */}
        <div className="contador-card blue">
          <div className="contador-header">
            <div className="contador-icon blue">
              <Users size={32} />
            </div>
            <div className="contador-info">
              <h4 className="contador-label">Cliente Físico</h4>
              <span className="contador-numero">{leadsFisicos}</span>
            </div>
          </div>
          
          <button 
            className="add-button blue"
            onClick={() => onAdicionarLead('cliente físico')}
          >
            <Plus size={20} />
            Adicionar
          </button>
        </div>

        {/* WhatsApp/Telefone */}
        <div className="contador-card green">
          <div className="contador-header">
            <div className="contador-icon green">
              <MessageCircle size={32} />
            </div>
            <div className="contador-info">
              <h4 className="contador-label">WhatsApp/Telefone</h4>
              <span className="contador-numero">{leadsWhatsapp}</span>
            </div>
          </div>
          
          <button 
            className="add-button green"
            onClick={() => onAdicionarLead('whatsapp/telefone')}
          >
            <Plus size={20} />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContadorLeads
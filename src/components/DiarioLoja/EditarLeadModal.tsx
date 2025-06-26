import React, { useState, useEffect } from 'react'
import { Lead } from '../../services/diarioService'
import { X, Save, MessageCircle, Users, Calendar, Clock } from 'lucide-react'

interface EditarLeadModalProps {
  isOpen: boolean
  lead: Lead | null
  onClose: () => void
  onConfirm: (leadId: string, novoTipo: 'whatsapp/telefone' | 'cliente físico', novaData: string, novaHora: string) => void
}

const EditarLeadModal: React.FC<EditarLeadModalProps> = ({ isOpen, lead, onClose, onConfirm }) => {
  const [tipo, setTipo] = useState<'whatsapp/telefone' | 'cliente físico'>('whatsapp/telefone')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')

  useEffect(() => {
    if (lead) {
      setTipo(lead.tipo)
      setData(lead.data)
      setHora(lead.hora.substring(0, 5)) // HH:MM apenas
    }
  }, [lead])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lead && data && hora) {
      onConfirm(lead.id, tipo, data, hora + ':00') // Adiciona segundos
      onClose()
    }
  }

  if (!isOpen || !lead) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Editar Cliente</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Tipo de Cliente</label>
            <div className="tipo-options">
              <button
                type="button"
                className={`tipo-option ${tipo === 'whatsapp/telefone' ? 'selected' : ''}`}
                onClick={() => setTipo('whatsapp/telefone')}
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                className={`tipo-option ${tipo === 'cliente físico' ? 'selected' : ''}`}
                onClick={() => setTipo('cliente físico')}
              >
                <Users size={20} />
                <span>Físico</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Clock size={16} />
              Horário
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              <Save size={16} />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarLeadModal
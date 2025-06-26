import React, { useState } from 'react'
import { X, Plus, Users, MessageCircle, Store } from 'lucide-react'
import './AdicionarLeadModal.css'

interface Loja {
  id: string
  nome: string
  cidade: string
  estado: string
}

interface AdicionarLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (tipo: 'whatsapp/telefone' | 'cliente físico', lojaId?: string) => void
  lojas: Loja[]
  lojaSelecionada?: string
  showLojaSelector: boolean
}

const AdicionarLeadModal: React.FC<AdicionarLeadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lojas,
  lojaSelecionada,
  showLojaSelector
}) => {
  const [tipoSelecionado, setTipoSelecionado] = useState<'whatsapp/telefone' | 'cliente físico' | ''>('')
  const [lojaEscolhida, setLojaEscolhida] = useState(lojaSelecionada || '')

  const handleConfirm = () => {
    if (tipoSelecionado && (!showLojaSelector || lojaEscolhida)) {
      onConfirm(tipoSelecionado, showLojaSelector ? lojaEscolhida : lojaSelecionada)
      handleClose()
    }
  }

  const handleClose = () => {
    setTipoSelecionado('')
    setLojaEscolhida(lojaSelecionada || '')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon lead">
            <Plus size={24} />
          </div>
          <h3 className="modal-title">Adicionar Lead</h3>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Selecione o tipo de lead que deseja adicionar:
          </p>

          <div className="tipos-list">
            <label className={`tipo-option ${tipoSelecionado === 'cliente físico' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="tipo"
                value="cliente físico"
                checked={tipoSelecionado === 'cliente físico'}
                onChange={(e) => setTipoSelecionado(e.target.value as 'cliente físico')}
              />
              <div className="tipo-content">
                <div className="tipo-icon blue">
                  <Users size={24} />
                </div>
                <span className="tipo-text">Cliente Físico</span>
              </div>
            </label>

            <label className={`tipo-option ${tipoSelecionado === 'whatsapp/telefone' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="tipo"
                value="whatsapp/telefone"
                checked={tipoSelecionado === 'whatsapp/telefone'}
                onChange={(e) => setTipoSelecionado(e.target.value as 'whatsapp/telefone')}
              />
              <div className="tipo-content">
                <div className="tipo-icon green">
                  <MessageCircle size={24} />
                </div>
                <span className="tipo-text">WhatsApp/Telefone</span>
              </div>
            </label>
          </div>

          {showLojaSelector && (
            <div className="loja-selector-section">
              <label className="loja-label">
                <Store size={20} />
                Selecione a loja:
              </label>
              <select 
                value={lojaEscolhida} 
                onChange={(e) => setLojaEscolhida(e.target.value)}
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

        <div className="modal-actions">
          <button className="action-btn cancel" onClick={handleClose}>
            Cancelar
          </button>
          <button 
            className="action-btn confirm" 
            onClick={handleConfirm}
            disabled={!tipoSelecionado || (showLojaSelector && !lojaEscolhida)}
          >
            <Plus size={18} />
            Adicionar Lead
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdicionarLeadModal
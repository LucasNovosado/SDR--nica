import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { motivosPerdaOptions } from '../../services/diarioService'
import './MotivoPerdaModal.css'

interface MotivoPerdaModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (motivo: string) => void
}

const MotivoPerdaModal: React.FC<MotivoPerdaModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  const [motivoSelecionado, setMotivoSelecionado] = useState('')

  const handleConfirm = () => {
    if (motivoSelecionado) {
      onConfirm(motivoSelecionado)
      setMotivoSelecionado('')
    }
  }

  const handleClose = () => {
    setMotivoSelecionado('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">
            <AlertTriangle size={24} />
          </div>
          <h3 className="modal-title">Motivo da Perda</h3>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Selecione o motivo pelo qual este lead não foi convertido:
          </p>

          <div className="motivos-list">
            {motivosPerdaOptions.map((motivo) => (
              <label key={motivo} className="motivo-option">
                <input
                  type="radio"
                  name="motivo"
                  value={motivo}
                  checked={motivoSelecionado === motivo}
                  onChange={(e) => setMotivoSelecionado(e.target.value)}
                />
                <span className="motivo-text">{motivo}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="motivo-perda-cancel-btn" onClick={handleClose}>
            Cancelar
          </button>
          <button 
            className="motivo-perda-confirm-btn" 
            onClick={handleConfirm}
            disabled={!motivoSelecionado}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

export default MotivoPerdaModal
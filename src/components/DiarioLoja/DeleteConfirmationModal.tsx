// DeleteConfirmationModal.tsx
import React from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  leadTipo: string
  leadHora: string
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  leadTipo, 
  leadHora, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="delete-modal-content">
        <div className="delete-modal-header">
          <div className="delete-icon-container">
            <AlertTriangle size={24} />
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h3>Excluir Cliente</h3>
          <p>
            Tem certeza que deseja excluir este cliente?
          </p>
          <div className="lead-preview">
            <span className="lead-type">{leadTipo === 'whatsapp/telefone' ? 'WhatsApp' : 'Físico'}</span>
            <span className="lead-time">{leadHora}</span>
          </div>
          <p className="warning-text">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="delete-modal-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="btn-delete">
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
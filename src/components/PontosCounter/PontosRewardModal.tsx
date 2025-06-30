import React, { useState, useEffect } from 'react'
import { Trophy, Star, Sparkles, X } from 'lucide-react'
import './PontosRewardModal.css'

interface PontosRewardModalProps {
  isOpen: boolean
  pontosGanhos: number
  onClose: () => void
  leadTipo?: string
  leadConvertido?: boolean
}

const PontosRewardModal: React.FC<PontosRewardModalProps> = ({
  isOpen,
  pontosGanhos,
  onClose,
  leadTipo,
  leadConvertido
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'details'>('enter')

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('enter')
      setShowDetails(false)
      
      const timer1 = setTimeout(() => {
        setAnimationPhase('celebrate')
      }, 500)
      
      const timer2 = setTimeout(() => {
        setAnimationPhase('details')
        setShowDetails(true)
      }, 1500)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isOpen])

  const handleClose = () => {
    setAnimationPhase('enter')
    setShowDetails(false)
    onClose()
  }

  const getSuccessMessage = () => {
    if (leadConvertido === true) {
      return {
        title: '🎉 Venda Confirmada!',
        subtitle: 'Parabéns pela conversão!',
        description: `Você confirmou que o lead ${leadTipo === 'whatsapp/telefone' ? 'do WhatsApp' : 'físico'} foi convertido em venda.`
      }
    } else if (leadConvertido === false) {
      return {
        title: '📝 Feedback Registrado',
        subtitle: 'Obrigado pelo preenchimento!',
        description: `Você registrou o motivo da não conversão do lead ${leadTipo === 'whatsapp/telefone' ? 'do WhatsApp' : 'físico'}.`
      }
    } else {
      return {
        title: '✅ Ação Concluída!',
        subtitle: 'Muito bem!',
        description: 'Você completou uma ação importante no sistema.'
      }
    }
  }

  const message = getSuccessMessage()

  if (!isOpen) return null

  return (
    <div className="pontos-reward-overlay" onClick={handleClose}>
      <div className="pontos-reward-container" onClick={(e) => e.stopPropagation()}>
        {/* Partículas de fundo */}
        <div className="reward-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }} />
          ))}
        </div>

        {/* Header do Modal */}
        <div className="reward-header">
          <div className={`reward-trophy ${animationPhase}`}>
            <Trophy size={48} />
            <div className="trophy-glow"></div>
          </div>
          <button className="reward-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo Principal */}
        <div className="reward-content">
          <div className={`reward-title ${animationPhase}`}>
            {message.title}
          </div>
          
          <div className={`reward-subtitle ${animationPhase}`}>
            {message.subtitle}
          </div>
          
          <div className={`reward-description ${animationPhase}`}>
            {message.description}
          </div>

          {/* Pontos Ganhos */}
          <div className={`reward-points ${animationPhase}`}>
            <div className="points-earned">
              <Star size={24} />
              <span className="points-number">+{pontosGanhos}</span>
              <span className="points-label">Pontos</span>
            </div>
            
            {showDetails && (
              <div className="points-animation">
                <Sparkles size={16} />
                <span>Pontos adicionados!</span>
              </div>
            )}
          </div>
        </div>

        {/* Botão de Ação */}
        {showDetails && (
          <div className="reward-actions">
            <button className="reward-btn continue" onClick={handleClose}>
              <Trophy size={18} />
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PontosRewardModal
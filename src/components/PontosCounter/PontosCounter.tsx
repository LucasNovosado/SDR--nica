import React, { useState } from 'react'
import { Trophy, Star } from 'lucide-react'
import { usePontos } from '../../hooks/usePontos'
import './PontosCounter.css'

const PontosCounter: React.FC = () => {
  const { totalPontos, pontosHoje, loading, formatarPontos, nivelInfo } = usePontos()
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div className="pontos-counter loading">
        <div className="pontos-loading-spinner"></div>
      </div>
    )
  }

  return (
    <div 
      className={`pontos-counter ${expanded ? 'expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="pontos-main">
        <div className="pontos-icon">
          <Trophy size={20} />
        </div>
        <div className="pontos-info">
          <div className="pontos-total">{formatarPontos(totalPontos)}</div>
          <div className="pontos-label">Pontos</div>
        </div>
      </div>

      <div className="pontos-details">
        <div className="pontos-section">
          <div className="pontos-section-header">
            <Star size={16} />
            <span>Hoje</span>
          </div>
          <div className="pontos-section-value">+{pontosHoje}</div>
        </div>
      </div>
    </div>
  )
}

export default PontosCounter
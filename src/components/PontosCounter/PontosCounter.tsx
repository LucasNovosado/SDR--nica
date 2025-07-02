import React, { useState } from 'react'
import { Trophy } from 'lucide-react'
import { usePointsStore } from '../../store/usePointsStore'
import './PontosCounter.css'

const PontosCounter: React.FC = () => {
  const { pontos, loading } = usePointsStore()
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
          <div className="pontos-total">{pontos}</div>
          <div className="pontos-label">Pontos</div>
        </div>
      </div>
    </div>
  )
}

export default PontosCounter

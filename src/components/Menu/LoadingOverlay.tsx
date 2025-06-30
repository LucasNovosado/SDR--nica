import React from 'react'
import './LoadingOverlay.css'

const LoadingOverlay: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-text">Carregando...</div>
    </div>
  )
}

export default LoadingOverlay 
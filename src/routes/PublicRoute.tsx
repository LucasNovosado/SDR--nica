import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon">⚡</span>
            <span className="text-gradient-blue">Única</span>
            <span className="text-gradient-yellow">PRO</span>
          </div>
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se já está logado, redireciona para o menu
  if (user) {
    return <Navigate to="/menu" replace />
  }

  // Se não está logado, renderiza o componente (login)
  return <>{children}</>
}

export default PublicRoute
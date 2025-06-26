import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
          <p className="loading-text">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se está logado, renderiza o componente
  return <>{children}</>
}

export default ProtectedRoute
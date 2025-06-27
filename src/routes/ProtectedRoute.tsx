import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Se ainda está carregando (não deveria chegar aqui com a nova estrutura)
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verificando permissões...</p>
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
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  // Se ainda está carregando (não deveria chegar aqui com a nova estrutura)
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verificando autenticação...</p>
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
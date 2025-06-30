import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../components/Auth/LoginPage'
import MenuPage from '../components/Menu/MenuPage'
import DiarioLojaPage from '../components/DiarioLoja/DiarioLojaPage'
import DiarioLojaDetalhePage from '../components/DiarioLoja/DiarioLojaDetalhe/DiarioLojaDetalhePage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import ConfiguracoesPage from '../components/ConfiguracoesPage/ConfiguracoesPage'

// Componente de Loading centralizado
const AppLoading = () => (
  <div className="loading-container">
    <div className="loading-content">
      <div className="loading-logo">
        <span className="logo-icon">⚡</span>
        <span className="text-gradient-blue">Única</span>
        <span className="text-gradient-yellow">PRO</span>
      </div>
      <div className="loading-spinner"></div>
      <p className="loading-text">Carregando aplicação...</p>
    </div>
  </div>
)

const AppRoutes = () => {
  const { user, loading } = useAuth()

  // Loading global da aplicação
  if (loading) {
    return <AppLoading />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MenuPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diario"
        element={
          <ProtectedRoute>
            <DiarioLojaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/diario/detalhe"
        element={
          <ProtectedRoute>
            <DiarioLojaDetalhePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <ConfiguracoesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? <Navigate to="/menu" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default AppRoutes
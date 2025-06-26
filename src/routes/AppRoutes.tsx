import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../components/Auth/LoginPage'
import MenuPage from '../components/Menu/MenuPage'
import DiarioLojaPage from '../components/DiarioLoja/DiarioLojaPage'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const AppRoutes = () => {
  const { user } = useAuth()

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
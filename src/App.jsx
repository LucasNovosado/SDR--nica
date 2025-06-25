import React from 'react'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/Auth/LoginPage'
import DashboardPage from './components/Dashboard/DashboardPage'
import './styles/global.css'
import './App.css'

const App = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon">⚡</span>
            <span className="text-gradient-blue">Game</span>
            <span className="text-gradient-yellow">Hub</span>
          </div>
          <div className="loading-spinner"></div>
          <p className="loading-text">Carregando sua experiência...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {user ? <DashboardPage /> : <LoginPage />}
    </div>
  )
}

export default App
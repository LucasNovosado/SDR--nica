import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'
import './App.css'

const App = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        {/* seu loading component */}
      </div>
    )
  }

  return (
    <div className="app">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  )
}

export default App
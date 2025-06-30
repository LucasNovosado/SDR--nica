import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'
import './App.css'
import { PointsProvider } from './store/usePointsStore'

const App = () => {
  return (
    <div className="app">
      <PointsProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PointsProvider>
    </div>
  )
}

export default App
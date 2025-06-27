import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'
import './App.css'

const App = () => {
  return (
    <div className="app">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  )
}

export default App
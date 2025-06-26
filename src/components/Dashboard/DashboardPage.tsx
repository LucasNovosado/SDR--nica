import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  Zap,
  Home,
  Target,
  BarChart3,
  User,
  LogOut,
  Gamepad2,
  TrendingUp,
  Plus,
  PieChart,
  Settings,
  CheckCircle,
  Trophy,
  Flame,
  Battery
} from 'lucide-react'
import './DashboardPage.css'

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const handleSignOut = async () => {
    await signOut()
  }

  const stats = [
    { icon: Target, label: 'Objetivos', value: '12', change: '+3', color: 'blue' },
    { icon: Battery, label: 'Energia', value: '87%', change: '+5%', color: 'yellow' },
    { icon: Trophy, label: 'Conquistas', value: '24', change: '+2', color: 'blue' },
    { icon: Flame, label: 'Sequência', value: '15 dias', change: '+1', color: 'yellow' }
  ]

  const activities = [
    { icon: CheckCircle, action: 'Objetivo concluído', item: 'Revisar projeto', time: 'há 2 horas', type: 'success' },
    { icon: Target, action: 'Novo objetivo criado', item: 'Estudar React', time: 'há 4 horas', type: 'info' },
    { icon: Trophy, action: 'Conquista desbloqueada', item: 'Primeira semana', time: 'há 1 dia', type: 'achievement' },
    { icon: Zap, action: 'Nível aumentado', item: 'Level 5 → Level 6', time: 'há 2 dias', type: 'level' }
  ]

  const quickActions = [
    { icon: Plus, label: 'Novo Objetivo', color: 'blue' },
    { icon: BarChart3, label: 'Ver Relatórios', color: 'yellow' },
    { icon: Gamepad2, label: 'Mini Games', color: 'blue' },
    { icon: Settings, label: 'Configurações', color: 'yellow' }
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="logo-mini">
            <span className="logo-icon">
              <Zap size={24} />
            </span>
            <span className="text-gradient-blue">Única</span>
            <span className="text-gradient-yellow">SDR</span>
          </div>
        </div>
        
        <div className="header-center">
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Home size={18} />
              Visão Geral
            </button>
            <button 
              className={`nav-tab ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              <Target size={18} />
              Objetivos
            </button>
            <button 
              className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <BarChart3 size={18} />
              Estatísticas
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <span className="user-name">Olá, Jogador!</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleSignOut}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      <main className="dashboard-main">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                Bem-vindo de volta! <Gamepad2 size={32} className="inline-icon" />
              </h1>
              <p className="welcome-subtitle">
                Continue sua jornada épica e alcance novos níveis!
              </p>
            </div>

            <div className="stats-grid">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <div key={index} className={`stat-card ${stat.color}`}>
                    <div className="stat-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                      <div className="stat-change">{stat.change}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="content-grid">
              <div className="activities-section">
                <h2 className="section-title">
                  <TrendingUp size={24} className="section-icon" />
                  Atividades Recentes
                </h2>
                <div className="activities-list">
                  {activities.map((activity, index) => {
                    const IconComponent = activity.icon
                    return (
                      <div key={index} className={`activity-item ${activity.type}`}>
                        <div className="activity-icon">
                          <IconComponent size={20} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-action">{activity.action}</div>
                          <div className="activity-item-name">{activity.item}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="quick-actions-section">
                <h2 className="section-title">
                  <Zap size={24} className="section-icon" />
                  Ações Rápidas
                </h2>
                <div className="quick-actions-grid">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon
                    return (
                      <button key={index} className={`quick-action ${action.color}`}>
                        <div className="action-icon">
                          <IconComponent size={24} />
                        </div>
                        <div className="action-label">{action.label}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="progress-section">
                  <h3 className="progress-title">
                    <Target size={20} className="inline-icon" />
                    Progresso Diário
                  </h3>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '67%'}}></div>
                  </div>
                  <div className="progress-text">67% concluído</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-content">
            <div className="section-header">
              <h1>
                <Target size={32} className="inline-icon" />
                Seus Objetivos
              </h1>
              <button className="add-goal-button">
                <Plus size={18} />
                Novo Objetivo
              </button>
            </div>
            <div className="goals-placeholder">
              <div className="placeholder-icon">
                <Target size={64} />
              </div>
              <h3>Em construção...</h3>
              <p>A seção de objetivos estará disponível em breve!</p>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-content">
            <div className="section-header">
              <h1>
                <PieChart size={32} className="inline-icon" />
                Suas Estatísticas
              </h1>
            </div>
            <div className="stats-placeholder">
              <div className="placeholder-icon">
                <PieChart size={64} />
              </div>
              <h3>Em construção...</h3>
              <p>As estatísticas detalhadas estarão disponíveis em breve!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
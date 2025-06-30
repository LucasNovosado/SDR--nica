import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Zap,
  User,
  LogOut,
  Package,
  Users,
  Settings,
  Book
} from 'lucide-react'
import LoadingOverlay from './LoadingOverlay'
import './MenuPage.css'

const MenuPage: React.FC = () => {
  const { user, userWithLevel, isManager, isDirector, signOut } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleNavigateDiario = () => {
    setIsLoading(true)
    setTimeout(() => {
      navigate('/diario')
      setIsLoading(false)
    }, 2000)
  }

  const menuItems = [
    {
      id: 'diario',
      title: 'Diário da Loja',
      description: 'Controle diário da loja',
      icon: Book,
      color: 'blue',
      onClick: handleNavigateDiario,
      // Todos os usuários podem ver este módulo
      visible: true
    },
    {
      id: 'module2', 
      title: 'Módulo 2',
      description: 'Segundo módulo do sistema',
      icon: Users,
      color: 'yellow',
      onClick: () => {
        console.log('Módulo 2 clicado')
        // navigate('/modulo2')
      },
      // Todos os usuários podem ver este módulo
      visible: true
    },
    {
      id: 'module3',
      title: 'Configurações', 
      description: 'Configurações do sistema',
      icon: Settings,
      color: 'blue',
      onClick: () => {
        console.log('Configurações clicado')
        // Exemplo: ir para o dashboard existente
        navigate('/dashboard')
      },
      // Apenas gerentes e diretores podem ver este módulo
      visible: isManager || isDirector
    }
  ].filter(item => item.visible) // Filtra apenas os itens visíveis

  return (
    <div className="menu-container">
      {isLoading && <LoadingOverlay />}
      <div className="menu-background">
        <div className="floating-elements">
          <div className="floating-element blue"></div>
          <div className="floating-element yellow"></div>
          <div className="floating-element blue small"></div>
          <div className="floating-element yellow small"></div>
        </div>
      </div>

      <div className="menu-header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <Zap size={32} />
            </div>
            <h1 className="logo-text">
              <span className="text-gradient-blue">Única</span>
              <span className="text-gradient-yellow">PRO</span>
            </h1>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            {userWithLevel && (
              <div className="user-details">
                <span className="user-name">{userWithLevel.nome || userWithLevel.email}</span>
                <span className="user-level">
                  {userWithLevel.nivel === 'diretor' && '👑 Diretor'}
                  {userWithLevel.nivel === 'gerente' && '⭐ Gerente'}
                  {userWithLevel.nivel === 'vendedor' && '💼 Vendedor'}
                  {userWithLevel.nivel === 'entregador' && '🚚 Entregador'}
                </span>
              </div>
            )}
          </div>
          <button className="logout-button" onClick={handleSignOut} disabled={isLoading}>
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-grid">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                className={`menu-item ${item.color}`}
                onClick={item.onClick}
                disabled={isLoading}
              >
                <div className="menu-item-icon">
                  <IconComponent size={48} />
                </div>
                <div className="menu-item-content">
                  <h3 className="menu-item-title">{item.title}</h3>
                  <p className="menu-item-description">{item.description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MenuPage
import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ConfiguracoesPage.css'

const ConfiguracoesPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="configuracoes-container">
      <h2 className="configuracoes-titulo">Configurações</h2>
      {/* Card ou botão para acessar a página de criação de usuário */}
      <div className="configuracoes-menu">
        <button className="btn-menu" onClick={() => navigate('/configuracoes/criar-usuario')}>
          Criar Usuário
        </button>
      </div>
    </div>
  )
}

export default ConfiguracoesPage

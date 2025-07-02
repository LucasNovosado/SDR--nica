import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ConfiguracoesPage.css'

const ConfiguracoesPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="configuracoes-container">
      <h2 className="configuracoes-titulo">Configurações</h2>
      {/* Menu de opções de configuração */}
      <div className="configuracoes-menu">
        <button className="btn-menu" onClick={() => navigate('/configuracoes/gerenciar-usuarios')}>
          Gerenciar Usuários
        </button>
        {/* Botão para adicionar loja */}
        <button className="btn-menu" onClick={() => navigate('/configuracoes/adicionar-loja')}>
          Adicionar Loja
        </button>
      </div>
    </div>
  )
}

export default ConfiguracoesPage
 
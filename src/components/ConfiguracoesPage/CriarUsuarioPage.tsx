import React, { useState, useEffect } from 'react'
import './CriarUsuarioPage.css'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../../services/authService'
import { createUserRule, associarGerenteLojas } from '../../services/userRulesService'
import { supabase } from '../../services/supabase'

const cargos = [
  { label: 'Diretor', value: 'diretor' },
  { label: 'Gerente', value: 'gerente' },
  { label: 'Vendedor', value: 'vendedor' },
  { label: 'Entregador', value: 'entregador' }
]

interface Loja {
  id: string
  nome: string
}

const CriarUsuarioPage: React.FC = () => {
  // Controle de etapas
  const [step, setStep] = useState(1)
  // Etapa 1
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  // Etapa 2
  const [cargo, setCargo] = useState('vendedor')
  const [lojaId, setLojaId] = useState('')
  const [lojas, setLojas] = useState<Loja[]>([])
  const [lojasSelecionadas, setLojasSelecionadas] = useState<string[]>([])
  const [regraError, setRegraError] = useState<string | null>(null)
  const [regraLoading, setRegraLoading] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const navigate = useNavigate()

  // Busca lojas para etapa 2
  useEffect(() => {
    if (step === 2) {
      const fetchLojas = async () => {
        const { data, error } = await supabase.from('lojas').select('id, nome')
        if (!error && data) setLojas(data)
      }
      fetchLojas()
    }
  }, [step])

  // Limpa seleção de lojas se não for gerente
  useEffect(() => {
    if (cargo !== 'gerente') setLojasSelecionadas([])
  }, [cargo])

  // Handler da etapa 1: cadastro no Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    setMensagem(null)
    try {
      const { user, error } = await signUp(email, senha)
      if (error) throw new Error(error.message)
      if (!user?.id) throw new Error('ID do usuário não retornado.')
      setUserId(user.id)
      setStep(2)
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao criar usuário no Auth.')
    } finally {
      setAuthLoading(false)
    }
  }

  // Handler da etapa 2: cadastro em users_regras
  const handleRegraSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegraLoading(true)
    setRegraError(null)
    setMensagem(null)
    try {
      if (!userId) throw new Error('ID do usuário não encontrado.')
      // Cria registro em users_regras
      const { error } = await createUserRule({
        nome,
        email,
        nivel: cargo,
        loja_id: cargo === 'gerente' ? null : (lojaId !== '' ? lojaId : null),
        user_ref: userId
      })
      if (error) throw new Error(error.message)
      // Se gerente, associa lojas
      if (cargo === 'gerente' && lojasSelecionadas.length > 0) {
        const { error: relError } = await associarGerenteLojas(userId, lojasSelecionadas)
        if (relError) throw new Error(relError.message)
      }
      setMensagem('Usuário criado com sucesso!')
      setTimeout(() => navigate('/configuracoes'), 1800)
    } catch (err: any) {
      setRegraError(err.message || 'Erro ao salvar configurações.')
    } finally {
      setRegraLoading(false)
    }
  }

  return (
    <div className="criar-usuario-container">
      <h2 className="criar-usuario-titulo">Criar Usuário</h2>
      {/* Steps visuais */}
      <div className="steps-bar">
        <div className={`step ${step === 1 ? 'active' : ''}`}>1</div>
        <div className={`step-line ${step === 2 ? 'active' : ''}`}></div>
        <div className={`step ${step === 2 ? 'active' : ''}`}>2</div>
      </div>
      {/* Etapa 1: Cadastro no Auth */}
      {step === 1 && (
        <form className="criar-usuario-form" onSubmit={handleAuthSubmit}>
          <label>
            Nome do usuário
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required disabled={!!userId} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={!!userId} />
          </label>
          <label>
            Senha
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required disabled={!!userId} />
          </label>
          <button type="submit" className="btn-criar" disabled={authLoading || !!userId}>
            {authLoading ? 'Criando...' : 'Criar Usuário'}
          </button>
          {authError && <div className="mensagem-erro">{authError}</div>}
        </form>
      )}
      {/* Etapa 2: Configuração em users_regras */}
      {step === 2 && (
        <form className="criar-usuario-form" onSubmit={handleRegraSubmit}>
          <label>
            Cargo
            <select value={cargo} onChange={e => setCargo(e.target.value)} required>
              {cargos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          {/* Campo de loja (apenas se não for gerente) */}
          {cargo !== 'gerente' && (
            <label>
              Loja (opcional)
              <input type="text" value={lojaId} onChange={e => setLojaId(e.target.value)} placeholder="ID da loja" />
            </label>
          )}
          {/* Campo multi-select de lojas para gerente */}
          {cargo === 'gerente' && (
            <label>
              Lojas associadas
              <select
                multiple
                value={lojasSelecionadas}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions, option => option.value)
                  setLojasSelecionadas(options)
                }}
                className="multi-select-lojas"
                required
              >
                {lojas.map(loja => (
                  <option key={loja.id} value={loja.id}>{loja.nome}</option>
                ))}
              </select>
              <span className="multi-select-hint">Segure Ctrl (Windows) ou Command (Mac) para selecionar múltiplas lojas</span>
            </label>
          )}
          <button type="submit" className="btn-criar" disabled={regraLoading}>
            {regraLoading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          {regraError && <div className="mensagem-erro">{regraError}</div>}
          {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        </form>
      )}
      <button className="btn-voltar" onClick={() => navigate('/configuracoes')}>Voltar</button>
    </div>
  )
}

export default CriarUsuarioPage 
import React, { useState, useEffect } from 'react'
import './CriarUsuarioPage.css'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../../services/authService'
import { createUserRule, addLojasToUserRegra } from '../../services/userRulesService'
import { getLojas } from '../../services/lojasService'
import Select from 'react-select'
import { supabase } from '../../services/supabase'

const cargos = [
  { label: 'Diretor', value: 'diretor' },
  { label: 'Gerente', value: 'gerente' },
  { label: 'Supervisor', value: 'supervisor' },
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
  const [lojasSelecionadas, setLojasSelecionadas] = useState<{ value: string, label: string }[]>([])
  const [regraError, setRegraError] = useState<string | null>(null)
  const [regraLoading, setRegraLoading] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const navigate = useNavigate()

  // Buscar lojas do banco ao entrar na etapa 2
  useEffect(() => {
    if (step === 2) {
      getLojas().then(({ data }) => {
        if (data) setLojas(data)
      })
    }
  }, [step])

  // Limpa seleção de lojas se não for gerente/supervisor
  useEffect(() => {
    if (cargo === 'vendedor') setLojasSelecionadas([])
    if (cargo === 'diretor') {
      setLojasSelecionadas([])
      setLojaId('')
    }
  }, [cargo])

  // Handler da etapa 1: cadastro no Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    setMensagem(null)
    try {
      // Cria o usuário no Auth, mas NÃO faz login automático (admin permanece logado)
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

  // Handler da etapa 2: cadastro em users_regras e users_regras_lojas
  const handleRegraSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegraLoading(true)
    setRegraError(null)
    setMensagem(null)
    try {
      if (!userId) throw new Error('ID do usuário não encontrado.')
      // Validação de loja obrigatória
      if (cargo === 'vendedor' && !lojaId) throw new Error('Selecione uma loja.')
      if ((cargo === 'gerente' || cargo === 'supervisor') && lojasSelecionadas.length === 0) throw new Error('Selecione pelo menos uma loja.')
      // Cria registro em users_regras
      const { error } = await createUserRule({
        nome,
        email,
        nivel: cargo,
        loja_id: cargo === 'vendedor' ? lojaId : null,
        user_ref: userId
      })
      if (error) throw new Error(error.message)
      // Buscar o id do registro criado em users_regras
      const { data: regras, error: regraIdError } = await getLojasIdUserRegra(userId)
      if (regraIdError || !regras?.id) throw new Error('Não foi possível obter o ID do registro em users_regras.')
      const userRegraId = regras.id
      // Se gerente/supervisor, associa lojas na tabela intermediária
      if ((cargo === 'gerente' || cargo === 'supervisor') && lojasSelecionadas.length > 0) {
        const lojasIds = lojasSelecionadas.map(l => l.value)
        const { error: lojasError } = await addLojasToUserRegra(userRegraId, lojasIds)
        if (lojasError) throw new Error(lojasError.message)
      }
      setMensagem('Usuário criado com sucesso!')
      setTimeout(() => navigate('/configuracoes'), 1800)
    } catch (err: any) {
      setRegraError(err.message || 'Erro ao salvar configurações.')
    } finally {
      setRegraLoading(false)
    }
  }

  // Função auxiliar para buscar o id do registro criado em users_regras
  async function getLojasIdUserRegra(userId: string) {
    return await supabase
      .from('users_regras')
      .select('id')
      .eq('user_ref', userId)
      .order('id', { ascending: false })
      .limit(1)
      .single()
  }

  // Opções para react-select
  const lojaOptions = lojas.map(loja => ({ value: loja.id, label: loja.nome }))

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
      {/* Etapa 2: Configuração em users_regras e users_regras_lojas */}
      {step === 2 && (
        <form className="criar-usuario-form" onSubmit={handleRegraSubmit}>
          <label>
            Cargo
            <select value={cargo} onChange={e => setCargo(e.target.value)} required>
              {cargos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          {/* Seção de lojas, comportamento por cargo */}
          <div className="lojas-section">
            {cargo === 'diretor' ? (
              <div className="diretor-acesso-todas">Acesso a todas as lojas</div>
            ) : cargo === 'vendedor' ? (
              <label>
                Loja
                <select
                  className="loja-select"
                  value={lojaId}
                  onChange={e => setLojaId(e.target.value)}
                  required
                >
                  <option value="">Selecione a loja</option>
                  {lojas.map(loja => (
                    <option key={loja.id} value={loja.id}>{loja.nome}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label>
                Lojas
                <Select
                  isMulti
                  options={lojaOptions}
                  value={lojasSelecionadas}
                  onChange={opts => setLojasSelecionadas(opts as { value: string, label: string }[])}
                  placeholder="Selecione as lojas"
                  classNamePrefix="react-select"
                  className="react-select-container"
                  styles={{
                    control: (base) => ({
                      ...base,
                      background: 'rgba(26,26,46,0.85)',
                      borderRadius: 10,
                      borderColor: '#22d3ee',
                      color: '#fff',
                      minHeight: 48,
                    }),
                    menu: (base) => ({
                      ...base,
                      background: 'rgba(26,26,46,0.98)',
                      color: '#fff',
                      borderRadius: 10,
                    }),
                    multiValue: (base) => ({
                      ...base,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #00d4ff 100%)',
                      color: '#fff',
                      borderRadius: 8,
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#fff',
                      fontWeight: 600,
                    }),
                    option: (base, state) => ({
                      ...base,
                      background: state.isSelected ? 'rgba(139,92,246,0.25)' : 'transparent',
                      color: '#fff',
                      borderRadius: 8,
                      ':active': { background: 'rgba(0,212,255,0.15)' },
                    }),
                  }}
                />
              </label>
            )}
          </div>
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
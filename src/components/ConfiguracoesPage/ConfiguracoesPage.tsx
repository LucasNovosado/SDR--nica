import React, { useState } from 'react'
import { supabase } from '../../services/supabase' // ajuste o path conforme seu projeto
import './ConfiguracoesPage.css'

const cargos = [
  { label: 'Diretor', value: 'diretor' },
  { label: 'Gerente', value: 'gerente' },
  { label: 'Vendedor', value: 'vendedor' },
  { label: 'Entregador', value: 'entregador' }
]

const ConfiguracoesPage: React.FC = () => {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [cargo, setCargo] = useState('vendedor')
  const [lojaId, setLojaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensagem(null)
    setErro(null)

    try {
      // Cria o usuário no Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha
      })

      if (error) {
        throw new Error(error.message)
      }

      const userId = data.user?.id
      if (!userId) {
        throw new Error('ID do usuário não retornado.')
      }

      // Insere na tabela users_regras
      const { error: insertError } = await supabase
        .from('users_regras')
        .insert([
          {
            nome,
            email,
            nivel: cargo,
            loja_id: lojaId !== '' ? lojaId : null,
            user_ref: userId
          }
        ])

      if (insertError) {
        throw new Error(insertError.message)
      }

      setMensagem('Usuário criado com sucesso!')
      setNome('')
      setEmail('')
      setSenha('')
      setCargo('vendedor')
      setLojaId('')
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar usuário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="configuracoes-container">
      <h2 className="configuracoes-titulo">Configurações</h2>
      <form className="configuracoes-form" onSubmit={handleSubmit}>
        <label>
          Nome do usuário
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
        </label>
        <label>
          Cargo
          <select value={cargo} onChange={e => setCargo(e.target.value)} required>
            {cargos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label>
          Loja (opcional)
          <input type="text" value={lojaId} onChange={e => setLojaId(e.target.value)} placeholder="ID da loja" />
        </label>
        <button type="submit" className="btn-criar" disabled={loading}>{loading ? 'Criando...' : 'Criar Usuário'}</button>
        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}
      </form>
    </div>
  )
}

export default ConfiguracoesPage

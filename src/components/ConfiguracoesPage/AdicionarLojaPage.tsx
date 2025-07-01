import React, { useState } from 'react'
import './AdicionarLojaPage.css'
import { useNavigate } from 'react-router-dom'
import { createLoja } from '../../services/lojasService'

const AdicionarLojaPage: React.FC = () => {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [populacao, setPopulacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const navigate = useNavigate()

  // Validação dos campos
  const validar = () => {
    if (!nome.trim() || !cidade.trim() || !estado.trim() || !populacao.trim()) {
      setErro('Preencha todos os campos.')
      return false
    }
    if (isNaN(Number(populacao)) || Number(populacao) <= 0) {
      setErro('População deve ser um número positivo.')
      return false
    }
    return true
  }

  // Handler de envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setMensagem(null)
    if (!validar()) return
    setLoading(true)
    try {
      const { error } = await createLoja({ nome, cidade, estado, populacao: Number(populacao) })
      if (error) throw new Error(error.message)
      setMensagem('Loja criada com sucesso!')
      setTimeout(() => navigate('/configuracoes'), 1500)
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar loja.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adicionar-loja-container">
      <h2 className="adicionar-loja-titulo">Adicionar Loja</h2>
      <form className="adicionar-loja-form" onSubmit={handleSubmit}>
        <label>
          Nome
          <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
        </label>
        <label>
          Cidade
          <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} required />
        </label>
        <label>
          Estado
          <input type="text" value={estado} onChange={e => setEstado(e.target.value)} required />
        </label>
        <label>
          População
          <input type="number" value={populacao} onChange={e => setPopulacao(e.target.value)} required min={1} />
        </label>
        <button type="submit" className="btn-criar" disabled={loading}>{loading ? 'Salvando...' : 'Adicionar Loja'}</button>
        {mensagem && <div className="mensagem-sucesso">{mensagem}</div>}
        {erro && <div className="mensagem-erro">{erro}</div>}
      </form>
      <button className="btn-voltar" onClick={() => navigate('/configuracoes')}>Voltar</button>
    </div>
  )
}

export default AdicionarLojaPage 
import React, { useEffect, useState } from 'react'
import './GerenciarUsersPage.css'
import { getAllUsers, updateUser, deleteUser, getAllLojas, getLojasByUserRegraId, updateUserLojas } from '../../services/usersService'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, X } from 'lucide-react'

interface User {
  id: string
  nome: string
  email: string
  nivel: string
  loja_id?: string | null
  lojas_ids?: string[] // Para múltiplas lojas, se aplicável
}

const cargos = [
  { label: 'Todos', value: '' },
  { label: 'Diretor', value: 'diretor' },
  { label: 'Gerente', value: 'gerente' },
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Vendedor', value: 'vendedor' },
  { label: 'Entregador', value: 'entregador' }
]

const GerenciarUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [lojasMap, setLojasMap] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cargo, setCargo] = useState('')
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [allLojas, setAllLojas] = useState<{ id: string, nome: string }[]>([])
  const [editLojas, setEditLojas] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsersAndLojas()
  }, [])

  // Busca usuários, lojas e monta o mapa de lojas
  async function fetchUsersAndLojas() {
    setLoading(true)
    // Busca todos os usuários e todas as lojas
    const [{ data: usersData }, { data: lojasData }] = await Promise.all([
      getAllUsers(),
      getAllLojas()
    ])
    setAllLojas(lojasData || [])
    // Cria um Map<id, nome> para lookup rápido
    const map = new Map<string, string>()
    lojasData?.forEach(loja => map.set(loja.id, loja.nome))
    setLojasMap(map)
    // Para cada usuário gerente/supervisor, buscar lojas vinculadas na tabela intermediária
    if (usersData) {
      const promises = usersData.map(async (user) => {
        if (user.nivel === 'gerente' || user.nivel === 'supervisor') {
          // Busca lojas vinculadas na tabela intermediária
          const { data: lojasVinc } = await getLojasByUserRegraId(user.id)
          // Salva os IDs das lojas vinculadas
          return { ...user, lojas_ids: lojasVinc ? lojasVinc.map((l: any) => l.loja_id) : [] }
        } else {
          // Para vendedor/diretor, usa loja_id direto
          return { ...user, lojas_ids: user.loja_id ? [user.loja_id] : [] }
        }
      })
      const usersComLojas = await Promise.all(promises)
      setUsers(usersComLojas)
    } else {
      setUsers([])
    }
    setLoading(false)
  }

  function filteredUsers() {
    return users.filter(u =>
      ((u.nome || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase())) &&
      (cargo ? u.nivel === cargo : true)
    )
  }

  function handleEdit(user: User) {
    setEditUser(user)
    setShowModal(true)
    if (user.nivel === 'gerente' || user.nivel === 'supervisor') {
      getLojasByUserRegraId(user.id).then(({ data }) => {
        setEditLojas(data ? data.map((l: any) => l.loja_id) : [])
      })
    } else if (user.nivel === 'vendedor') {
      setEditLojas(user.loja_id ? [user.loja_id] : [])
    } else {
      setEditLojas([])
    }
  }

  function handleCargoChange(novoCargo: string) {
    if (!editUser) return
    setEditUser({ ...editUser, nivel: novoCargo })
    if (novoCargo === 'gerente' || novoCargo === 'supervisor') {
      setEditLojas([])
    } else if (novoCargo === 'vendedor') {
      setEditLojas(editUser.loja_id ? [editUser.loja_id] : [])
    } else {
      setEditLojas([])
    }
  }

  async function handleSaveEdit() {
    if (!editUser) return
    setModalLoading(true)
    if (!editUser.nome || !editUser.email || !editUser.nivel) {
      setModalLoading(false)
      return
    }
    if (editUser.nivel === 'vendedor' && editLojas.length === 0) {
      setModalLoading(false)
      return
    }
    if ((editUser.nivel === 'gerente' || editUser.nivel === 'supervisor') && editLojas.length === 0) {
      setModalLoading(false)
      return
    }
    await updateUser(editUser.id, {
      nome: editUser.nome,
      email: editUser.email,
      nivel: editUser.nivel,
      loja_id: editUser.nivel === 'vendedor' ? editLojas[0] : null
    })
    if (editUser.nivel === 'gerente' || editUser.nivel === 'supervisor') {
      await updateUserLojas(editUser.id, editLojas)
    }
    setShowModal(false)
    setModalLoading(false)
    fetchUsersAndLojas()
  }

  async function handleDelete() {
    if (!deleteId) return
    await deleteUser(deleteId)
    setDeleteId(null)
    setDeleteConfirm(false)
    fetchUsersAndLojas()
  }

  // Exibe badges com nomes das lojas corretas para cada usuário
  function renderLojas(user: User) {
    const ids = user.lojas_ids && user.lojas_ids.length > 0 ? user.lojas_ids : []
    if (ids.length === 0) return <span className="badge">Nenhuma</span>
    return ids.map((id, i) => (
      <span className="badge" key={id}>{lojasMap.get(id) || 'Desconhecida'}</span>
    ))
  }

  return (
    <div className="gerenciar-users-container">
      <h2 className="gerenciar-users-titulo">Gerenciar Usuários</h2>
      <div className="users-filtros">
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={cargo} onChange={e => setCargo(e.target.value)}>
          {cargos.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="users-table-wrapper">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Lojas</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Carregando...</td></tr>
            ) : filteredUsers().length === 0 ? (
              <tr><td colSpan={5}>Nenhum usuário encontrado.</td></tr>
            ) : filteredUsers().map(user => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{renderLojas(user)}</td>
                <td>{user.email}</td>
                <td><span className="badge">{user.nivel}</span></td>
                <td>
                  <button className="btn-acao" title="Editar" onClick={() => handleEdit(user)}><Pencil size={18} /></button>
                  <button className="btn-acao" title="Excluir" onClick={() => { setDeleteId(user.id); setDeleteConfirm(true) }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Botão flutuante adicionar usuário */}
      <button className="btn-add-user" title="Adicionar Usuário" onClick={() => navigate('/configuracoes/criar-usuario')}>
        <Plus size={32} />
      </button>
      {/* Modal de edição */}
      {showModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderRadius: 18, padding: '2.5rem 2rem 2rem 2rem', minWidth: 320, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <button className="modal-close" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#a1a1aa', fontSize: 22, cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#00d4ff')} onMouseOut={e => (e.currentTarget.style.color = '#a1a1aa')}><X size={22} /></button>
            <h3 style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, marginBottom: 18 }}>Editar Usuário</h3>
            <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 12 }}>
              <label>Nome
                <input type="text" value={editUser.nome} onChange={e => setEditUser({ ...editUser, nome: e.target.value })} required style={{ padding: '0.7rem 1.1rem', borderRadius: 10, border: '1.5px solid #8b5cf6', background: 'rgba(26,26,46,0.85)', color: '#fff', fontSize: '1rem', outline: 'none', marginTop: 4, marginBottom: 2 }} placeholder="Nome do usuário" />
              </label>
              <label>Email
                <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required style={{ padding: '0.7rem 1.1rem', borderRadius: 10, border: '1.5px solid #8b5cf6', background: 'rgba(26,26,46,0.85)', color: '#fff', fontSize: '1rem', outline: 'none', marginTop: 4, marginBottom: 2 }} placeholder="Email do usuário" />
              </label>
              <label>Cargo
                <select value={editUser.nivel} onChange={e => handleCargoChange(e.target.value)} required style={{ padding: '0.7rem 1.1rem', borderRadius: 10, border: '1.5px solid #8b5cf6', background: 'rgba(26,26,46,0.85)', color: '#fff', fontSize: '1rem', outline: 'none', marginTop: 4, marginBottom: 2 }}>
                  {cargos.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
              {/* Seção de seleção de loja(s) conforme cargo */}
              {editUser.nivel === 'diretor' && (
                <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: 8 }}>Acesso a todas as lojas</div>
              )}
              {editUser.nivel === 'vendedor' && (
                <label>Loja
                  <select value={editLojas[0] || ''} onChange={e => setEditLojas([e.target.value])} required style={{ padding: '0.7rem 1.1rem', borderRadius: 10, border: '1.5px solid #22d3ee', background: 'rgba(0,212,255,0.08)', color: '#fff', fontSize: '1rem', outline: 'none', marginTop: 4, marginBottom: 2 }}>
                    <option value="">Selecione a loja</option>
                    {allLojas.map(loja => (
                      <option key={loja.id} value={loja.id}>{loja.nome}</option>
                    ))}
                  </select>
                </label>
              )}
              {(editUser.nivel === 'gerente' || editUser.nivel === 'supervisor') && (
                <label>Lojas
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {allLojas.map(loja => (
                      <label key={loja.id} style={{ display: 'flex', alignItems: 'center', background: editLojas.includes(loja.id) ? 'linear-gradient(135deg, #8b5cf6 0%, #00d4ff 100%)' : 'rgba(26,26,46,0.85)', color: '#fff', borderRadius: 8, padding: '0.3rem 0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', border: editLojas.includes(loja.id) ? '2px solid #00d4ff' : '1.5px solid #22d3ee', marginBottom: 4 }}>
                      <input type="checkbox" checked={editLojas.includes(loja.id)} onChange={e => {
                        if (e.target.checked) setEditLojas([...editLojas, loja.id])
                        else setEditLojas(editLojas.filter(id => id !== loja.id))
                      }} style={{ marginRight: 6 }} />
                      {loja.nome}
                    </label>
                  ))}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: 2 }}>Selecione uma ou mais lojas</div>
                </label>
              )}
              <button className="btn-criar" onClick={handleSaveEdit} disabled={modalLoading} style={{ alignSelf: 'center', marginTop: 18, padding: '0.9rem 1.5rem', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6 0%, #00d4ff 100%)', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)' }}>
                {modalLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmação de exclusão */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este usuário?</p>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <button className="btn-criar" style={{ background: '#ef4444' }} onClick={handleDelete}>Excluir</button>
              <button className="btn-voltar" onClick={() => setDeleteConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GerenciarUsersPage 
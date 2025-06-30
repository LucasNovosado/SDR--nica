import React from 'react'
import styles from './DiarioLojaDetalhe.module.css'
import { FiltrosDetalhe } from '../../../hooks/useDiarioDetalhe'
import { Loja } from '../../../services/diarioService'
import { UserRegra } from '../../../services/userLevelsService'

type Props = {
  filtros: FiltrosDetalhe
  setLojaId: (id: string) => void
  setUsuarioId: (id: string) => void
  setDataInicio: (d: string) => void
  setDataFim: (d: string) => void
  setStatus: (s: FiltrosDetalhe['status']) => void
  setTipo: (t: FiltrosDetalhe['tipo']) => void
  lojas: Loja[]
  usuarios: UserRegra[]
  loading: boolean
}

const LeadsFilters: React.FC<Props> = ({ filtros, setLojaId, setUsuarioId, setDataInicio, setDataFim, setStatus, setTipo, lojas, usuarios, loading }) => {
  return (
    <div className={styles.filtrosContainer}>
      <div className={styles.filtrosGrid}>
        <div className={styles.filtroItem}>
          <label>Data início</label>
          <input type="date" className={styles.inputFiltro} value={filtros.dataInicio} onChange={e => setDataInicio(e.target.value)} />
        </div>
        <div className={styles.filtroItem}>
          <label>Data fim</label>
          <input type="date" className={styles.inputFiltro} value={filtros.dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
        <div className={styles.filtroItem}>
          <label>Loja</label>
          <select className={styles.inputFiltro} value={filtros.lojaId} onChange={e => setLojaId(e.target.value)}>
            <option value="">Selecione</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
        </div>
        <div className={styles.filtroItem}>
          <label>Usuário</label>
          <select className={styles.inputFiltro} value={filtros.usuarioId} onChange={e => setUsuarioId(e.target.value)}>
            <option value="">Selecione</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>
        <div className={styles.filtroItem}>
          <label>Status</label>
          <select className={styles.inputFiltro} value={filtros.status} onChange={e => setStatus(e.target.value as FiltrosDetalhe['status'])}>
            <option value="Todos">Todos</option>
            <option value="Convertido">Convertido</option>
            <option value="Perdido">Perdido</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>
        <div className={styles.filtroItem}>
          <label>Tipo</label>
          <select className={styles.inputFiltro} value={filtros.tipo} onChange={e => setTipo(e.target.value as FiltrosDetalhe['tipo'])}>
            <option value="Todos">Todos</option>
            <option value="whatsapp/telefone">WhatsApp/Telefone</option>
            <option value="cliente físico">Físico</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default LeadsFilters 
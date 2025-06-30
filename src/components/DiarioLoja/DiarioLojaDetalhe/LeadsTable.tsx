import React from 'react'
import styles from './DiarioLojaDetalhe.module.css'
import { Lead, Loja } from '../../../services/diarioService'
import { UserRegra } from '../../../services/userLevelsService'

type Props = {
  leads: Lead[]
  lojas: Loja[]
  usuarios: UserRegra[]
  loading: boolean
}

const LeadsTable: React.FC<Props> = ({ leads, lojas, usuarios, loading }) => {
  const getLojaNome = (id: string) => lojas.find(l => l.id === id)?.nome || '-'
  // Não há usuário no lead, então não mostra
  if (loading) return <div className={styles.tabelaContainer}>Carregando...</div>
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabelaLeads}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Motivo de perda</th>
            <th>Loja</th>
            {/* <th>Usuário</th> */}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr key={idx}>
              <td>{lead.data}</td>
              <td>{lead.hora}</td>
              <td>{lead.tipo === 'whatsapp/telefone' ? 'WhatsApp/Telefone' : 'Físico'}</td>
              <td>{lead.convertido === true ? 'Convertido' : lead.convertido === false ? 'Perdido' : 'Pendente'}</td>
              <td>{lead.motivo_perda || '-'}</td>
              <td>{getLojaNome(lead.loja_id)}</td>
              {/* <td>-</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LeadsTable 
import React, { useState } from 'react'
import './DiarioLojaDetalhe.css'
import { Lead, Loja } from '../../../services/diarioService'
import { UserRegra } from '../../../services/userLevelsService'

type Props = {
  leads: Lead[]
  lojas: Loja[]
  usuarios: UserRegra[]
  loading: boolean
}

const LeadsTable: React.FC<Props> = ({ leads, lojas, usuarios, loading }) => {
  const [paginaAtual, setPaginaAtual] = useState(1)
  const leadsPorPagina = 10
  const totalPaginas = Math.ceil(leads.length / leadsPorPagina)
  const getLojaNome = (id: string) => lojas.find(l => l.id === id)?.nome || '-'
  
  if (loading) return <div className="tabelaContainer">Carregando...</div>

  // Paginação
  const indiceInicial = (paginaAtual - 1) * leadsPorPagina
  const indiceFinal = indiceInicial + leadsPorPagina
  const leadsPaginados = leads.slice(indiceInicial, indiceFinal)

  return (
    <div className="tabelaContainer">
      <table className="tabelaLeads">
        <thead>
          <tr>
            <th>Data</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Motivo de perda</th>
            <th>Loja</th>
          </tr>
        </thead>
        <tbody>
          {leadsPaginados.map((lead, idx) => (
            <tr key={indiceInicial + idx}>
              <td>{lead.data}</td>
              <td>{lead.hora}</td>
              <td>{lead.tipo === 'whatsapp/telefone' ? 'WhatsApp/Telefone' : 'Físico'}</td>
              <td>{lead.convertido === true ? 'Convertido' : lead.convertido === false ? 'Perdido' : 'Pendente'}</td>
              <td>{lead.motivo_perda || '-'}</td>
              <td>{getLojaNome(lead.loja_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Controles de paginação */}
      {totalPaginas > 1 && (
        <div className="paginacaoLeads">
          <button onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} disabled={paginaAtual === 1}>
            Anterior
          </button>
          <span style={{ margin: '0 8px' }}>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))} disabled={paginaAtual === totalPaginas}>
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default LeadsTable
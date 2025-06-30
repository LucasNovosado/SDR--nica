import React from 'react'
import './DiarioLojaDetalhe.css'

type Props = {
  estatisticas: any
  motivoMaisFrequente: string
  loading: boolean
}

const LeadsSummaryCards: React.FC<Props> = ({ estatisticas, motivoMaisFrequente, loading }) => {
  if (loading || !estatisticas) {
    return <div className="cardsGrid">Carregando...</div>
  }
  return (
    <div className="cardsGrid">
      <div className="cardResumo">
        <div className="cardTitulo">Leads Totais</div>
        <div className="cardValor">{estatisticas.totalLeads}</div>
      </div>
      <div className="cardResumo">
        <div className="cardTitulo">Convertidos</div>
        <div className="cardValor">{estatisticas.leadsConvertidos}</div>
      </div>
      <div className="cardResumo">
        <div className="cardTitulo">Taxa de Conversão</div>
        <div className="cardValor">{estatisticas.taxaConversao?.toFixed(1)}%</div>
      </div>
      <div className="cardResumo">
        <div className="cardTitulo">Perdidos</div>
        <div className="cardValor">{estatisticas.leadsPerdidos}</div>
      </div>
      <div className="cardResumoDestaque">
        <div className="cardTitulo">Principal motivo de perda</div>
        <div className="cardValor">{motivoMaisFrequente}</div>
      </div>
    </div>
  )
}

export default LeadsSummaryCards
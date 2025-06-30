import React from 'react'
import styles from './DiarioLojaDetalhe.module.css'

type Props = {
  estatisticas: any
  motivoMaisFrequente: string
  loading: boolean
}

const LeadsSummaryCards: React.FC<Props> = ({ estatisticas, motivoMaisFrequente, loading }) => {
  if (loading || !estatisticas) {
    return <div className={styles.cardsGrid}>Carregando...</div>
  }
  return (
    <div className={styles.cardsGrid}>
      <div className={styles.cardResumo}>
        <div className={styles.cardTitulo}>Leads Totais</div>
        <div className={styles.cardValor}>{estatisticas.totalLeads}</div>
      </div>
      <div className={styles.cardResumo}>
        <div className={styles.cardTitulo}>Convertidos</div>
        <div className={styles.cardValor}>{estatisticas.leadsConvertidos}</div>
      </div>
      <div className={styles.cardResumo}>
        <div className={styles.cardTitulo}>Taxa de Conversão</div>
        <div className={styles.cardValor}>{estatisticas.taxaConversao?.toFixed(1)}%</div>
      </div>
      <div className={styles.cardResumo}>
        <div className={styles.cardTitulo}>Perdidos</div>
        <div className={styles.cardValor}>{estatisticas.leadsPerdidos}</div>
      </div>
      <div className={styles.cardResumoDestaque}>
        <div className={styles.cardTitulo}>Principal motivo de perda</div>
        <div className={styles.cardValor}>{motivoMaisFrequente}</div>
      </div>
    </div>
  )
}

export default LeadsSummaryCards 
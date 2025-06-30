import React from 'react'
import styles from './DiarioLojaDetalhe.module.css'
import LeadsSummaryCards from './LeadsSummaryCards'
import LeadsFilters from './LeadsFilters'
import LeadsCharts from './LeadsCharts'
import LeadsTable from './LeadsTable'
import { useDiarioDetalhe } from '../../../hooks/useDiarioDetalhe'

const DiarioLojaDetalhePage: React.FC = () => {
  const detalhe = useDiarioDetalhe()

  return (
    <div className={styles.detalheContainer}>
      <h1 className={styles.titulo}>Relatório Detalhado de Leads</h1>
      <LeadsSummaryCards estatisticas={detalhe.estatisticas} motivoMaisFrequente={detalhe.motivoMaisFrequente} loading={detalhe.loading} />
      <LeadsFilters
        filtros={detalhe.filtros}
        setLojaId={detalhe.setLojaId}
        setUsuarioId={detalhe.setUsuarioId}
        setDataInicio={detalhe.setDataInicio}
        setDataFim={detalhe.setDataFim}
        setStatus={detalhe.setStatus}
        setTipo={detalhe.setTipo}
        lojas={detalhe.lojas}
        usuarios={detalhe.usuarios}
        loading={detalhe.loading}
      />
      <LeadsCharts leads={detalhe.leads} estatisticas={detalhe.estatisticas} loading={detalhe.loading} />
      <LeadsTable leads={detalhe.leads} lojas={detalhe.lojas} usuarios={detalhe.usuarios} loading={detalhe.loading} />
    </div>
  )
}

export default DiarioLojaDetalhePage 
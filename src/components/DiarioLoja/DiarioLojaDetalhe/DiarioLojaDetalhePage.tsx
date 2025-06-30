import React from 'react'
import './DiarioLojaDetalhe.css'
import LeadsSummaryCards from './LeadsSummaryCards'
import LeadsFilters from './LeadsFilters'
import LeadsCharts from './LeadsCharts'
import LeadsTable from './LeadsTable'
import { useDiarioDetalhe } from '../../../hooks/useDiarioDetalhe'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const DiarioLojaDetalhePage: React.FC = () => {
  const detalhe = useDiarioDetalhe()
  const navigate = useNavigate()

  return (
    <div className="detalheContainer">
      <button className="back-button" style={{marginBottom: 24}} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} style={{marginRight: 8}} /> Voltar
      </button>
      <h1 className="titulo">Relatório Detalhado de Leads</h1>
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
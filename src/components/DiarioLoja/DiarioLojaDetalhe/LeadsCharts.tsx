import React from 'react'
import { MessageCircle, Store, TrendingDown, CheckCircle, BarChart3 } from 'lucide-react'
import './DiarioLojaDetalhe.css'
import { Lead } from '../../../services/diarioService'

type Props = {
  leads: Lead[]
  estatisticas: any
  loading: boolean
}

const LeadsCharts: React.FC<Props> = ({ leads, estatisticas, loading }) => {
  // Dados dos tipos de lead
  const tipos = {
    whatsapp: leads.filter(l => l.tipo === 'whatsapp/telefone').length,
    fisico: leads.filter(l => l.tipo === 'cliente físico').length
  }

  // Resumo de conversão por tipo
  const resumoTipo = [
    {
      nome: 'WhatsApp/Telefone',
      total: leads.filter(l => l.tipo === 'whatsapp/telefone').length,
      convertidos: leads.filter(l => l.tipo === 'whatsapp/telefone' && l.convertido === true).length,
      perdidos: leads.filter(l => l.tipo === 'whatsapp/telefone' && l.convertido === false).length
    },
    {
      nome: 'Físico',
      total: leads.filter(l => l.tipo === 'cliente físico').length,
      convertidos: leads.filter(l => l.tipo === 'cliente físico' && l.convertido === true).length,
      perdidos: leads.filter(l => l.tipo === 'cliente físico' && l.convertido === false).length
    }
  ]

  // Dados dos motivos de perda
  const motivos: Record<string, number> = {}
  leads.forEach(l => {
    if (l.motivo_perda) motivos[l.motivo_perda] = (motivos[l.motivo_perda] || 0) + 1
  })

  const motivosArray = Object.entries(motivos).sort((a, b) => b[1] - a[1])
  const maxMotivos = Math.max(...Object.values(motivos), 1)

  if (loading) {
    return (
      <div className="chartsGrid">
        <div className="chartCard">
          <div className="chartTitulo">Tipos de Lead</div>
          <div className="chartPlaceholder">
            <div className="chartNoData">
              <BarChart3 size={32} className="chartNoDataIcon" />
              <span>Carregando dados...</span>
            </div>
          </div>
        </div>
        <div className="chartCard">
          <div className="chartTitulo">Motivos de Perda</div>
          <div className="chartPlaceholder">
            <div className="chartNoData">
              <TrendingDown size={32} className="chartNoDataIcon" />
              <span>Carregando dados...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chartsGrid">
      {/* Card de Tipos de Lead */}
      <div className="chartCard">
        <div className="chartTitulo">Tipos de Lead</div>
        <div className="chartPlaceholder">
          {tipos.whatsapp === 0 && tipos.fisico === 0 ? (
            <div className="chartNoData">
              <MessageCircle size={32} className="chartNoDataIcon" />
              <span>Nenhum lead encontrado</span>
            </div>
          ) : (
            <>
              <div className="chartTypesGrid">
                {/* WhatsApp/Telefone */}
                <div className="chartTypeCard chartTypeCardEstatisticas">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageCircle size={24} className="chartTypeIcon" />
                    <div className="chartTypeLabel">WhatsApp/Telefone</div>
                  </div>
                  <div className="chartTypeValue">{tipos.whatsapp}</div>
                  <div className="chartTypeStats">
                    <div><span>Convertidos:</span> <b className="stat-convertido">{resumoTipo[0].convertidos}</b></div>
                    <div><span>Perdidos:</span> <b className="stat-perdido">{resumoTipo[0].perdidos}</b></div>
                    <div><span>Conversão:</span> <b className="stat-conversao">{resumoTipo[0].total > 0 ? ((resumoTipo[0].convertidos / resumoTipo[0].total) * 100).toFixed(1) : '0.0'}%</b></div>
                  </div>
                </div>
                {/* Físico */}
                <div className="chartTypeCard chartTypeCardEstatisticas">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Store size={24} className="chartTypeIcon" />
                    <div className="chartTypeLabel">Físico</div>
                  </div>
                  <div className="chartTypeValue">{tipos.fisico}</div>
                  <div className="chartTypeStats">
                    <div><span>Convertidos:</span> <b className="stat-convertido">{resumoTipo[1].convertidos}</b></div>
                    <div><span>Perdidos:</span> <b className="stat-perdido">{resumoTipo[1].perdidos}</b></div>
                    <div><span>Conversão:</span> <b className="stat-conversao">{resumoTipo[1].total > 0 ? ((resumoTipo[1].convertidos / resumoTipo[1].total) * 100).toFixed(1) : '0.0'}%</b></div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card de Motivos de Perda */}
      <div className="chartCard">
        <div className="chartTitulo">Motivos de Perda</div>
        <div className="chartPlaceholder">
          {motivosArray.length === 0 ? (
            <div className="chartNoData">
              <CheckCircle size={32} className="chartNoDataIcon" />
              <span>Nenhuma perda registrada</span>
            </div>
          ) : (
            <div className="chartData">
              {motivosArray.slice(0, 5).map(([motivo, qtd]) => (
                <div key={motivo} className="chartDataItem">
                  <div className="chartDataLabel">
                    {motivo}
                  </div>
                  <div className="chartDataBar">
                    <div className="chartDataProgress">
                      <div 
                        className="chartDataProgressFill"
                        style={{ width: `${(qtd / maxMotivos) * 100}%` }}
                      />
                    </div>
                    <div className="chartDataValue">{qtd}</div>
                  </div>
                </div>
              ))}
              {motivosArray.length > 5 && (
                <div className="chartDataItem" style={{ opacity: 0.7 }}>
                  <div className="chartDataLabel">
                    +{motivosArray.length - 5} outros motivos
                  </div>
                  <div className="chartDataValue">
                    {motivosArray.slice(5).reduce((sum, [, qtd]) => sum + qtd, 0)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadsCharts
import React from 'react'
import { MessageCircle, Store, TrendingDown, CheckCircle, BarChart3 } from 'lucide-react'
import styles from './DiarioLojaDetalhe.module.css'
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

  // Dados dos motivos de perda
  const motivos: Record<string, number> = {}
  leads.forEach(l => {
    if (l.motivo_perda) motivos[l.motivo_perda] = (motivos[l.motivo_perda] || 0) + 1
  })

  const motivosArray = Object.entries(motivos).sort((a, b) => b[1] - a[1])
  const maxMotivos = Math.max(...Object.values(motivos), 1)

  if (loading) {
    return (
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitulo}>Tipos de Lead</div>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartNoData}>
              <BarChart3 size={32} className={styles.chartNoDataIcon} />
              <span>Carregando dados...</span>
            </div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartTitulo}>Motivos de Perda</div>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartNoData}>
              <TrendingDown size={32} className={styles.chartNoDataIcon} />
              <span>Carregando dados...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chartsGrid}>
      {/* Card de Tipos de Lead */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitulo}>Tipos de Lead</div>
        <div className={styles.chartPlaceholder}>
          {tipos.whatsapp === 0 && tipos.fisico === 0 ? (
            <div className={styles.chartNoData}>
              <MessageCircle size={32} className={styles.chartNoDataIcon} />
              <span>Nenhum lead encontrado</span>
            </div>
          ) : (
            <div className={styles.chartTypesGrid}>
              <div className={styles.chartTypeCard}>
                <MessageCircle size={24} className={styles.chartTypeIcon} />
                <div className={styles.chartTypeLabel}>WhatsApp/Telefone</div>
                <div className={styles.chartTypeValue}>{tipos.whatsapp}</div>
              </div>
              <div className={styles.chartTypeCard}>
                <Store size={24} className={styles.chartTypeIcon} />
                <div className={styles.chartTypeLabel}>Físico</div>
                <div className={styles.chartTypeValue}>{tipos.fisico}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card de Motivos de Perda */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitulo}>Motivos de Perda</div>
        <div className={styles.chartPlaceholder}>
          {motivosArray.length === 0 ? (
            <div className={styles.chartNoData}>
              <CheckCircle size={32} className={styles.chartNoDataIcon} />
              <span>Nenhuma perda registrada</span>
            </div>
          ) : (
            <div className={styles.chartData}>
              {motivosArray.slice(0, 5).map(([motivo, qtd]) => (
                <div key={motivo} className={styles.chartDataItem}>
                  <div className={styles.chartDataLabel}>
                    {motivo}
                  </div>
                  <div className={styles.chartDataBar}>
                    <div className={styles.chartDataProgress}>
                      <div 
                        className={styles.chartDataProgressFill}
                        style={{ width: `${(qtd / maxMotivos) * 100}%` }}
                      />
                    </div>
                    <div className={styles.chartDataValue}>{qtd}</div>
                  </div>
                </div>
              ))}
              {motivosArray.length > 5 && (
                <div className={styles.chartDataItem} style={{ opacity: 0.7 }}>
                  <div className={styles.chartDataLabel}>
                    +{motivosArray.length - 5} outros motivos
                  </div>
                  <div className={styles.chartDataValue}>
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
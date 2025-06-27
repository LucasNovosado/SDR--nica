// hooks/usePontosGlobal.ts
import { usePontosContext } from '../contexts/PontosContext'

export const usePontosGlobal = () => {
  const { 
    totalPontos, 
    pontosHoje, 
    adicionarPontosInstantaneo, 
    formatarPontos,
    nivelInfo,
    loading 
  } = usePontosContext()

  return {
    totalPontos,
    pontosHoje,
    adicionarPontosInstantaneo,
    formatarPontos,
    nivelInfo,
    loading
  }
}
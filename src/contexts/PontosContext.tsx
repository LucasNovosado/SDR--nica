// contexts/PontosContext.tsx
import React, { createContext, useContext } from 'react'
import { usePontos } from '../hooks/usePontos'

interface PontosContextType {
  totalPontos: number
  pontosHoje: number
  userName: string
  nivelInfo: any
  loading: boolean
  error: string | null
  isUpdating: boolean
  adicionarPontos: (pontos?: number) => Promise<boolean>
  adicionarPontosInstantaneo: (pontos: number) => void
  formatarPontos: (pontos: number) => string
  atualizarPontos: () => Promise<void>
}

const PontosContext = createContext<PontosContextType | undefined>(undefined)

export const PontosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pontosData = usePontos()

  return (
    <PontosContext.Provider value={pontosData}>
      {children}
    </PontosContext.Provider>
  )
}

export const usePontosContext = () => {
  const context = useContext(PontosContext)
  if (context === undefined) {
    throw new Error('usePontosContext deve ser usado dentro de um PontosProvider')
  }
  return context
}
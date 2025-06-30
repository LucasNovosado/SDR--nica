import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '../services/supabase'
import { pontosService } from '../services/pontosService'

interface PointsContextType {
  pontos: number
  loading: boolean
  error: string | null
  adicionarPontos: (valor: number) => Promise<void>
  atualizarPontos: () => Promise<void>
  resetarPontos: () => void
}

const PointsContext = createContext<PointsContextType | undefined>(undefined)

export const PointsProvider = ({ children }: { children: ReactNode }) => {
  const [pontos, setPontos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Buscar pontos totais do usuário logado
  const fetchPontos = useCallback(async (uid?: string) => {
    setLoading(true)
    setError(null)
    try {
      let user_id = uid
      if (!user_id) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')
        user_id = user.id
      }
      setUserId(user_id)
      const total = await pontosService.getTotalPontosUsuario(user_id)
      setPontos(total)
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar pontos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Adicionar pontos e garantir persistência e atualização
  const adicionarPontos = useCallback(async (valor: number) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      // Buscar lojaId do usuário
      const { data: userData, error: userError } = await supabase
        .from('users_regras')
        .select('loja_id')
        .eq('user_ref', user.id)
        .single()
      if (userError) throw new Error('Erro ao buscar loja do usuário')
      const lojaId = userData?.loja_id
      if (!lojaId) throw new Error('Loja não encontrada para o usuário')
      // Adiciona pontos no Supabase
      await pontosService.adicionarPontos(user.id, lojaId, valor)
      // Atualiza localmente para reatividade instantânea
      setPontos(prev => prev + valor)
      // Busca novamente do Supabase para garantir consistência
      await fetchPontos(user.id)
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar pontos')
    } finally {
      setLoading(false)
    }
  }, [fetchPontos])

  // Resetar pontos localmente (opcional)
  const resetarPontos = useCallback(() => setPontos(0), [])

  // Buscar pontos ao iniciar e ao trocar de usuário
  useEffect(() => {
    fetchPontos()
    // Listener para login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.id) {
        fetchPontos(session.user.id)
      }
      if (event === 'SIGNED_OUT') {
        setPontos(0)
        setUserId(null)
      }
    })
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [fetchPontos])

  return (
    <PointsContext.Provider value={{ pontos, loading, error, adicionarPontos, atualizarPontos: fetchPontos, resetarPontos }}>
      {children}
    </PointsContext.Provider>
  )
}

export const usePointsStore = () => {
  const context = useContext(PointsContext)
  if (!context) throw new Error('usePointsStore deve ser usado dentro de um PointsProvider')
  return context
} 
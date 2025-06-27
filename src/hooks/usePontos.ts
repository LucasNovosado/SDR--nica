import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import { pontosService } from '../services/pontosService'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface NivelInfo {
  nivel: number
  nome: string
  pontosMinimos: number
  pontosProximoNivel: number
  progresso: number
}

interface PontosState {
  totalPontos: number
  pontosHoje: number
  userName: string
  nivelInfo: NivelInfo
  loading: boolean
  error: string | null
}

interface UsePontosReturn extends PontosState {
  adicionarPontos: (pontos?: number) => Promise<boolean>
  adicionarPontosInstantaneo: (pontos: number) => void // <- NOVA FUNÇÃO
  formatarPontos: (pontos: number) => string
  atualizarPontos: () => Promise<void>
  isUpdating: boolean
}

// Cache local para evitar chamadas desnecessárias
interface PontosCache {
  totalPontos: number
  pontosHoje: number
  timestamp: number
  userId: string
}

const CACHE_DURATION = 30000 // 30 segundos
const PONTOS_POR_ACAO = 50

const NIVEIS = [
  { nivel: 1, nome: 'Iniciante', pontosMinimos: 0 },
  { nivel: 2, nome: 'Aprendiz', pontosMinimos: 100 },
  { nivel: 3, nome: 'Competente', pontosMinimos: 300 },
  { nivel: 4, nome: 'Proficiente', pontosMinimos: 600 },
  { nivel: 5, nome: 'Expert', pontosMinimos: 1000 },
  { nivel: 6, nome: 'Mestre', pontosMinimos: 1500 },
  { nivel: 7, nome: 'Lenda', pontosMinimos: 2500 },
]

export const usePontos = (): UsePontosReturn => {
  const [state, setState] = useState<PontosState>({
    totalPontos: 0,
    pontosHoje: 0,
    userName: '',
    nivelInfo: {
      nivel: 1,
      nome: 'Iniciante',
      pontosMinimos: 0,
      pontosProximoNivel: 100,
      progresso: 0
    },
    loading: true,
    error: null
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const cacheRef = useRef<PontosCache | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const userIdRef = useRef<string | null>(null)
  const lojaIdRef = useRef<string | null>(null)

  // Função para calcular informações do nível
  const calcularNivelInfo = useCallback((totalPontos: number): NivelInfo => {
    let nivelAtual = NIVEIS[0]
    
    for (let i = NIVEIS.length - 1; i >= 0; i--) {
      if (totalPontos >= NIVEIS[i].pontosMinimos) {
        nivelAtual = NIVEIS[i]
        break
      }
    }

    const proximoNivel = NIVEIS.find(n => n.pontosMinimos > totalPontos)
    const pontosProximoNivel = proximoNivel ? proximoNivel.pontosMinimos : nivelAtual.pontosMinimos
    const pontosParaProximo = pontosProximoNivel - nivelAtual.pontosMinimos
    const pontosProgresso = totalPontos - nivelAtual.pontosMinimos
    const progresso = pontosParaProximo > 0 ? (pontosProgresso / pontosParaProximo) * 100 : 100

    return {
      nivel: nivelAtual.nivel,
      nome: nivelAtual.nome,
      pontosMinimos: nivelAtual.pontosMinimos,
      pontosProximoNivel,
      progresso: Math.min(100, Math.max(0, progresso))
    }
  }, [])

  // ===== NOVA FUNÇÃO: Adicionar pontos instantaneamente =====
  const adicionarPontosInstantaneo = useCallback((pontos: number) => {
    console.log('🚀 [usePontos] Adicionando pontos instantâneo:', pontos)
    
    setState(prev => {
      const novoTotal = prev.totalPontos + pontos
      const novosPontosHoje = prev.pontosHoje + pontos
      const novoNivelInfo = calcularNivelInfo(novoTotal)

      // Atualizar cache imediatamente se existir
      if (cacheRef.current && userIdRef.current) {
        cacheRef.current = {
          totalPontos: novoTotal,
          pontosHoje: novosPontosHoje,
          timestamp: Date.now(),
          userId: userIdRef.current
        }
      }

      console.log('✅ [usePontos] Pontos atualizados instantaneamente:', {
        antes: { total: prev.totalPontos, hoje: prev.pontosHoje },
        depois: { total: novoTotal, hoje: novosPontosHoje }
      })

      return {
        ...prev,
        totalPontos: novoTotal,
        pontosHoje: novosPontosHoje,
        nivelInfo: novoNivelInfo
      }
    })
  }, [calcularNivelInfo])

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((cache: PontosCache | null, userId: string): boolean => {
    if (!cache || cache.userId !== userId) return false
    const now = Date.now()
    return (now - cache.timestamp) < CACHE_DURATION
  }, [])

  // Função para atualizar o estado local
  const updateState = useCallback((updates: Partial<PontosState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Função para buscar dados do usuário
  const fetchUserData = useCallback(async (): Promise<{ userId: string; userName: string; lojaId: string } | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        updateState({ error: 'Usuário não autenticado', loading: false })
        return null
      }

      const { data: userData, error: userError } = await supabase
        .from('users_regras')
        .select('nome, loja_id')
        .eq('user_ref', user.id)
        .single()

      if (userError) {
        console.error('❌ [usePontos] Erro ao buscar dados do usuário:', userError)
        updateState({ error: 'Erro ao carregar dados do usuário', loading: false })
        return null
      }

      return {
        userId: user.id,
        userName: userData?.nome || 'Usuário',
        lojaId: userData?.loja_id || ''
      }
    } catch (error) {
      console.error('❌ [usePontos] Erro ao buscar usuário:', error)
      updateState({ error: 'Erro ao carregar usuário', loading: false })
      return null
    }
  }, [updateState])

  // Função para buscar pontos com cache
  const fetchPontos = useCallback(async (userId: string, forceRefresh = false): Promise<void> => {
    try {
      // Verificar cache se não for refresh forçado
      if (!forceRefresh && isCacheValid(cacheRef.current, userId)) {
        const cache = cacheRef.current!
        const nivelInfo = calcularNivelInfo(cache.totalPontos)
        
        updateState({
          totalPontos: cache.totalPontos,
          pontosHoje: cache.pontosHoje,
          nivelInfo,
          loading: false,
          error: null
        })
        return
      }

      console.log('🔄 [usePontos] Buscando pontos do servidor...', { userId, forceRefresh })

      // Buscar dados em paralelo para melhor performance
      const [totalPontos, pontosHoje] = await Promise.all([
        pontosService.getTotalPontosUsuario(userId),
        pontosService.getPontosHoje(userId)
      ])

      console.log('📊 [usePontos] Pontos carregados:', { totalPontos, pontosHoje })

      // Atualizar cache
      cacheRef.current = {
        totalPontos,
        pontosHoje,
        timestamp: Date.now(),
        userId
      }

      // Calcular nível
      const nivelInfo = calcularNivelInfo(totalPontos)

      // Atualizar estado
      updateState({
        totalPontos,
        pontosHoje,
        nivelInfo,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('❌ [usePontos] Erro ao buscar pontos:', error)
      updateState({ 
        error: 'Erro ao carregar pontos',
        loading: false 
      })
    }
  }, [isCacheValid, calcularNivelInfo, updateState])

  // Função para atualizar pontos localmente (otimistic update)
  const updatePontosLocally = useCallback((pontosAdicionados: number) => {
    setState(prev => {
      const novoTotal = prev.totalPontos + pontosAdicionados
      const novosPontosHoje = prev.pontosHoje + pontosAdicionados
      const novoNivelInfo = calcularNivelInfo(novoTotal)

      // Atualizar cache também
      if (cacheRef.current) {
        cacheRef.current.totalPontos = novoTotal
        cacheRef.current.pontosHoje = novosPontosHoje
        cacheRef.current.timestamp = Date.now()
      }

      return {
        ...prev,
        totalPontos: novoTotal,
        pontosHoje: novosPontosHoje,
        nivelInfo: novoNivelInfo
      }
    })
  }, [calcularNivelInfo])

  // Configurar Realtime subscription
  const setupRealtimeSubscription = useCallback((userId: string) => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
    }

    console.log('🔴 [usePontos] Configurando Realtime para usuário:', userId)

    const channel = supabase
      .channel(`pontos_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pontuacoes',
          filter: `usuario_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 [usePontos] Nova pontuação recebida via Realtime:', payload)
          
          if (payload.new && typeof payload.new.pontos === 'number') {
            updatePontosLocally(payload.new.pontos)
            
            // Trigger animação de conquista se necessário
            if (payload.new.pontos >= 100) {
              console.log('🎉 [usePontos] Grande conquista detectada!')
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pontuacoes',
          filter: `usuario_id=eq.${userId}`
        },
        (payload) => {
          console.log('📡 [usePontos] Pontuação atualizada via Realtime:', payload)
          
          // Recarregar dados para garantir consistência
          fetchPontos(userId, true)
        }
      )
      .subscribe((status) => {
        console.log(`🔴 [usePontos] Status da subscription: ${status}`)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ [usePontos] Realtime conectado com sucesso')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [usePontos] Erro na conexão Realtime')
        }
      })

    channelRef.current = channel
  }, [updatePontosLocally, fetchPontos])

  // Função para adicionar pontos com update otimista
  const adicionarPontos = useCallback(async (pontos = PONTOS_POR_ACAO): Promise<boolean> => {
    if (!userIdRef.current || !lojaIdRef.current) {
      console.error('❌ [usePontos] Dados do usuário não disponíveis')
      return false
    }

    try {
      console.log('➕ [usePontos] Adicionando pontos:', pontos)
      setIsUpdating(true)

      // Update otimista - atualizar UI imediatamente
      updatePontosLocally(pontos)

      // Enviar para o servidor
      const result = await pontosService.adicionarPontos(
        userIdRef.current,
        lojaIdRef.current,
        pontos
      )

      if (result.error) {
        console.error('❌ [usePontos] Erro ao adicionar pontos, revertendo:', result.error)
        
        // Reverter update otimista em caso de erro
        updatePontosLocally(-pontos)
        
        updateState({ error: 'Erro ao adicionar pontos' })
        return false
      }

      console.log('✅ [usePontos] Pontos adicionados com sucesso')
      
      // Limpar erro se houver
      if (state.error) {
        updateState({ error: null })
      }

      return true
    } catch (error) {
      console.error('❌ [usePontos] Erro ao adicionar pontos:', error)
      
      // Reverter update otimista
      updatePontosLocally(-pontos)
      
      updateState({ error: 'Erro ao adicionar pontos' })
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [updatePontosLocally, updateState, state.error])

  // Função para atualizar pontos manualmente
  const atualizarPontos = useCallback(async (): Promise<void> => {
    if (!userIdRef.current) return
    
    setIsUpdating(true)
    await fetchPontos(userIdRef.current, true)
    setIsUpdating(false)
  }, [fetchPontos])

  // Função para formatar pontos
  const formatarPontos = useCallback((pontos: number): string => {
    if (pontos >= 1000000) {
      return `${(pontos / 1000000).toFixed(1)}M`
    } else if (pontos >= 1000) {
      return `${(pontos / 1000).toFixed(1)}k`
    }
    return pontos.toString()
  }, [])

  // Inicialização
  useEffect(() => {
    let mounted = true

    const initializePontos = async () => {
      console.log('🚀 [usePontos] Inicializando sistema de pontos...')
      
      const userData = await fetchUserData()
      if (!userData || !mounted) return

      const { userId, userName, lojaId } = userData
      
      // Armazenar referências
      userIdRef.current = userId
      lojaIdRef.current = lojaId

      // Atualizar nome do usuário
      updateState({ userName })

      // Buscar pontos iniciais
      await fetchPontos(userId)

      // Configurar Realtime
      setupRealtimeSubscription(userId)
    }

    initializePontos()

    return () => {
      mounted = false
      
      // Cleanup da subscription
      if (channelRef.current) {
        console.log('🔌 [usePontos] Desconectando Realtime...')
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [fetchUserData, fetchPontos, setupRealtimeSubscription, updateState])

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [])

  return {
    ...state,
    adicionarPontos,
    adicionarPontosInstantaneo, // <- NOVA FUNÇÃO EXPORTADA
    formatarPontos,
    atualizarPontos,
    isUpdating
  }
}
import { useState, useEffect, useRef } from 'react'
import { supabase, User } from '../services/supabase'
import { userLevelsService, UserLevel, UserWithLevel } from '../services/userLevelsService'
import { Session } from '@supabase/supabase-js'

// Interface simples
export interface SimpleUser {
  id: string
  email: string
  created_at: string
}

export const useAuth = () => {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [userWithLevel, setUserWithLevel] = useState<UserWithLevel | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Ref para controlar se já foi inicializado
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)

  // Função para buscar dados do usuário com nível
  const fetchUserWithLevel = async (userId: string) => {
    try {
      console.log('🔍 Buscando dados do usuário com nível:', userId)
      const userWithLevelData = await userLevelsService.getUserWithLevel(userId)
      setUserWithLevel(userWithLevelData)
      console.log('📋 Dados do usuário com nível:', userWithLevelData)
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário com nível:', error)
      setUserWithLevel(null)
    }
  }

  useEffect(() => {
    // Se já foi inicializado, não executar novamente
    if (initialized.current) {
      console.log('useAuth - JÁ INICIALIZADO, pulando...')
      return
    }

    console.log('useAuth - PRIMEIRA INICIALIZAÇÃO')
    initialized.current = true

    const initAuth = async () => {
      try {
        // Verificar sessão atual
        console.log('🔍 Verificando sessão...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error)
          setLoading(false)
          return
        }

        console.log('📋 Sessão encontrada:', !!session)
        setSession(session)
        
        if (session?.user) {
          const simpleUser: SimpleUser = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          }
          console.log('👤 Usuário definido:', simpleUser.email)
          setUser(simpleUser)
          
          // Buscar dados do usuário com nível
          await fetchUserWithLevel(session.user.id)
        } else {
          console.log('❌ Nenhum usuário encontrado')
          setUser(null)
          setUserWithLevel(null)
        }
        
        console.log('✅ Loading definido como false')
        setLoading(false)

      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
        setLoading(false)
      }
    }

    // Executar inicialização
    initAuth()

    // Configurar listener apenas uma vez
    console.log('🎧 Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event)
        
        // Atualizar apenas em eventos importantes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setSession(session)
          
          if (session?.user) {
            const simpleUser: SimpleUser = {
              id: session.user.id,
              email: session.user.email!,
              created_at: session.user.created_at
            }
            console.log('👤 Usuário atualizado via listener:', simpleUser.email)
            setUser(simpleUser)
            
            // Buscar dados do usuário com nível
            await fetchUserWithLevel(session.user.id)
          } else {
            console.log('❌ Usuário removido via listener')
            setUser(null)
            setUserWithLevel(null)
          }
        }
        
        // Não mudar loading no listener, só na inicialização
      }
    )

    subscriptionRef.current = subscription

    // Cleanup function
    return () => {
      console.log('🧹 useAuth - Cleanup executado')
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, []) // IMPORTANTE: Array vazio - só executa UMA vez

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentando fazer login com:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Erro no login:', error.message)
      } else {
        console.log('✅ Login bem-sucedido!')
      }
      
      return { data, error }
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('📝 Tentando cadastrar:', email)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Erro no cadastro:', error.message)
      } else {
        console.log('✅ Cadastro bem-sucedido!')
      }
      
      return { data, error }
    } catch (error) {
      console.error('❌ Erro inesperado no cadastro:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    console.log('🚪 Fazendo logout...')
    try {
      const { error } = await supabase.auth.signOut()
      
      if (!error) {
        console.log('✅ Logout bem-sucedido!')
        setUser(null)
        setUserWithLevel(null)
        setSession(null)
      } else {
        console.error('❌ Erro no logout:', error.message)
      }
      
      return { error }
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error)
      return { error }
    }
  }

  // Funções de utilidade baseadas no nível do usuário
  const userLevel = userWithLevel?.nivel
  const userPermissions = userLevel ? userLevelsService.getUserPermissions(userLevel) : null

  const hasPermission = (requiredLevel: UserLevel): boolean => {
    if (!userLevel) return false
    return userLevelsService.hasPermission(userLevel, requiredLevel)
  }

  const canAccessStore = (targetLojaId: string): boolean => {
    if (!userLevel) return false
    return userLevelsService.canAccessStore(userLevel, userWithLevel?.loja_id || null, targetLojaId)
  }

  // Log do estado atual (apenas uma vez por render)
  const currentState = {
    hasUser: !!user,
    hasSession: !!session,
    userLevel: userLevel || 'none',
    loading,
    userEmail: user?.email || 'none',
    initialized: initialized.current
  }
  
  console.log('📊 useAuth - Estado atual:', currentState)

  return {
    user,
    userWithLevel,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    // Informações de nível e permissões
    userLevel,
    userPermissions,
    hasPermission,
    canAccessStore,
    // Atalhos para verificar níveis específicos
    isDirector: userLevel === 'diretor',
    isManager: userLevel === 'gerente',
    isSeller: userLevel === 'vendedor',
    isDeliveryPerson: userLevel === 'entregador'
  }
}
import { useState, useEffect, useRef } from 'react'
import { supabase, User } from '../services/supabase'
import { userLevelsService, UserLevel, UserWithLevel } from '../services/userLevelsService'
import { Session } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  
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
        // Recupera sessão do Supabase (localStorage/IndexedDB)
        // Se existir, mantém usuário logado
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error)
          setLoading(false)
          return
        }
        setSession(session)
        if (session?.user) {
          const simpleUser: SimpleUser = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          }
          setUser(simpleUser)
          await fetchUserWithLevel(session.user.id)
        } else {
          setUser(null)
          setUserWithLevel(null)
        }
        setLoading(false)
      } catch (error) {
        setLoading(false)
      }
    }

    // Executar inicialização
    initAuth()

    // Listener para mudanças de sessão (login, logout, refresh, expiração)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Atualiza estado global sempre que a sessão mudar
        setSession(session)
        if (session?.user) {
          const simpleUser: SimpleUser = {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          }
          setUser(simpleUser)
          await fetchUserWithLevel(session.user.id)
        } else {
          setUser(null)
          setUserWithLevel(null)
          // Se sessão expirar ou logout, redireciona para login
          navigate('/login')
        }
      }
    )
    subscriptionRef.current = subscription
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [navigate]) // Inclui navigate para garantir redirecionamento

  const signIn = async (email: string, password: string) => {
    // Função centralizada de login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (!error && data.session) {
        setSession(data.session)
        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        })
        await fetchUserWithLevel(data.user.id)
      }
      return { data, error }
    } catch (error) {
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
    // Função centralizada de logout
    try {
      const { error } = await supabase.auth.signOut()
      setUser(null)
      setUserWithLevel(null)
      setSession(null)
      navigate('/login')
      return { error }
    } catch (error) {
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
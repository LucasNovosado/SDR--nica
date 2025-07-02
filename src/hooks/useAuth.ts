import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { userLevelsService, UserLevel, UserWithLevel } from '../services/userLevelsService'
import { Session } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

// Interface simples
export interface SimpleUser {
  id: string
  email: string
  created_at: string
}

const SESSION_STORAGE_KEY = 'unica_session'
const USER_STORAGE_KEY = 'unica_user'

function saveSessionToStorage(session: Session | null, user: SimpleUser | null) {
  if (session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  }
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

function loadSessionFromStorage(): { session: Session | null, user: SimpleUser | null } {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY)
    const userStr = localStorage.getItem(USER_STORAGE_KEY)
    const session = sessionStr ? JSON.parse(sessionStr) : null
    const user = userStr ? JSON.parse(userStr) : null
    return { session, user }
  } catch {
    return { session: null, user: null }
  }
}

let focusLock = false
let focusTimeout: NodeJS.Timeout | null = null

export const useAuth = () => {
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [userWithLevel, setUserWithLevel] = useState<UserWithLevel | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine)
  const [showOffline, setShowOffline] = useState(false)
  const navigate = useNavigate()
  const initialized = useRef(false)
  const subscriptionRef = useRef<any>(null)
  const lastUserId = useRef<string | null>(null)

  // Busca dados do usuário com nível
  const fetchUserWithLevel = useCallback(async (userId: string): Promise<boolean> => {
    if (lastUserId.current === userId && userWithLevel) {
      console.log('[fetchUserWithLevel] Já carregado para', userId)
      return true
    }
    try {
      const userWithLevelData = await userLevelsService.getUserWithLevel(userId)
      setUserWithLevel(userWithLevelData)
      lastUserId.current = userId
      console.log('[fetchUserWithLevel] Sucesso', userWithLevelData)
      return true
    } catch (error) {
      setUserWithLevel(null)
      console.log('[fetchUserWithLevel] Erro', error)
      return false
    }
  }, [userWithLevel])

  // Recupera sessão inicial
  const restoreSession = useCallback(async () => {
    setLoading(true)
    console.log('[restoreSession] Iniciando')
    try {
      const { data: { session: supaSession } } = await supabase.auth.getSession()
      if (supaSession && supaSession.user) {
        const simpleUser: SimpleUser = {
          id: supaSession.user.id,
          email: supaSession.user.email!,
          created_at: supaSession.user.created_at
        }
        setSession(supaSession)
        setUser(simpleUser)
        await fetchUserWithLevel(supaSession.user.id)
        setShowOffline(false)
        console.log('[restoreSession] Sessão recuperada', supaSession)
      } else {
        setSession(null)
        setUser(null)
        setUserWithLevel(null)
        setShowOffline(!window.navigator.onLine)
        console.log('[restoreSession] Sem sessão, redirecionando login')
      }
    } catch (error) {
      setSession(null)
      setUser(null)
      setUserWithLevel(null)
      setShowOffline(!window.navigator.onLine)
      console.error('🔴 useAuth: Erro inesperado ao restaurar sessão:', error)
    } finally {
      setLoading(false)
      console.log('[restoreSession] FINALIZADO loading=false')
    }
  }, [fetchUserWithLevel])

  // Handler para eventos do Supabase
  const handleAuthChange = useCallback(async (event: string, newSession: Session | null) => {
    console.log('[handleAuthChange] Evento', event, newSession)
    try {
      if (newSession && newSession.user) {
        const simpleUser: SimpleUser = {
          id: newSession.user.id,
          email: newSession.user.email!,
          created_at: newSession.user.created_at
        }
        setSession(newSession)
        setUser(simpleUser)
        await fetchUserWithLevel(newSession.user.id)
        setShowOffline(false)
        console.log('[handleAuthChange] Sessão atualizada', newSession)
      } else {
        // Se for SIGNED_OUT ou USER_DELETED, limpa tudo
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null)
          setUser(null)
          setUserWithLevel(null)
          saveSessionToStorage(null, null)
          setShowOffline(false)
          console.log('🔴 useAuth: Usuário saiu/deletado, limpando tudo')
        } else {
          // Se for outro evento, tenta restaurar do storage antes de limpar
          const { session: storageSession, user: storageUser } = loadSessionFromStorage()
          if (storageSession && storageUser) {
            setSession(storageSession)
            setUser(storageUser)
            await fetchUserWithLevel(storageUser.id)
            setShowOffline(false)
            console.log('✅ useAuth: Restaurando sessão do storage...')
          } else {
            setSession(null)
            setUser(null)
            setUserWithLevel(null)
            saveSessionToStorage(null, null)
            setShowOffline(!window.navigator.onLine)
            console.log('⚠️ useAuth: Sem sessão, redirecionando login')
          }
        }
      }
    } catch (error) {
      setSession(null)
      setUser(null)
      setUserWithLevel(null)
      setShowOffline(!window.navigator.onLine)
      console.error('🔴 useAuth: Erro inesperado ao processar evento:', error)
    } finally {
      setLoading(false)
      console.log('[handleAuthChange] FINALIZADO loading=false')
    }
  }, [fetchUserWithLevel])

  // Inicialização única
  useEffect(() => {
    if (initialized.current) {
      console.log('[useEffect:init] Já inicializado, return')
      return
    }
    initialized.current = true
    console.log('[useEffect:init] Chamando restoreSession')
    restoreSession()
    // Listener para eventos do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)
    subscriptionRef.current = subscription
    // Listener para foco (com debounce/lock)
    const handleFocus = () => {
      if (focusLock) return
      focusLock = true
      if (focusTimeout) clearTimeout(focusTimeout)
      focusTimeout = setTimeout(() => { focusLock = false }, 1000)
      console.log('🔁 useAuth: Evento foco, revalidando sessão...')
      restoreSession()
    }
    window.addEventListener('focus', handleFocus)
    // Listener para online/offline
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
      console.log('🟢 useAuth: Conexão restabelecida, tentando restaurar sessão...')
      restoreSession()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowOffline(true)
      console.log('🔴 useAuth: App ficou offline')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
      console.log('[useEffect:init] Unsubscribed')
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (focusTimeout) clearTimeout(focusTimeout)
    }
  }, [restoreSession, handleAuthChange])

  // Redireciona para login se não houver sessão após loading
  useEffect(() => {
    if (!loading && !user) {
      console.log('[useEffect:redirect] Redirecionando para login')
      navigate('/login')
    }
  }, [loading, user, navigate])

  // Métodos de autenticação
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    console.log('[signIn] Iniciando')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.session && data.user) {
        const simpleUser: SimpleUser = {
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at
        }
        setSession(data.session)
        setUser(simpleUser)
        await fetchUserWithLevel(data.user.id)
        console.log('[signIn] Login bem-sucedido', data.session)
      }
      return { data, error }
    } catch (error) {
      console.log('[signIn] Erro', error)
      return { data: null, error }
    } finally {
      setLoading(false)
      console.log('[signIn] FINALIZADO loading=false')
    }
  }, [fetchUserWithLevel])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    console.log('[signUp] Iniciando')
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      return { data, error }
    } catch (error) {
      console.log('[signUp] Erro', error)
      return { data: null, error }
    } finally {
      setLoading(false)
      console.log('[signUp] FINALIZADO loading=false')
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    console.log('[signOut] Iniciando')
    try {
      const { error } = await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setUserWithLevel(null)
      saveSessionToStorage(null, null)
      navigate('/login')
      console.log('[signOut] Logout concluído')
      return { error }
    } catch (error) {
      console.log('[signOut] Erro', error)
      return { error }
    } finally {
      setLoading(false)
      console.log('[signOut] FINALIZADO loading=false')
    }
  }, [navigate])

  // Permissões e utilidades
  const userLevel = userWithLevel?.nivel
  const userPermissions = userLevel ? userLevelsService.getUserPermissions(userLevel) : null
  const hasPermission = useCallback((requiredLevel: UserLevel): boolean => {
    if (!userLevel) return false
    return userLevelsService.hasPermission(userLevel, requiredLevel)
  }, [userLevel])
  const canAccessStore = useCallback((targetLojaId: string): boolean => {
    if (!userLevel) return false
    return userLevelsService.canAccessStore(userLevel, userWithLevel?.loja_id || null, targetLojaId)
  }, [userLevel, userWithLevel])

  // Log detalhado do estado final do hook
  console.log('[useAuth:RETURN]', {
    user,
    userWithLevel,
    session,
    loading,
    isOnline,
    showOffline
  })
  return {
    user,
    userWithLevel,
    session,
    loading,
    isOnline,
    showOffline,
    signIn,
    signUp,
    signOut,
    userLevel,
    userPermissions,
    hasPermission,
    canAccessStore,
    isDirector: userLevel === 'diretor',
    isManager: userLevel === 'gerente',
    isSeller: userLevel === 'vendedor',
    isDeliveryPerson: userLevel === 'entregador'
  }
}
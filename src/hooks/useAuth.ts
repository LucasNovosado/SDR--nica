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
  const fetchUserWithLevel = useCallback(async (userId: string) => {
    if (lastUserId.current === userId && userWithLevel) {
      console.log('ℹ️ useAuth: userWithLevel já carregado para', userId)
      return
    }
    try {
      console.log('🔵 useAuth: Buscando nível/permissão para user:', userId)
      const userWithLevelData = await userLevelsService.getUserWithLevel(userId)
      setUserWithLevel(userWithLevelData)
      lastUserId.current = userId
      console.log('🟢 useAuth: userWithLevel carregado:', userWithLevelData)
    } catch (error) {
      console.error('🔴 useAuth: Erro ao buscar userWithLevel:', error)
      setUserWithLevel(null)
    }
  }, [userWithLevel])

  // Restaura sessão do Supabase e do storage
  const restoreSession = useCallback(async (logPrefix = 'Inicial') => {
    setLoading(true)
    console.log(`🟢 useAuth: [${logPrefix}] Verificando sessão inicial...`)
    try {
      const { data: { session: supaSession }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('🔴 useAuth: Erro ao buscar sessão do Supabase:', error)
      }
      if (supaSession && supaSession.user) {
        const simpleUser: SimpleUser = {
          id: supaSession.user.id,
          email: supaSession.user.email!,
          created_at: supaSession.user.created_at
        }
        setSession(supaSession)
        setUser(simpleUser)
        saveSessionToStorage(supaSession, simpleUser)
        await fetchUserWithLevel(supaSession.user.id)
        setLoading(false)
        setShowOffline(false)
        console.log('✅ useAuth: Sessão recuperada', supaSession)
        return
      }
      // Se não encontrou, tenta storage
      const { session: storageSession, user: storageUser } = loadSessionFromStorage()
      if (storageSession && storageUser) {
        setSession(storageSession)
        setUser(storageUser)
        await fetchUserWithLevel(storageUser.id)
        setLoading(false)
        setShowOffline(false)
        console.log('✅ useAuth: Sessão restaurada do localStorage', storageSession)
      } else {
        setSession(null)
        setUser(null)
        setUserWithLevel(null)
        setLoading(false)
        setShowOffline(!window.navigator.onLine)
        console.log('⚠️ useAuth: Sem sessão, redirecionando login')
      }
    } catch (error) {
      setSession(null)
      setUser(null)
      setUserWithLevel(null)
      setLoading(false)
      setShowOffline(!window.navigator.onLine)
      console.error('🔴 useAuth: Erro inesperado ao restaurar sessão:', error)
    }
  }, [fetchUserWithLevel])

  // Handler para eventos do Supabase
  const handleAuthChange = useCallback(async (event: string, newSession: Session | null) => {
    console.log('🔁 useAuth: Evento onAuthStateChange:', event, newSession)
    if (newSession && newSession.user) {
      const simpleUser: SimpleUser = {
        id: newSession.user.id,
        email: newSession.user.email!,
        created_at: newSession.user.created_at
      }
      setSession(newSession)
      setUser(simpleUser)
      saveSessionToStorage(newSession, simpleUser)
      await fetchUserWithLevel(newSession.user.id)
      setLoading(false)
      setShowOffline(false)
      console.log('✅ useAuth: Sessão atualizada pelo evento:', newSession)
    } else {
      // Se for SIGNED_OUT ou USER_DELETED, limpa tudo
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null)
        setUser(null)
        setUserWithLevel(null)
        saveSessionToStorage(null, null)
        setLoading(false)
        setShowOffline(false)
        console.log('🔴 useAuth: Usuário saiu/deletado, limpando tudo')
      } else {
        // Se for outro evento, tenta restaurar do storage antes de limpar
        const { session: storageSession, user: storageUser } = loadSessionFromStorage()
        if (storageSession && storageUser) {
          setSession(storageSession)
          setUser(storageUser)
          await fetchUserWithLevel(storageUser.id)
          setLoading(false)
          setShowOffline(false)
          console.log('✅ useAuth: Restaurando sessão do storage...')
        } else {
          setSession(null)
          setUser(null)
          setUserWithLevel(null)
          saveSessionToStorage(null, null)
          setLoading(false)
          setShowOffline(!window.navigator.onLine)
          console.log('⚠️ useAuth: Sem sessão, redirecionando login')
        }
      }
    }
  }, [fetchUserWithLevel])

  // Sempre tenta restaurar sessão ao abrir/voltar para o app
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    restoreSession('Inicial')
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
      restoreSession('Foco')
    }
    window.addEventListener('focus', handleFocus)
    // Listener para online/offline
    const handleOnline = () => {
      setIsOnline(true)
      setShowOffline(false)
      console.log('🟢 useAuth: Conexão restabelecida, tentando restaurar sessão...')
      restoreSession('Online')
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
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (focusTimeout) clearTimeout(focusTimeout)
    }
  }, [restoreSession, handleAuthChange])

  // Métodos de autenticação
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
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
        saveSessionToStorage(data.session, simpleUser)
        await fetchUserWithLevel(data.user.id)
        setLoading(false)
        setShowOffline(false)
        console.log('✅ useAuth: Login bem-sucedido:', data.session)
      } else {
        setLoading(false)
        setShowOffline(!window.navigator.onLine)
        console.error('🔴 useAuth: Erro no login:', error)
      }
      return { data, error }
    } catch (error) {
      setLoading(false)
      setShowOffline(!window.navigator.onLine)
      console.error('🔴 useAuth: Erro inesperado no login:', error)
      return { data: null, error }
    }
  }, [fetchUserWithLevel])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      setShowOffline(!window.navigator.onLine)
      return { data, error }
    } catch (error) {
      setLoading(false)
      setShowOffline(!window.navigator.onLine)
      return { data: null, error }
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setUserWithLevel(null)
      saveSessionToStorage(null, null)
      setLoading(false)
      setShowOffline(false)
      navigate('/login')
      return { error }
    } catch (error) {
      setLoading(false)
      setShowOffline(!window.navigator.onLine)
      return { error }
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
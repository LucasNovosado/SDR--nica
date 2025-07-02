import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Mail, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Rocket, 
  Zap,
  Loader2
} from 'lucide-react'
import './LoginPage.css'

// Adiciona declaração global para window.deferredPrompt
// @ts-ignore
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [showAuthLoading, setShowAuthLoading] = useState(false)

  // Ref para controlar logs excessivos
  const renderCount = useRef(0)
  renderCount.current += 1

  const { signIn, signOut, user, loading, session } = useAuth()
  const navigate = useNavigate()

  // Log controlado - apenas quando há mudanças importantes
  useEffect(() => {
    if (renderCount.current <= 3) { // Log apenas nos primeiros renders
      console.log(`🎨 LoginPage - Render #${renderCount.current}:`, {
        user: user ? `${user.email}` : 'null',
        loading,
        session: !!session,
        loginLoading
      })
    }
  }, [user, loading, session, loginLoading])

  // Ao detectar usuário logado, exibir loading obrigatório antes do menu
  useEffect(() => {
    if (user && session) {
      setShowAuthLoading(true)
      const timer = setTimeout(() => {
        navigate('/menu')
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      setShowAuthLoading(false)
    }
  }, [user, session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setMessage('')

    console.log('=== 🔐 INICIANDO LOGIN ===')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setMessage('Erro no login: ' + error.message)
        setMessageType('error')
      } else {
        setMessage('Login realizado com sucesso!')
        setMessageType('success')
        
        // Aguardar antes de redirecionar
        setTimeout(() => {
          console.log('🚀 Redirecionando para /menu...')
          navigate('/menu')
        }, 1500)
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
      setMessageType('error')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    console.log('=== 🚪 FAZENDO LOGOUT ===')
    const { error } = await signOut()
    if (error) {
      console.error('❌ Erro no logout:', error)
    }
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="floating-elements">
            <div className="floating-element blue"></div>
            <div className="floating-element yellow"></div>
            <div className="floating-element blue small"></div>
            <div className="floating-element yellow small"></div>
          </div>
        </div>

        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="logo">
                <div className="logo-icon">
                  <Loader2 size={48} className="animate-spin" />
                </div>
                <h1 className="logo-text">
                  <span className="text-gradient-blue">Única</span>
                  <span className="text-gradient-yellow">PRO</span>
                </h1>
              </div>
              <p className="login-subtitle">
                Inicializando sistema...
              </p>
            </div>
            
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: '#f8fafc', 
              borderRadius: '0.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              <strong>Aguarde...</strong><br />
              Verificando sua autenticação<br />
              <small>Se demorar muito, recarregue a página</small>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading obrigatório após login
  if (showAuthLoading) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="floating-elements">
            <div className="floating-element blue"></div>
            <div className="floating-element yellow"></div>
            <div className="floating-element blue small"></div>
            <div className="floating-element yellow small"></div>
          </div>
        </div>
        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="logo">
                <div className="logo-icon">
                  <Loader2 size={48} className="animate-spin" />
                </div>
                <h1 className="logo-text">
                  <span className="text-gradient-blue">Única</span>
                  <span className="text-gradient-yellow">PRO</span>
                </h1>
              </div>
              <p className="login-subtitle">
                Carregando menu...
              </p>
            </div>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              <strong>Aguarde...</strong><br />
              Redirecionando para o menu principal
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Formulário de login
  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-elements">
          <div className="floating-element blue"></div>
          <div className="floating-element yellow"></div>
          <div className="floating-element blue small"></div>
          <div className="floating-element yellow small"></div>
        </div>
      </div>

      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">
                <Zap size={48} />
              </div>
              <h1 className="logo-text">
                <span className="text-gradient-blue">Única</span>
                <span className="text-gradient-yellow">PRO</span>
              </h1>
            </div>
            <p className="login-subtitle">
              Faça login para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="seu@email.com"
                required
                disabled={loginLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loginLoading}
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {messageType === 'success' ? (
                  <CheckCircle size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Rocket size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>          
        </div>
        ÚnicaPRO 1.0.6

      </div>
      {/* Banner fixo de instalação do PWA */}
      <div className="pwa-banner">
        <div className="pwa-banner-content">
          {/* Ícone Lucide de celular/tela inicial */}
          <span className="pwa-banner-icon">
            {/* Lucide: Smartphone */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
          </span>
          <span className="pwa-banner-text">
            Instale o ÚnicaPRO para uma experiência ainda melhor!
          </span>
          <button
            className="pwa-banner-btn"
            onClick={async () => {
              // Tenta disparar o prompt nativo de instalação do PWA
              if (window.deferredPrompt && typeof window.deferredPrompt.prompt === 'function') {
                window.deferredPrompt.prompt();
                // Opcional: aguarda escolha do usuário
                window.deferredPrompt.userChoice?.then((choiceResult) => {
                  console.log('PWA install choice:', choiceResult.outcome);
                });
              } else {
                // Fallback: alerta ou log
                alert('Para instalar, utilize a opção "Adicionar à tela inicial" do seu navegador.');
              }
            }}
            type="button"
          >
            {/* Lucide: PlusSquare */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-square" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            Adicionar na tela inicial
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
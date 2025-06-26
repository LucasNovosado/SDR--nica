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

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

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

  // Usuário logado
  if (user && session) {
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
                  <CheckCircle size={48} style={{ color: '#10b981' }} />
                </div>
                <h1 className="logo-text">
                  <span className="text-gradient-blue">Única</span>
                  <span className="text-gradient-yellow">PRO</span>
                </h1>
              </div>
              <p className="login-subtitle">
                Acesso autorizado!
              </p>
            </div>

            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                Bem-vindo, {user.email}!
              </h3>
              
              <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
                <strong>Usuário ID:</strong> {user.id.slice(0, 8)}...<br />
                <strong>Último acesso:</strong> {new Date().toLocaleString('pt-BR')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => navigate('/menu')}
                  className="submit-button"
                >
                  <Rocket size={20} />
                  Acessar Menu
                </button>

                <button
                  onClick={handleLogout}
                  className="submit-button"
                  style={{ 
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)'
                  }}
                >
                  <XCircle size={20} />
                  Sair da Conta
                </button>
              </div>
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

          {/* Informações de debug minimizadas */}
          {renderCount.current <= 5 && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.5rem', 
              background: '#f1f5f9', 
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              color: '#64748b',
              textAlign: 'center'
            }}>
              Render #{renderCount.current} | 
              Estado: {loading ? 'carregando' : user ? 'logado' : 'aguardando'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
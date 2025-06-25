import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import './LoginPage.css'

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          setMessage('Login realizado com sucesso!')
          setMessageType('success')
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setMessage(error.message)
          setMessageType('error')
        } else {
          setMessage('Conta criada! Verifique seu email para confirmar.')
          setMessageType('success')
        }
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

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
              <div className="logo-icon">⚡</div>
              <h1 className="logo-text">
                <span className="text-gradient-blue">Game</span>
                <span className="text-gradient-yellow">Hub</span>
              </h1>
            </div>
            <p className="login-subtitle">
              {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Senha
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
              />
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {messageType === 'success' ? '✅' : '❌'} {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  {isLogin ? '🚀 Entrar' : '✨ Criar Conta'}
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="switch-text">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              type="button"
              className="switch-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Criar Conta' : 'Fazer Login'}
            </button>
          </div>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Interface Gamificada</h3>
            <p>Experiência única e envolvente</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Super Rápido</h3>
            <p>Carregamento instantâneo</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>100% Seguro</h3>
            <p>Seus dados protegidos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
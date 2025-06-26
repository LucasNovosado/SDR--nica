import React, { useState } from 'react'
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setMessage(error.message)
        setMessageType('error')
      } else {
        setMessage('Login realizado com sucesso!')
        setMessageType('success')
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
              <div className="logo-icon">
                <Zap size={48} />
              </div>
              <h1 className="logo-text">
                <span className="text-gradient-blue">Única</span>
                <span className="text-gradient-yellow">SDR</span>
              </h1>
            </div>
            <p className="login-subtitle">
              Entre na sua conta
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
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Rocket size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
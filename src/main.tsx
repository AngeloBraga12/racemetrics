import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { AuthScreen } from './auth/AuthScreen'
import './styles.css'

function ProtectedApp() {
  const { loading, user } = useAuth()

  if (loading) {
    return <main className="auth-shell"><section className="auth-loading">Restoring secure session…</section></main>
  }

  return user ? <App /> : <AuthScreen />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  </StrictMode>,
)

import { useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from './AuthProvider'

type Mode = 'login' | 'signup' | 'recovery' | 'reset'

const copy = {
  login: { title: 'Acompanhe sua temporada.', action: 'Entrar no RaceMetrics', switch: 'Criar uma conta', next: 'signup' as Mode },
  signup: { title: 'Seu cockpit de dados.', action: 'Criar conta', switch: 'Já tenho uma conta', next: 'login' as Mode },
  recovery: { title: 'Recupere o acesso.', action: 'Enviar instruções', switch: 'Voltar para entrar', next: 'login' as Mode },
  reset: { title: 'Defina uma nova senha.', action: 'Atualizar senha', switch: 'Voltar para entrar', next: 'login' as Mode },
}

export function AuthScreen() {
  const auth = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const current = copy[mode]

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setSuccess(false)

    let error: string | null = null
    if (mode === 'login') error = await auth.signIn(email, password)
    if (mode === 'signup') error = await auth.signUp(email, password, name)
    if (mode === 'recovery') error = await auth.requestPasswordReset(email)
    if (mode === 'reset') error = await auth.updatePassword(password)

    setBusy(false)
    if (error) setMessage(error)
    else {
      setSuccess(true)
      if (mode === 'signup') setMessage('Conta criada. Verifique seu e-mail antes de entrar.')
      if (mode === 'recovery') setMessage('Se houver uma conta associada, as instruções foram enviadas.')
      if (mode === 'reset') setMessage('Senha atualizada. Sua sessão está protegida.')
    }
  }

  if (!auth.configured) {
    return (
      <main className="auth-shell">
        <section className="auth-card setup-card">
          <div className="auth-brand"><span className="brand-mark">RM</span><strong>RaceMetrics</strong></div>
          <p className="eyebrow">AUTHENTICATION / SETUP REQUIRED</p>
          <h1>O cockpit está pronto.<br /><span>A ignição ainda não.</span></h1>
          <p className="auth-copy">Configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> no ambiente local ou de deploy. Nenhuma chave secreta deve entrar no navegador.</p>
          <div className="security-note"><ShieldCheck size={18} /><span>O frontend não contém credenciais administrativas.</span></div>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">RM</span><strong>RaceMetrics</strong></div>
        <div className="auth-heading">
          <p className="eyebrow">PRIVATE MOTORSPORT WORKSPACE</p>
          <h1>{current.title}</h1>
          <p>Uma conta por pessoa. Seus favoritos, comparações e preferências ficam isolados da conta de qualquer outro usuário.</p>
        </div>

        <div className="provider-grid">
          {mode !== 'reset' && (
            <>
              <button className="provider-button" disabled={busy} onClick={() => auth.signInWithProvider('google')}>G <span>Google</span></button>
              <button className="provider-button" disabled={busy} onClick={() => auth.signInWithProvider('azure')}>M <span>Microsoft</span></button>
            </>
          )}
        </div>

        {mode !== 'reset' && <div className="auth-divider"><span>ou continue com e-mail</span></div>}

        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>}
          {mode !== 'reset' && <label>E-mail<div className="input-wrap"><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div></label>}
          {mode !== 'recovery' && <label>Senha<div className="input-wrap"><LockKeyhole size={16} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required /></div></label>}
          {mode === 'signup' && <small className="form-hint">Use uma senha forte com pelo menos 8 caracteres. O requisito final também depende da política configurada no provedor.</small>}

          {mode === 'login' && <button type="button" className="text-button" onClick={() => { setMode('recovery'); setMessage(''); setSuccess(false) }}>Esqueci minha senha</button>}

          <button className="primary-button auth-submit" disabled={busy} type="submit">
            {busy ? 'Processando…' : current.action}<ArrowRight size={16} />
          </button>
        </form>

        {(message || success) && <div className={success ? 'auth-message success' : 'auth-message error'}><CheckCircle2 size={16} />{message}</div>}

        <button className="auth-switch" onClick={() => { setMode(current.next); setMessage(''); setSuccess(false) }}>{current.switch}</button>
        <p className="auth-footnote">Sessões e dados privados são validados pelo serviço de autenticação e pelas políticas do banco. A interface nunca é a barreira de segurança.</p>
      </section>
    </main>
  )
}

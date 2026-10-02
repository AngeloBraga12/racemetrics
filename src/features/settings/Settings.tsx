import { useEffect, useState } from 'react'
import { Check, CircleUserRound, Monitor, Moon, Save, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'
import { getPreferences, getProfile, updatePreferences, updateProfile } from '../../lib/userData'
import './settings.css'

type Theme = 'dark' | 'light' | 'system'
type Density = 'compact' | 'comfortable'

export function Settings() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')
  const [density, setDensity] = useState<Density>('comfortable')
  const [favoriteSeries, setFavoriteSeries] = useState('f1')
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getProfile(user.id), getPreferences(user.id)]).then(([profile, preferences]) => {
      if (!active) return
      setDisplayName(profile?.display_name ?? user.user_metadata?.display_name ?? '')
      setAvatarUrl(profile?.avatar_url ?? '')
      setTheme((preferences?.theme as Theme) ?? 'dark')
      setDensity((preferences?.density as Density) ?? 'comfortable')
      setFavoriteSeries(preferences?.favorite_series ?? 'f1')
      setLoading(false)
    }).catch(() => {
      if (active) {
        setStatus('Não foi possível carregar suas preferências privadas.')
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.density = density
    return () => {
      delete document.documentElement.dataset.theme
      delete document.documentElement.dataset.density
    }
  }, [theme, density])

  const save = async () => {
    if (!user) return
    setSaving(true)
    setStatus(null)
    try {
      await Promise.all([
        updateProfile(user.id, { display_name: displayName.trim() || null, avatar_url: avatarUrl.trim() || null }),
        updatePreferences(user.id, { theme, density, favorite_series: favoriteSeries }),
      ])
      setStatus('Preferências salvas com sucesso.')
    } catch {
      setStatus('Não foi possível salvar suas preferências.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="content settings-page"><section className="settings-state">Carregando workspace privado…</section></main>

  return <main className="content settings-page">
    <header className="settings-header">
      <div>
        <p className="eyebrow">ACCOUNT / PRIVATE WORKSPACE</p>
        <h1>Settings</h1>
        <p>Identidade, aparência e preferências do seu workspace. Estas configurações pertencem somente à sua conta.</p>
      </div>
      <span className="private-badge"><CircleUserRound size={15} /> PRIVATE</span>
    </header>

    <section className="settings-grid">
      <article className="panel settings-panel">
        <div className="panel-heading"><div><p className="eyebrow">PROFILE</p><h2>Identity</h2></div><CircleUserRound size={18} /></div>
        <div className="settings-form">
          <label>Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} /></label>
          <label>Avatar URL<input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} maxLength={500} placeholder="https://…" /></label>
          <div className="account-meta"><span>Authenticated account</span><strong>{user?.email ?? '—'}</strong></div>
        </div>
      </article>

      <article className="panel settings-panel">
        <div className="panel-heading"><div><p className="eyebrow">INTERFACE</p><h2>Appearance</h2></div><SlidersHorizontal size={18} /></div>
        <div className="option-group">
          <span className="option-label">Theme</span>
          <div className="option-grid">
            {([['dark', 'Dark', Moon], ['light', 'Light', Monitor], ['system', 'System', Monitor]] as const).map(([value, label, Icon]) =>
              <button key={value} className={theme === value ? 'option active' : 'option'} onClick={() => setTheme(value)}><Icon size={15} /><span>{label}</span>{theme === value && <Check size={14} />}</button>
            )}
          </div>
        </div>
        <div className="option-group">
          <span className="option-label">Density</span>
          <div className="option-grid two">
            {([['comfortable', 'Comfortable'], ['compact', 'Compact']] as const).map(([value, label]) =>
              <button key={value} className={density === value ? 'option active' : 'option'} onClick={() => setDensity(value)}><span>{label}</span>{density === value && <Check size={14} />}</button>
            )}
          </div>
        </div>
      </article>

      <article className="panel settings-panel">
        <div className="panel-heading"><div><p className="eyebrow">DATA PREFERENCE</p><h2>Motorsport</h2></div><Monitor size={18} /></div>
        <div className="settings-form">
          <label>Favorite series<select value={favoriteSeries} onChange={(e) => setFavoriteSeries(e.target.value)}><option value="f1">Formula 1</option></select></label>
          <p className="settings-note">The current ingestion pipeline is focused on Formula 1. Additional series remain disabled until their data contracts exist.</p>
        </div>
      </article>
    </section>

    <footer className="settings-footer">
      {status && <span className={status.includes('sucesso') ? 'save-status success' : 'save-status'}>{status}</span>}
      <button className="primary-button" disabled={saving} onClick={() => void save()}><Save size={16} />{saving ? 'Saving…' : 'Save preferences'}</button>
    </footer>
  </main>
}

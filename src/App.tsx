import { useState } from 'react'
import { Activity, BarChart3, ChevronRight, CircleUserRound, Flag, Gauge, LogOut, Search, ShieldCheck, Trophy, Users } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { Explore } from './features/explore/Explore'
import { Analytics } from './features/analytics/Analytics'
import { previewCatalog } from './data/catalog'

const stats = [
  { label: 'Season', value: '2026', detail: 'Preview workspace', icon: Trophy },
  { label: 'Rounds', value: '03', detail: 'Preview catalog', icon: Flag },
  { label: 'Drivers', value: String(previewCatalog.drivers.length).padStart(2, '0'), detail: 'Catalog records', icon: Users },
  { label: 'Circuits', value: String(previewCatalog.circuits.length).padStart(2, '0'), detail: 'Catalog records', icon: Gauge },
]

function Dashboard() {
  return <main id="dashboard" className="content">
    <section className="hero"><div className="hero-copy-block"><p className="eyebrow">RACEMETRICS / SEASON 2026</p><h1>Read the race.<br /><span>Not just the result.</span></h1><p className="hero-copy">A private workspace for comparing drivers, tracing performance and finding the numbers behind every finish.</p><div className="hero-actions"><a className="primary-button" href="#explore">Explore catalog <ChevronRight size={17} /></a><a className="secondary-button" href="#analytics">Open analytics</a></div></div>
      <div className="race-board" aria-label="Race control preview"><div className="race-board-header"><div><span className="board-kicker">RACE CONTROL</span><strong>DATA PIPELINE PREVIEW</strong></div><span className="preview-badge">PREVIEW DATA</span></div><div className="race-meta"><span>ROUND -- / 24</span><span>SESSION --</span><span>-- LAPS</span></div><div className="track-field"><div className="track-grid" /><div className="track-line" /><span className="track-label label-a">S1</span><span className="track-label label-b">S2</span><span className="track-label label-c">S3</span></div><div className="sector-strip">{['S1', 'S2', 'S3'].map((sector) => <div key={sector}><span>{sector}</span><strong>—</strong><small>awaiting verified data</small></div>)}</div></div>
    </section>
    <section className="stat-grid" aria-label="Resumo do catálogo">{stats.map(({ label, value, detail, icon: Icon }) => <article className="stat-card" key={label}><Icon size={18} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</section>
    <section className="dashboard-grid"><article className="panel ranking-panel"><div className="panel-heading"><div><p className="eyebrow">CATALOG STRUCTURE</p><h2>Classification</h2></div><a href="#explore">Open catalog <ChevronRight size={15} /></a></div><div className="table-head"><span>#</span><span>Driver</span><span>Team</span><span>PTS</span></div>{previewCatalog.drivers.slice(0, 3).map((driver, index) => { const team = previewCatalog.teams.find((item) => item.id === driver.teamId); return <div className="driver-row" key={driver.id}><strong className="position-number">{String(index + 1).padStart(2, '0')}</strong><div className="driver-name"><span className="driver-avatar">{driver.number ?? '-'}</span><span>{driver.fullName}</span></div><span className="muted">{team?.name ?? '-'}</span><div className="points-cell"><strong>—</strong><small>not scored</small></div></div> })}</article><article className="panel insight-panel"><div className="panel-heading"><div><p className="eyebrow">PERFORMANCE SIGNAL</p><h2>Race Insights</h2></div><Activity size={19} /></div><div className="insight-body"><div className="signal-mark"><BarChart3 size={22} /><span>ANALYSIS ENGINE</span></div><h3>Nothing invented.<br />Nothing hidden.</h3><p>Insights will only appear after validated race data is available. Preview records are structural fixtures, not official results.</p><div className="insight-rule"><ShieldCheck size={15} /><span>Provenance will be attached to every metric.</span></div></div></article></section>
  </main>
}

function App() {
  const { user, signOut } = useAuth()
  const [view, setView] = useState<'dashboard' | 'explore' | 'analytics'>('dashboard')
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Account'
  const navigate = (next: 'dashboard' | 'explore' | 'analytics') => { setView(next); window.location.hash = next }
  const currentView = view === 'dashboard' ? <Dashboard /> : view === 'explore' ? <Explore /> : <Analytics />
  return <div className="app-shell"><header className="topbar"><button className="brand brand-button" onClick={() => navigate('dashboard')} aria-label="RaceMetrics início"><span className="brand-mark">RM</span><span>RaceMetrics</span></button><nav className="nav" aria-label="Navegação principal"><button className={view === 'dashboard' ? 'active' : ''} onClick={() => navigate('dashboard')}>Dashboard</button><button className={view === 'explore' ? 'active' : ''} onClick={() => navigate('explore')}>Explore</button><button onClick={() => { window.location.hash = 'compare' }}>Compare</button><button className={view === 'analytics' ? 'active' : ''} onClick={() => navigate('analytics')}>Analytics</button></nav><div className="topbar-actions"><button className="icon-button" aria-label="Pesquisar" onClick={() => navigate('explore')}><Search size={18} /></button><button className="profile-button" title={user?.email ?? 'Conta'}><CircleUserRound size={18} /><span>{displayName}</span></button><button className="icon-button" aria-label="Sair" onClick={() => void signOut()}><LogOut size={17} /></button></div></header>{currentView}</div>
}

export default App

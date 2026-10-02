import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, ChevronRight, CircleUserRound, Flag, Gauge, LogOut, Search, ShieldCheck, Trophy, Users } from 'lucide-react'
import { useAuth } from './auth/AuthProvider'
import { Explore } from './features/explore/Explore'
import { Analytics } from './features/analytics/Analytics'
import { Compare } from './features/compare/Compare'
import { Settings } from './features/settings/Settings'
import { EntityDetails } from './features/details/EntityDetails'
import { fetchVerifiedSeasonStandings } from './data/jolpicaRepository'
import { motorsportRepository } from './data/motorsportRepository'
import type { DriverStanding, MotorsportCatalog } from './types/domain'

type View = 'dashboard' | 'explore' | 'compare' | 'analytics' | 'settings'
const SEASON = 2026

function Dashboard() {
  const [data, setData] = useState<{ standings: DriverStanding[]; catalog: MotorsportCatalog } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([fetchVerifiedSeasonStandings(SEASON), motorsportRepository.getCatalog()])
      .then(([standings, catalog]) => active && setData({ standings: standings.driverStandings, catalog }))
      .catch(() => active && setError(true))
    return () => { active = false }
  }, [])

  const drivers = useMemo(() => {
    if (!data) return []
    const byId = new Map(data.catalog.drivers.map((driver) => [driver.id, driver]))
    return data.standings.slice().sort((a, b) => (a.position ?? 999) - (b.position ?? 999)).slice(0, 5).map((standing) => ({
      standing,
      driver: byId.get(standing.driverId),
      team: standing.teamIds[0] ? data.catalog.teams.find((team) => team.id === standing.teamIds[0]) : undefined,
    }))
  }, [data])

  if (error) return <main className="content dashboard-page"><section className="dashboard-state"><Flag size={20} /><h1>Dashboard indisponível</h1><p>Não foi possível validar os dados da temporada {SEASON}. O RaceMetrics não preenche esse painel com números inventados.</p></section></main>
  if (!data) return <main className="content dashboard-page"><section className="dashboard-state"><Activity size={18} /> Loading verified championship data...</section></main>

  const currentRound = data.standings[0]?.round ?? null

  return <main id="dashboard" className="content dashboard-page">
    <section className="hero"><div className="hero-copy-block"><p className="eyebrow">RACEMETRICS / SEASON {SEASON}</p><h1>Read the race.<br /><span>Not just the result.</span></h1><p className="hero-copy">A private workspace for comparing drivers, tracing performance and finding the numbers behind every finish. Every displayed championship metric carries a verified data status.</p><div className="hero-actions"><button className="primary-button" onClick={() => { window.location.hash = 'explore'; window.dispatchEvent(new HashChangeEvent('hashchange')) }}>Explore catalog <ChevronRight size={17} /></button><button className="secondary-button" onClick={() => { window.location.hash = 'analytics'; window.dispatchEvent(new HashChangeEvent('hashchange')) }}>Open analytics</button></div></div>
      <div className="race-board" aria-label="Race control"><div className="race-board-header"><div><span className="board-kicker">RACE CONTROL</span><strong>VERIFIED CHAMPIONSHIP SNAPSHOT</strong></div><span className="verified-badge">VERIFIED DATA</span></div><div className="race-meta"><span>ROUND {String(currentRound ?? 0).padStart(2, '0')} / {data.catalog.races.length || '—'}</span><span>SEASON {SEASON}</span><span>{data.catalog.circuits.length} CIRCUITS</span></div><div className="track-field"><div className="track-grid" /><div className="track-line" /><span className="track-label label-a">S1</span><span className="track-label label-b">S2</span><span className="track-label label-c">S3</span></div><div className="sector-strip">{[['S1','—','Sector telemetry not ingested'],['S2','—','Sector telemetry not ingested'],['S3','—','Sector telemetry not ingested']].map(([sector,value,label]) => <div key={sector}><span>{sector}</span><strong>{value}</strong><small>{label}</small></div>)}</div></div>
    </section>
    <section className="stat-grid" aria-label="Verified season summary">
      <article className="stat-card"><Trophy size={18} /><span>Season</span><strong>{SEASON}</strong><small>Verified season</small></article>
      <article className="stat-card"><Flag size={18} /><span>Rounds</span><strong>{String(currentRound ?? '—').padStart(2, '0')}</strong><small>Current standings round</small></article>
      <article className="stat-card"><Users size={18} /><span>Drivers</span><strong>{String(data.standings.length).padStart(2, '0')}</strong><small>Standing records</small></article>
      <article className="stat-card"><Gauge size={18} /><span>Circuits</span><strong>{String(data.catalog.circuits.length).padStart(2, '0')}</strong><small>Catalog records</small></article>
    </section>
    <section className="dashboard-grid"><article className="panel ranking-panel"><div className="panel-heading"><div><p className="eyebrow">CHAMPIONSHIP / VERIFIED</p><h2>Classification</h2></div><button className="panel-link" onClick={() => { window.location.hash = 'analytics'; window.dispatchEvent(new HashChangeEvent('hashchange')) }}>Open analytics <ChevronRight size={15} /></button></div><div className="table-head"><span>#</span><span>Driver</span><span>Team</span><span>PTS</span></div>{drivers.map(({standing,driver,team}) => <div className="driver-row" key={standing.driverId}><strong className="position-number">{String(standing.position ?? '—').padStart(2, '0')}</strong><div className="driver-name"><span className="driver-avatar">{driver?.number ?? '—'}</span><span>{driver?.fullName ?? standing.driverId}</span></div><span className="muted">{team?.name ?? standing.teamIds[0] ?? '—'}</span><div className="points-cell"><strong>{standing.points}</strong><small>{standing.wins} win{standing.wins === 1 ? '' : 's'}</small></div></div>)}</article><article className="panel insight-panel"><div className="panel-heading"><div><p className="eyebrow">PERFORMANCE SIGNAL</p><h2>Race Insights</h2></div><Activity size={19} /></div><div className="insight-body"><div className="signal-mark"><BarChart3 size={22} /><span>ANALYSIS ENGINE</span></div><h3>{drivers[0]?.driver?.fullName ?? 'Leader'} leads the current snapshot.</h3><p>{drivers[0]?.standing.points ?? '—'} points across the verified standings. Advanced telemetry remains separated from championship facts until its ingestion contract exists.</p><div className="insight-rule"><ShieldCheck size={15} /><span>Provenance attached to every displayed metric.</span></div></div></article></section>
  </main>
}

function App() {
  const { user, signOut } = useAuth()
  const [detailRoute, setDetailRoute] = useState<{ kind: import('./types/domain').EntityKind; id: string } | null>(() => { const parts = window.location.hash.replace('#','').split('/'); return parts[0] === 'detail' && parts[1] && parts[2] ? { kind: parts[1] as import('./types/domain').EntityKind, id: parts.slice(2).join('/') } : null })
  const [view, setView] = useState<View>(() => {
    const hash = window.location.hash.replace('#', '') as View
    return ['dashboard','explore','compare','analytics','settings'].includes(hash) ? hash : 'dashboard'
  })
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Account'
  const navigate = (next: View) => { setView(next); window.location.hash = next }
  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace('#', '')
      const parts = raw.split('/')
      if (parts[0] === 'detail' && parts[1] && parts[2]) { setDetailRoute({ kind: parts[1] as import('./types/domain').EntityKind, id: parts.slice(2).join('/') }); return }
      setDetailRoute(null)
      if (['dashboard','explore','compare','analytics','settings'].includes(raw)) setView(raw as View)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const currentView = detailRoute ? <EntityDetails kind={detailRoute.kind} id={detailRoute.id} onBack={() => navigate('explore')} /> : view === 'dashboard' ? <Dashboard /> : view === 'explore' ? <Explore /> : view === 'compare' ? <Compare /> : view === 'analytics' ? <Analytics /> : <Settings />
  return <div className="app-shell"><header className="topbar"><button className="brand brand-button" onClick={() => navigate('dashboard')} aria-label="RaceMetrics início"><span className="brand-mark">RM</span><span>RaceMetrics</span></button><nav className="nav" aria-label="Navegação principal">{(['dashboard','explore','compare','analytics'] as const).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => navigate(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav><div className="topbar-actions"><button className="icon-button" aria-label="Pesquisar" onClick={() => navigate('explore')}><Search size={18} /></button><button className={view === 'settings' ? 'profile-button active' : 'profile-button'} title={user?.email ?? 'Conta'} onClick={() => navigate('settings')}><CircleUserRound size={18} /><span>{displayName}</span></button><button className="icon-button" aria-label="Sair" onClick={() => void signOut()}><LogOut size={17} /></button></div></header><nav className="mobile-nav" aria-label="Navegação mobile">{(['dashboard','explore','compare','analytics','settings'] as const).map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => navigate(item)}>{item === 'dashboard' ? 'Home' : item[0].toUpperCase() + item.slice(1)}</button>)}</nav>{currentView}</div>
}

export default App

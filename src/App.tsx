import {
  Activity,
  BarChart3,
  ChevronRight,
  CircleUserRound,
  Flag,
  Gauge,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'

type Driver = {
  position: number
  name: string
  team: string
  points: number
  gap: string
  trend: 'up' | 'down' | 'steady'
}

const stats = [
  { label: 'Season', value: '2026', detail: 'Current workspace', icon: Trophy },
  { label: 'Rounds', value: '24', detail: 'Season calendar', icon: Flag },
  { label: 'Drivers', value: '20', detail: 'Classified entries', icon: Users },
  { label: 'Circuits', value: '24', detail: 'Tracked venues', icon: Gauge },
]

const drivers: Driver[] = [
  { position: 1, name: 'Driver One', team: 'Team Alpha', points: 0, gap: '—', trend: 'steady' },
  { position: 2, name: 'Driver Two', team: 'Team Beta', points: 0, gap: '—', trend: 'up' },
  { position: 3, name: 'Driver Three', team: 'Team Gamma', points: 0, gap: '—', trend: 'down' },
]

const sectors = [
  { label: 'S1', value: '—', state: 'pending' },
  { label: 'S2', value: '—', state: 'pending' },
  { label: 'S3', value: '—', state: 'pending' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="RaceMetrics início">
          <span className="brand-mark">RM</span>
          <span>RaceMetrics</span>
        </a>

        <nav className="nav" aria-label="Navegação principal">
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#explore">Explore</a>
          <a href="#compare">Compare</a>
          <a href="#analytics">Analytics</a>
        </nav>

        <div className="topbar-actions">
          <button className="icon-button" aria-label="Pesquisar"><Search size={18} /></button>
          <button className="profile-button"><CircleUserRound size={18} /> Entrar</button>
        </div>
      </header>

      <main id="dashboard" className="content">
        <section className="hero">
          <div className="hero-copy-block">
            <p className="eyebrow">RACEMETRICS / SEASON 2026</p>
            <h1>Read the race.<br /><span>Not just the result.</span></h1>
            <p className="hero-copy">A private workspace for comparing drivers, tracing performance and finding the numbers behind every finish.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#explore">Explore season <ChevronRight size={17} /></a>
              <a className="secondary-button" href="#compare">Compare drivers</a>
            </div>
          </div>

          <div className="race-board" aria-label="Race control preview">
            <div className="race-board-header">
              <div><span className="board-kicker">RACE CONTROL</span><strong>INTERFACE PREVIEW</strong></div>
              <span className="preview-badge">MOCK DATA</span>
            </div>
            <div className="race-meta"><span>ROUND 00 / 24</span><span>QUALIFYING</span><span>— LAPS</span></div>
            <div className="track-field">
              <div className="track-grid" />
              <div className="track-line" />
              <span className="track-label label-a">S1</span>
              <span className="track-label label-b">S2</span>
              <span className="track-label label-c">S3</span>
            </div>
            <div className="sector-strip">
              {sectors.map((sector) => (
                <div key={sector.label}><span>{sector.label}</span><strong>{sector.value}</strong><small>{sector.state}</small></div>
              ))}
            </div>
          </div>
        </section>

        <section className="stat-grid" aria-label="Resumo da temporada">
          {stats.map(({ label, value, detail, icon: Icon }) => (
            <article className="stat-card" key={label}>
              <Icon size={18} />
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel ranking-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">CHAMPIONSHIP ORDER</p><h2>Classification</h2></div>
              <a href="#explore">Full table <ChevronRight size={15} /></a>
            </div>
            <div className="table-head"><span>#</span><span>Driver</span><span>Team</span><span>PTS</span></div>
            {drivers.map((driver) => (
              <div className="driver-row" key={driver.position}>
                <strong className="position-number">{String(driver.position).padStart(2, '0')}</strong>
                <div className="driver-name"><span className="driver-avatar">{driver.position}</span><span>{driver.name}</span></div>
                <span className="muted">{driver.team}</span>
                <div className="points-cell"><strong>{driver.points}</strong><small>{driver.gap}</small></div>
              </div>
            ))}
          </article>

          <article className="panel insight-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">PERFORMANCE SIGNAL</p><h2>Race Insights</h2></div>
              <Activity size={19} />
            </div>
            <div className="insight-body">
              <div className="signal-mark"><BarChart3 size={22} /><span>ANALYSIS ENGINE</span></div>
              <h3>Nothing invented.<br />Nothing hidden.</h3>
              <p>Insights will only appear after validated race data is available. The interface never fills analytical gaps with fabricated numbers.</p>
              <div className="insight-rule"><ShieldCheck size={15} /><span>Data provenance will be visible per metric.</span></div>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App

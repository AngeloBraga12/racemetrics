import { BarChart3, ChevronRight, CircleUserRound, Flag, Gauge, Search, ShieldCheck, Trophy, Users } from 'lucide-react'

const stats = [
  { label: 'Temporada', value: '2026', icon: Trophy },
  { label: 'Corridas', value: '24', icon: Flag },
  { label: 'Pilotos', value: '20', icon: Users },
  { label: 'Circuitos', value: '24', icon: Gauge },
]

const drivers = [
  { position: 1, name: 'Driver One', team: 'Team Alpha', points: 0 },
  { position: 2, name: 'Driver Two', team: 'Team Beta', points: 0 },
  { position: 3, name: 'Driver Three', team: 'Team Gamma', points: 0 },
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
          <div>
            <p className="eyebrow">MOTORSPORT DATA PLATFORM</p>
            <h1>Entenda a corrida<br /><span>pelos dados.</span></h1>
            <p className="hero-copy">Explore temporadas, compare pilotos e transforme resultados em análises claras.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#explore">Explorar temporada <ChevronRight size={17} /></a>
              <a className="secondary-button" href="#compare">Comparar pilotos</a>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-top"><span>SEASON OVERVIEW</span><span className="status-dot">LIVE DATA READY</span></div>
            <div className="hero-chart">
              <div className="chart-line line-one" />
              <div className="chart-line line-two" />
              <div className="chart-point p1" /><div className="chart-point p2" /><div className="chart-point p3" /><div className="chart-point p4" />
            </div>
            <div className="hero-panel-footer"><span>Performance trend</span><strong>2026</strong></div>
          </div>
        </section>

        <section className="stat-grid" aria-label="Resumo da temporada">
          {stats.map(({ label, value, icon: Icon }) => (
            <article className="stat-card" key={label}>
              <Icon size={19} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel ranking-panel">
            <div className="panel-heading"><div><p className="eyebrow">CHAMPIONSHIP</p><h2>Classificação</h2></div><a href="#explore">Ver completa <ChevronRight size={15} /></a></div>
            <div className="table-head"><span>#</span><span>Piloto</span><span>Equipe</span><span>PTS</span></div>
            {drivers.map((driver) => (
              <div className="driver-row" key={driver.position}>
                <strong>{String(driver.position).padStart(2, '0')}</strong>
                <div className="driver-name"><span className="driver-avatar">{driver.position}</span><span>{driver.name}</span></div>
                <span className="muted">{driver.team}</span>
                <strong>{driver.points}</strong>
              </div>
            ))}
          </article>

          <article className="panel insight-panel">
            <div className="panel-heading"><div><p className="eyebrow">RACEMETRICS</p><h2>Insights</h2></div><BarChart3 size={20} /></div>
            <div className="empty-insight"><ShieldCheck size={28} /><h3>Dados preparados para análise</h3><p>Os insights serão calculados a partir dos resultados oficiais da temporada e das métricas do RaceMetrics.</p></div>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App

import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, BarChart3, Flag, Trophy } from 'lucide-react'
import { fetchVerifiedSeasonStandings } from '../../data/jolpicaRepository'
import { motorsportRepository } from '../../data/motorsportRepository'
import type { ConstructorStanding, DriverStanding } from '../../types/domain'
import './analytics.css'

const SEASON = 2026

type AnalyticsState = { drivers: DriverStanding[]; teams: ConstructorStanding[]; round: number | null }

export function Analytics() {
  const [data, setData] = useState<AnalyticsState | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void fetchVerifiedSeasonStandings(SEASON)
      .then((result) => active && setData({ drivers: result.driverStandings, teams: result.constructorStandings, round: result.round }))
      .catch(() => active && setError(true))
    return () => { active = false }
  }, [])

  const [teamNames, setTeamNames] = useState<Record<string, string>>({})
  const [driverNames, setDriverNames] = useState<Record<string, string>>({})
  useEffect(() => {
    void motorsportRepository.getCatalog().then((catalog) => {
      setTeamNames(Object.fromEntries(catalog.teams.map((team) => [team.id, team.name])))
      setDriverNames(Object.fromEntries(catalog.drivers.map((driver) => [driver.id, driver.fullName])))
    }).catch(() => undefined)
  }, [])

  const topDrivers = useMemo(() => data?.drivers.slice().sort((a, b) => b.points - a.points).slice(0, 10) ?? [], [data])
  const leader = topDrivers[0]
  const leaderTeam = leader?.teamIds[0] ? teamNames[leader.teamIds[0]] : undefined

  if (error) return <main className="content analytics-page"><section className="analytics-empty"><AlertTriangle size={20} /><h1>Analytics indisponível</h1><p>Não foi possível validar os standings da temporada. Nenhum número de fallback é apresentado.</p></section></main>
  if (!data) return <main className="content analytics-page"><section className="analytics-loading"><Activity size={18} /> Loading verified championship data...</section></main>

  return <main className="content analytics-page">
    <header className="analytics-header"><div><p className="eyebrow">ANALYTICS / VERIFIED SOURCE</p><h1>Championship signal</h1><p>Temporada {SEASON}. Dados oficiais disponíveis no provedor verificado, sem preencher lacunas com valores inventados.</p></div><span className="verified-pill">VERIFIED · ROUND {data.round ?? '—'}</span></header>
    <section className="analytics-kpis">
      <article><Trophy size={17} /><span>Leader</span><strong>{leader ? driverNames[leader.driverId] ?? leader.driverId : '—'}</strong><small>{leader ? `${leader.points} pts · ${leader.wins} win${leader.wins === 1 ? '' : 's'}` : '—'}</small></article>
      <article><Flag size={17} /><span>Rounds covered</span><strong>{data.round ?? '—'}</strong><small>Standings snapshot</small></article>
      <article><BarChart3 size={17} /><span>Constructors</span><strong>{data.teams.length}</strong><small>Verified standings</small></article>
    </section>
    <section className="analytics-grid">
      <article className="panel analytics-table-panel"><div className="panel-heading"><div><p className="eyebrow">DRIVER STANDINGS</p><h2>Championship order</h2></div><span className="data-source">JOLPICA F1</span></div><div className="analytics-table-head"><span>#</span><span>Driver</span><span>Team</span><span>PTS</span><span>W</span></div>{topDrivers.map((item) => <div className="analytics-row" key={item.driverId}><strong>{item.position ?? '—'}</strong><span>{driverNames[item.driverId] ?? item.driverId}</span><span>{item.teamIds[0] ? teamNames[item.teamIds[0]] ?? item.teamIds[0] : '—'}</span><strong>{item.points}</strong><span>{item.wins}</span></div>)}</article>
      <article className="panel analytics-signal-panel"><p className="eyebrow">READING THE DATA</p><h2>{leader ? driverNames[leader.driverId] ?? leader.driverId : 'Leader'}</h2><p className="signal-value">{leader?.points ?? '—'}<small> points</small></p><div className="signal-bar"><span style={{ width: `${Math.min(100, ((leader?.points ?? 0) / Math.max(1, topDrivers[0]?.points ?? 1)) * 100)}%` }} /></div><dl><div><dt>Team</dt><dd>{leaderTeam ?? '—'}</dd></div><div><dt>Wins</dt><dd>{leader?.wins ?? '—'}</dd></div><div><dt>Position</dt><dd>{leader?.position ?? '—'}</dd></div></dl><small className="provenance">Source status: verified. This panel intentionally exposes only fields supported by the current ingestion layer.</small></article>
    </section>
  </main>
}

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Flag, Gauge, ShieldCheck, Star, Trophy, Users } from 'lucide-react'
import { motorsportRepository } from '../../data/motorsportRepository'
import { useAuth } from '../../auth/AuthProvider'
import { addFavorite, listFavorites, removeFavorite } from '../../lib/userData'
import type { EntityKind, MotorsportCatalog, RaceResult } from '../../types/domain'

type Props = { kind: EntityKind; id: string; onBack: () => void }
type SeasonSnapshot = Awaited<ReturnType<typeof motorsportRepository.getSeasonData>>
type DetailEntity = { title: string; meta: string; status: 'verified' | 'preview'; teamName: string | null; circuitName: string | null; catalogCount: number | null }

type Metric = { label: string; value: string }

const average = (values: number[]) => values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : '—'
const position = (value: number | null) => value === null ? '—' : `P${value}`

export function EntityDetails({ kind, id, onBack }: Props) {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState<MotorsportCatalog | null>(null)
  const [seasonData, setSeasonData] = useState<SeasonSnapshot>(null)
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    let active = true
    void motorsportRepository.getCatalog().then((next) => { if (active) setCatalog(next) })
    void motorsportRepository.getSeasonData().then((next) => { if (active) setSeasonData(next) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!user) return
    void listFavorites(user.id)
      .then((items) => setFavorite(items.some((item) => item.entity_type === kind && item.entity_id === id)))
      .catch(() => undefined)
  }, [user, kind, id])

  const entity = useMemo<DetailEntity | null>(() => {
    if (!catalog) return null
    switch (kind) {
      case 'driver': {
        const driver = catalog.drivers.find((item) => item.id === id)
        if (!driver) return null
        return {
          title: driver.fullName,
          meta: [driver.nationality, driver.number ? `#${driver.number}` : 'No number'].filter(Boolean).join(' · '),
          status: driver.status,
          teamName: catalog.teams.find((team) => team.id === driver.teamId)?.name ?? null,
          circuitName: null,
          catalogCount: null,
        }
      }
      case 'team': {
        const team = catalog.teams.find((item) => item.id === id)
        if (!team) return null
        return {
          title: team.name,
          meta: [team.country, team.shortName].join(' · '),
          status: team.status,
          teamName: null,
          circuitName: null,
          catalogCount: catalog.drivers.filter((driver) => driver.teamId === team.id).length,
        }
      }
      case 'race': {
        const race = catalog.races.find((item) => item.id === id)
        if (!race) return null
        return {
          title: race.name,
          meta: [`Round ${String(race.round).padStart(2, '0')}`, race.date ?? 'Date unavailable'].join(' · '),
          status: race.status,
          teamName: null,
          circuitName: catalog.circuits.find((circuit) => circuit.id === race.circuitId)?.name ?? race.circuitId,
          catalogCount: null,
        }
      }
      case 'circuit': {
        const circuit = catalog.circuits.find((item) => item.id === id)
        if (!circuit) return null
        return {
          title: circuit.name,
          meta: [circuit.location, circuit.country, circuit.laps ? `${circuit.laps} laps` : 'Laps unavailable'].join(' · '),
          status: circuit.status,
          teamName: null,
          circuitName: null,
          catalogCount: catalog.races.filter((race) => race.circuitId === circuit.id).length,
        }
      }
    }
  }, [catalog, kind, id])

  const related = useMemo(() => {
    if (!catalog || !seasonData || !entity) return [] as RaceResult[]
    switch (kind) {
      case 'driver': return seasonData.results.filter((row) => row.driverId === id)
      case 'team': return seasonData.results.filter((row) => row.teamId === id)
      case 'race': return seasonData.results.filter((row) => row.raceId === id)
      case 'circuit': {
        const raceIds = new Set(catalog.races.filter((race) => race.circuitId === id).map((race) => race.id))
        return seasonData.results.filter((row) => raceIds.has(row.raceId))
      }
    }
  }, [catalog, seasonData, entity, kind, id])

  const metrics = useMemo<Metric[]>(() => {
    const finishes = related.map((row) => row.position).filter((value): value is number => value !== null)
    const grids = related.map((row) => row.grid).filter((value): value is number => value !== null)
    const wins = related.filter((row) => row.position === 1).length
    const podiums = related.filter((row) => row.position !== null && row.position <= 3).length
    const fastestLaps = related.filter((row) => row.fastestLapRank === 1).length
    const points = related.reduce((sum, row) => sum + row.points, 0)

    if (kind === 'race') {
      return [
        { label: 'Classified', value: String(related.filter((row) => row.position !== null).length) },
        { label: 'Winner', value: position(related.find((row) => row.position === 1)?.position ?? null) },
        { label: 'Pole starts', value: String(related.filter((row) => row.grid === 1).length) },
        { label: 'Fastest laps', value: String(fastestLaps) },
      ]
    }

    if (kind === 'circuit') {
      return [
        { label: 'Results', value: String(related.length) },
        { label: 'Race wins', value: String(wins) },
        { label: 'Podiums', value: String(podiums) },
        { label: 'Points scored', value: points.toFixed(1) },
      ]
    }

    return [
      { label: 'Points', value: points.toFixed(1) },
      { label: 'Wins', value: String(wins) },
      { label: 'Podiums', value: String(podiums) },
      { label: 'Avg finish', value: average(finishes) },
      { label: 'Avg grid', value: average(grids) },
      { label: 'Fastest laps', value: String(fastestLaps) },
    ]
  }, [kind, related])

  const progression = useMemo(() => {
    const byRound = new Map<number, { points: number; wins: number }>()
    for (const row of related) {
      const current = byRound.get(row.round) ?? { points: 0, wins: 0 }
      current.points += row.points
      if (row.position === 1) current.wins += 1
      byRound.set(row.round, current)
    }
    let cumulativePoints = 0
    let cumulativeWins = 0
    return [...byRound.entries()].sort(([a], [b]) => a - b).map(([round, value]) => {
      cumulativePoints += value.points
      cumulativeWins += value.wins
      return { round, points: cumulativePoints, wins: cumulativeWins }
    })
  }, [related])

  const finalStanding = useMemo(() => {
    if (!seasonData) return null
    if (kind === 'driver') return seasonData.driverStandings.find((standing) => standing.driverId === id) ?? null
    if (kind === 'team') return seasonData.constructorStandings.find((standing) => standing.teamId === id) ?? null
    return null
  }, [seasonData, kind, id])

  const toggleFavorite = async () => {
    if (!user) return
    const next = !favorite
    setFavorite(next)
    try {
      if (next) await addFavorite(user.id, kind, id)
      else await removeFavorite(user.id, kind, id)
    } catch {
      setFavorite(!next)
    }
  }

  if (!catalog || !entity || !seasonData) {
    return <main className="content"><section className="dashboard-state"><p>Loading verified entity data...</p></section></main>
  }

  const status = entity.status === 'verified' ? 'VERIFIED DATA' : 'PREVIEW DATA'
  const detailRows = related.slice(0, kind === 'race' ? 20 : 12)
  const analytical = kind === 'driver' || kind === 'team'

  return (
    <main className="content entity-details-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to catalog</button>

      <section className="entity-hero">
        <div>
          <p className="eyebrow">{kind.toUpperCase()} / {status}</p>
          <h1>{entity.title}</h1>
          <p className="entity-meta">{entity.meta}</p>
        </div>
        <button className={favorite ? 'favorite-detail active' : 'favorite-detail'} onClick={() => void toggleFavorite()} aria-pressed={favorite}>
          <Star size={18} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save'}
        </button>
      </section>

      <section className="entity-stat-strip">
        {metrics.map((metric) => <div key={metric.label}><Trophy size={17} /><span>{metric.label}</span><strong>{metric.value}</strong></div>)}
      </section>

      <section className="entity-grid">
        <article className="panel entity-summary">
          <div className="panel-heading"><div><p className="eyebrow">ENTITY PROFILE</p><h2>Overview</h2></div><ShieldCheck size={18} /></div>
          <div className="entity-facts">
            <div><span>Status</span><strong>{status}</strong></div>
            <div><span>Season</span><strong>{catalog.season}</strong></div>
            {kind === 'driver' && <div><span>Team</span><strong>{entity.teamName ?? '—'}</strong></div>}
            {kind === 'team' && <div><span>Drivers in catalog</span><strong>{entity.catalogCount ?? 0}</strong></div>}
            {kind === 'race' && <div><span>Circuit</span><strong>{entity.circuitName ?? '—'}</strong></div>}
            {kind === 'circuit' && <div><span>Races in catalog</span><strong>{entity.catalogCount ?? 0}</strong></div>}
            {finalStanding && <div><span>Championship</span><strong>{position(finalStanding.position)} · {finalStanding.points} pts</strong></div>}
          </div>
        </article>

        <article className="panel entity-summary">
          <div className="panel-heading"><div><p className="eyebrow">DATA RELATION</p><h2>{kind === 'race' ? 'Race classification' : kind === 'circuit' ? 'Circuit history' : 'Race performance'}</h2></div><Gauge size={18} /></div>
          {detailRows.length ? (
            <div className="entity-results">
              {detailRows.map((row) => (
                <div className="entity-result-row" key={row.id}>
                  <span>{kind === 'race' ? position(row.position) : `Round ${String(row.round).padStart(2, '0')}`}</span>
                  <strong>{row.points} pts</strong>
                  <small>{row.status} · {row.grid !== null ? `Grid ${row.grid}` : 'Grid —'}</small>
                </div>
              ))}
            </div>
          ) : <div className="empty-state">No verified race results are available for this entity yet.</div>}
        </article>
      </section>

      {analytical && progression.length > 0 && (
        <section className="panel entity-analysis">
          <div className="panel-heading"><div><p className="eyebrow">SEASON PROGRESSION</p><h2>Cumulative points by round</h2></div><Flag size={18} /></div>
          <div className="progression-list">
            {progression.slice(-10).map((item) => <div className="progression-row" key={item.round}><span>R{String(item.round).padStart(2, '0')}</span><div className="progression-track"><i style={{ width: `${Math.min(100, (item.points / Math.max(progression[progression.length - 1].points, 1)) * 100)}%` }} /></div><strong>{item.points.toFixed(1)} pts</strong><small>{item.wins} win{item.wins === 1 ? '' : 's'}</small></div>)}
          </div>
        </section>
      )}

      <section className="entity-source-note"><Users size={16} /><span>Verified source: Jolpica. Metrics are derived from published race results and standings, with no fabricated telemetry.</span></section>
    </main>
  )
}

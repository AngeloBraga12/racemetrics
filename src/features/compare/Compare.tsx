import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeftRight, Flag, Trophy } from 'lucide-react'
import { fetchVerifiedSeasonStandings } from '../../data/jolpicaRepository'
import { motorsportRepository } from '../../data/motorsportRepository'
import type { Driver, DriverStanding } from '../../types/domain'
import { useAuth } from '../../auth/AuthProvider'
import { deleteSavedComparison, listSavedComparisons, saveComparison } from '../../lib/userData'
import './compare.css'

const SEASON = 2026

type CompareData = { drivers: DriverStanding[]; catalogDrivers: Driver[]; teams: Record<string, string> }

type Metric = { label: string; left: string; right: string; winner: 'left' | 'right' | 'tie' | 'na'; higherIsBetter: boolean }

const compareMetric = (label: string, left: number | null, right: number | null, higherIsBetter = true): Metric => {
  if (left == null || right == null) return { label, left: left == null ? '—' : String(left), right: right == null ? '—' : String(right), winner: 'na', higherIsBetter }
  if (left === right) return { label, left: String(left), right: String(right), winner: 'tie', higherIsBetter }
  const leftWins = higherIsBetter ? left > right : left < right
  return { label, left: String(left), right: String(right), winner: leftWins ? 'left' : 'right', higherIsBetter }
}

export function Compare() {
  const [data, setData] = useState<CompareData | null>(null)
  const [error, setError] = useState(false)
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')\n  const [saved, setSaved] = useState<Array<{ id: string; title: string; left_entity_id: string; right_entity_id: string }>>([])\n  const [saveStatus, setSaveStatus] = useState<string | null>(null)\n  const { user } = useAuth()

  useEffect(() => {
    let active = true
    Promise.all([fetchVerifiedSeasonStandings(SEASON), motorsportRepository.getCatalog()])
      .then(([standings, catalog]) => {
        if (!active) return
        const teams = Object.fromEntries(catalog.teams.map((team) => [team.id, team.name]))
        const catalogDrivers = catalog.drivers.filter((driver) => standings.driverStandings.some((standing) => standing.driverId === driver.id))
        setData({ drivers: standings.driverStandings, catalogDrivers, teams })
        const ordered = standings.driverStandings.slice().sort((a, b) => b.points - a.points)
        setLeftId(ordered[0]?.driverId ?? '')
        setRightId(ordered[1]?.driverId ?? ordered[0]?.driverId ?? '')
      })
      .catch(() => active && setError(true))
    return () => { active = false }
  }, [])

  useEffect(() => {\n    if (!user) return\n    void listSavedComparisons(user.id).then((items) => setSaved(items.map((item) => ({ id: item.id, title: item.title, left_entity_id: item.left_entity_id, right_entity_id: item.right_entity_id })))).catch(() => undefined)\n  }, [user])\n\n  const persistComparison = async () => {\n    if (!user || !left || !right || leftId === rightId) return\n    setSaveStatus(null)\n    try {\n      const item = await saveComparison(user.id, { title: `${leftDriver?.fullName ?? leftId} vs ${rightDriver?.fullName ?? rightId}`, comparison_type: 'driver-driver', left_entity_id: leftId, right_entity_id: rightId })\n      setSaved((items) => [{ id: item.id, title: item.title, left_entity_id: item.left_entity_id, right_entity_id: item.right_entity_id }, ...items])\n      setSaveStatus('Comparison saved.')\n    } catch { setSaveStatus('Could not save comparison.') }\n  }\n\n  const removeComparison = async (id: string) => {\n    if (!user) return\n    try { await deleteSavedComparison(user.id, id); setSaved((items) => items.filter((item) => item.id !== id)) } catch { setSaveStatus('Could not remove comparison.') }\n  }\n\n  const left = useMemo(() => data?.drivers.find((item) => item.driverId === leftId), [data, leftId])
  const right = useMemo(() => data?.drivers.find((item) => item.driverId === rightId), [data, rightId])
  const leftDriver = data?.catalogDrivers.find((item) => item.id === leftId)
  const rightDriver = data?.catalogDrivers.find((item) => item.id === rightId)

  const metrics = useMemo(() => {
    if (!left || !right) return []
    return [
      compareMetric('Championship position', left.position, right.position, false),
      compareMetric('Points', left.points, right.points),
      compareMetric('Wins', left.wins, right.wins),
    ]
  }, [left, right])

  if (error) return <main className="content compare-page"><section className="compare-empty"><Flag size={20} /><h1>Comparison unavailable</h1><p>Verified championship data could not be loaded. No fallback numbers are displayed.</p></section></main>
  if (!data) return <main className="content compare-page"><section className="compare-loading"><Activity size={18} /> Loading verified comparison data...</section></main>

  return <main className="content compare-page">
    <header className="compare-header"><div><p className="eyebrow">COMPARE / VERIFIED SOURCE</p><h1>Driver vs driver</h1><p>Compare the current {SEASON} championship snapshot without mixing verified results with synthetic metrics.</p></div><span className="verified-pill">VERIFIED · {SEASON}</span></header>

    <section className="compare-controls panel"><div className="compare-select"><label htmlFor="driver-left">Driver A</label><select id="driver-left" value={leftId} onChange={(event) => setLeftId(event.target.value)}>{data.catalogDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName}</option>)}</select></div><ArrowLeftRight className="compare-swap" size={19} aria-hidden="true" /><div className="compare-select"><label htmlFor="driver-right">Driver B</label><select id="driver-right" value={rightId} onChange={(event) => setRightId(event.target.value)}>{data.catalogDrivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.fullName}</option>)}</select></div></section>

    {left && right && leftDriver && rightDriver ? <>
      <section className="driver-versus">
        <article className="driver-card"><span className="driver-number">{leftDriver.number ?? '—'}</span><div><p className="eyebrow">DRIVER A</p><h2>{leftDriver.fullName}</h2><p>{leftDriver.nationality} · {left.teamIds[0] ? data.teams[left.teamIds[0]] ?? left.teamIds[0] : 'Team unavailable'}</p></div><strong>{left.points}<small> PTS</small></strong></article>
        <div className="versus-mark">VS</div>
        <article className="driver-card driver-card-right"><div><p className="eyebrow">DRIVER B</p><h2>{rightDriver.fullName}</h2><p>{rightDriver.nationality} · {right.teamIds[0] ? data.teams[right.teamIds[0]] ?? right.teamIds[0] : 'Team unavailable'}</p></div><strong>{right.points}<small> PTS</small></strong><span className="driver-number">{rightDriver.number ?? '—'}</span></article>
      </section>
      <section className="panel metrics-panel"><div className="panel-heading"><div><p className="eyebrow">HEAD TO HEAD</p><h2>Championship metrics</h2></div><Trophy size={18} /></div>{metrics.map((metric) => <div className="metric-row" key={metric.label}><span className={metric.winner === 'left' ? 'metric-value winner' : 'metric-value'}>{metric.left}</span><div><span className="metric-label">{metric.label}</span><div className="metric-track"><span style={{ width: `${Math.min(100, Math.abs(Number(metric.left) || 0) / Math.max(1, Math.max(Number(metric.left) || 0, Number(metric.right) || 0)) * 100)}%` }} /></div></div><span className={metric.winner === 'right' ? 'metric-value winner' : 'metric-value'}>{metric.right}</span></div>)}</section>
      <section className="panel saved-comparisons"><div className="panel-heading"><div><p className="eyebrow">PRIVATE WORKSPACE</p><h2>Saved comparisons</h2></div><button className="secondary-button" onClick={() => void persistComparison()} disabled={!user || leftId === rightId}>Save current</button></div>{saveStatus && <p>{saveStatus}</p>}{saved.length === 0 ? <p>No saved comparisons yet.</p> : saved.map((item) => <div className="saved-comparison" key={item.id}><span>{item.title}</span><button className="icon-button" onClick={() => void removeComparison(item.id)} aria-label={`Delete ${item.title}`}>×</button></div>)}</section>\n      <p className="compare-provenance">Provenance: verified Jolpica F1 standings for the {SEASON} season. Position, points and wins are the only comparison metrics currently supported by this ingestion slice. Qualifying pace, teammate deltas, DNFs and race-by-race trends remain intentionally unavailable until their data pipeline is implemented.</p>
    </> : <section className="compare-empty"><Flag size={20} /><h2>Choose two different drivers</h2><p>The comparison needs two valid championship records.</p></section>}
  </main>
}

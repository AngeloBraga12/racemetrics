import { useEffect, useMemo, useState } from 'react'
import { CircuitBoard, Flag, Search, Star, Users, X } from 'lucide-react'
import { motorsportRepository, type SearchResult } from '../../data/motorsportRepository'
import type { EntityKind, MotorsportCatalog } from '../../types/domain'

const filters: Array<{ value: EntityKind | 'all'; label: string }> = [
  { value: 'all', label: 'All' }, { value: 'driver', label: 'Drivers' },
  { value: 'team', label: 'Teams' }, { value: 'race', label: 'Races' }, { value: 'circuit', label: 'Circuits' },
]
const icons = { driver: Users, team: Users, race: Flag, circuit: CircuitBoard }

export function Explore() {
  const [catalog, setCatalog] = useState<MotorsportCatalog | null>(null)
  const [kind, setKind] = useState<EntityKind | 'all'>('all')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    motorsportRepository.getCatalog().then((next) => { if (active) { setCatalog(next); setLoading(false) } })
    return () => { active = false }
  }, [])
  useEffect(() => {
    let active = true
    motorsportRepository.search({ query, kind }).then((next) => { if (active) setResults(next) })
    return () => { active = false }
  }, [kind, query])

  const counts = useMemo(() => ({
    driver: catalog?.drivers.length ?? 0, team: catalog?.teams.length ?? 0,
    race: catalog?.races.length ?? 0, circuit: catalog?.circuits.length ?? 0,
  }), [catalog])

  return <main className="content explore-page" id="explore">
    <section className="explore-heading"><div>
      <p className="eyebrow">EXPLORE / DATA CATALOG</p>
      <h1>Find the shape<br /><span>behind the result.</span></h1>
      <p>Browse the domain model first. Verified upstream data will replace the preview adapter without forcing the interface to change.</p>
    </div><div className="catalog-state"><span className="status-dot" /> PREVIEW CATALOG <strong>·</strong> SEASON {catalog?.season ?? '-'}</div></section>
    <section className="explore-toolbar" aria-label="Catalog filters">
      <div className="explore-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers, teams, races or circuits" aria-label="Search catalog" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div>
      <div className="filter-row">{filters.map((filter) => <button key={filter.value} className={kind === filter.value ? 'filter active' : 'filter'} onClick={() => setKind(filter.value)}>{filter.label}<span>{filter.value === 'all' ? results.length : counts[filter.value]}</span></button>)}</div>
    </section>
    <section className="explore-results" aria-live="polite">
      <div className="results-heading"><span>{loading ? 'Loading catalog...' : `${results.length} records`}</span><small>PREVIEW DATA IS NOT OFFICIAL RACE DATA</small></div>
      {results.map((item) => { const Icon = icons[item.kind]; return <article className="explore-row" key={`${item.kind}-${item.id}`}><div className="result-icon"><Icon size={17} /></div><div className="result-main"><strong>{item.label}</strong><span>{item.meta}</span></div><span className="result-kind">{item.kind}</span><button className="favorite-placeholder" aria-label={`Favorite ${item.label}`} title="Favorites will connect to private user state"><Star size={16} /></button></article> })}
      {!loading && results.length === 0 && <div className="empty-state">No records match this filter. The catalog is intentionally small while the verified data adapter is under construction.</div>}
    </section>
  </main>
}

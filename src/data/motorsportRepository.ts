import type { EntityKind, MotorsportCatalog } from '../types/domain'
import { previewCatalog } from './catalog'
import { fetchVerifiedCatalog } from './jolpicaRepository'

export type CatalogFilter = { query?: string; kind?: EntityKind | 'all' }
export type SearchResult = { kind: EntityKind; id: string; label: string; meta: string }

export type MotorsportRepository = {
  getCatalog: () => Promise<MotorsportCatalog>
  search: (filter: CatalogFilter) => Promise<SearchResult[]>
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR')
let catalogPromise: Promise<MotorsportCatalog> | null = null

const getCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = fetchVerifiedCatalog(2026).catch(() => previewCatalog)
  }
  return catalogPromise
}

export const motorsportRepository: MotorsportRepository = {
  getCatalog,
  async search({ query = '', kind = 'all' }) {
    const catalog = await getCatalog()
    const needle = normalize(query)
    const teamById = new Map(catalog.teams.map((team) => [team.id, team]))
    const results: SearchResult[] = [
      ...catalog.drivers.map((driver) => ({ kind: 'driver' as const, id: driver.id, label: driver.fullName, meta: driver.teamId ? teamById.get(driver.teamId)?.name ?? 'Team' : driver.nationality })),
      ...catalog.teams.map((team) => ({ kind: 'team' as const, id: team.id, label: team.name, meta: team.country })),
      ...catalog.races.map((race) => ({ kind: 'race' as const, id: race.id, label: race.name, meta: `Round ${String(race.round).padStart(2, '0')}` })),
      ...catalog.circuits.map((circuit) => ({ kind: 'circuit' as const, id: circuit.id, label: circuit.name, meta: `${circuit.location}, ${circuit.country}` })),
    ]
    return results.filter((item) => (kind === 'all' || item.kind === kind) && (!needle || normalize(`${item.label} ${item.meta}`).includes(needle)))
  },
}

import type { EntityKind, MotorsportCatalog } from '../types/domain'
import { previewCatalog } from './catalog'

export type CatalogFilter = { query?: string; kind?: EntityKind | 'all' }
export type SearchResult = { kind: EntityKind; id: string; label: string; meta: string }

export type MotorsportRepository = {
  getCatalog: () => Promise<MotorsportCatalog>
  search: (filter: CatalogFilter) => Promise<SearchResult[]>
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR')

const previewRepository: MotorsportRepository = {
  async getCatalog() { return previewCatalog },
  async search({ query = '', kind = 'all' }) {
    const needle = normalize(query)
    const teamById = new Map(previewCatalog.teams.map((team) => [team.id, team]))
    const results: SearchResult[] = [
      ...previewCatalog.drivers.map((driver) => ({ kind: 'driver', id: driver.id, label: driver.fullName, meta: teamById.get(driver.teamId)?.name ?? 'Team' })),
      ...previewCatalog.teams.map((team) => ({ kind: 'team', id: team.id, label: team.name, meta: team.shortName })),
      ...previewCatalog.races.map((race) => ({ kind: 'race', id: race.id, label: race.name, meta: `Round ${String(race.round).padStart(2, '0')}` })),
      ...previewCatalog.circuits.map((circuit) => ({ kind: 'circuit', id: circuit.id, label: circuit.name, meta: `${circuit.location}, ${circuit.country}` })),
    ]
    return results.filter((item) => (kind === 'all' || item.kind === kind) && (!needle || normalize(`${item.label} ${item.meta}`).includes(needle)))
  },
}

export const motorsportRepository: MotorsportRepository = previewRepository

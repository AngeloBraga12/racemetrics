import type {
  ConstructorStanding,
  DriverStanding,
  EntityKind,
  MotorsportCatalog,
  RaceResult,
} from '../types/domain'
import { previewCatalog } from './catalog'
import { fetchVerifiedCatalog } from './jolpicaRepository'
import { buildVerifiedSeasonData } from './jolpicaResultsRepository'

export type CatalogFilter = { query?: string; kind?: EntityKind | 'all' }
export type SearchResult = { kind: EntityKind; id: string; label: string; meta: string }

export type VerifiedSeasonData = {
  catalog: MotorsportCatalog
  results: RaceResult[]
  driverStandings: DriverStanding[]
  constructorStandings: ConstructorStanding[]
}

export type MotorsportRepository = {
  getCatalog: () => Promise<MotorsportCatalog>
  getSeasonData: () => Promise<VerifiedSeasonData | null>
  search: (filter: CatalogFilter) => Promise<SearchResult[]>
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('pt-BR')
let catalogPromise: Promise<MotorsportCatalog> | null = null
let seasonDataPromise: Promise<VerifiedSeasonData | null> | null = null

const getCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = fetchVerifiedCatalog(2026).catch(() => previewCatalog)
  }
  return catalogPromise
}

const getSeasonData = async (): Promise<VerifiedSeasonData | null> => {
  if (!seasonDataPromise) {
    seasonDataPromise = fetchVerifiedCatalog(2026)
      .then(buildVerifiedSeasonData)
      .catch(() => null)
  }
  return seasonDataPromise
}

export const motorsportRepository: MotorsportRepository = {
  getCatalog,
  getSeasonData,
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

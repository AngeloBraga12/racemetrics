import type {
  ConstructorStanding,
  Driver,
  DriverStanding,
  MotorsportCatalog,
  RaceResult,
} from '../types/domain'

type JolpicaResponse = { MRData?: Record<string, unknown> }
type ResultRecord = {
  number?: string
  position?: string
  points?: string
  grid?: string
  status?: string
  Driver?: { driverId: string }
  Constructor?: { constructorId: string }
  FastestLap?: { rank?: string; Time?: { time?: string } }
}
type RaceRecord = {
  season: string
  round: string
  raceName: string
  Results?: ResultRecord[]
}
type DriverStandingRecord = {
  position?: string
  points?: string
  wins?: string
  Driver?: { driverId: string }
  Constructors?: Array<{ constructorId: string }>
}
type ConstructorStandingRecord = {
  position?: string
  points?: string
  wins?: string
  Constructor?: { constructorId: string }
}

const request = async <T extends JolpicaResponse>(
  resource: string,
  season: number,
  params: Record<string, string> = {},
): Promise<T> => {
  const query = new URLSearchParams({ resource, season: String(season), ...params })
  const response = await fetch(`/api/f1?${query.toString()}`)
  if (!response.ok) throw new Error(`F1 data request failed: ${response.status}`)
  return response.json() as Promise<T>
}

const readTableArray = <T>(payload: JolpicaResponse, table: string, key: string): T[] => {
  const tableValue = payload.MRData?.[table]
  if (!tableValue || typeof tableValue !== 'object') throw new Error(`Unexpected Jolpica ${table} response`)
  const value = (tableValue as Record<string, unknown>)[key]
  if (!Array.isArray(value)) throw new Error(`Unexpected Jolpica ${table}.${key} response`)
  return value as T[]
}

const readTotal = (payload: JolpicaResponse) => Number((payload.MRData?.total as string | undefined) ?? 0)

const toNumberOrNull = (value?: string) => {
  if (!value || !/^\d+(\.\d+)?$/.test(value)) return null
  return Number(value)
}

const fetchAllResultRaces = async (season: number): Promise<RaceRecord[]> => {
  const pageSize = 100
  const first = await request<JolpicaResponse>('results', season, { limit: String(pageSize), offset: '0' })
  const races = readTableArray<RaceRecord>(first, 'RaceTable', 'Races')
  const total = readTotal(first)
  const pages: RaceRecord[] = [...races]

  for (let offset = pageSize; offset < total; offset += pageSize) {
    const page = await request<JolpicaResponse>('results', season, {
      limit: String(pageSize), offset: String(offset),
    })
    pages.push(...readTableArray<RaceRecord>(page, 'RaceTable', 'Races'))
  }

  return pages
}

export const fetchVerifiedSeasonResults = async (
  season: number,
  catalog: MotorsportCatalog,
): Promise<RaceResult[]> => {
  const races = await fetchAllResultRaces(season)
  const catalogRaceIds = new Map(catalog.races.map((race) => [`${race.season}-${race.round}`, race.id]))

  return races.flatMap((race) => (race.Results ?? []).map((result, index) => ({
    id: `${season}-${race.round}-${result.Driver?.driverId ?? index}`,
    season,
    round: Number(race.round),
    raceId: catalogRaceIds.get(`${season}-${race.round}`) ?? `${season}-${race.round}`,
    driverId: result.Driver?.driverId ?? 'unknown',
    teamId: result.Constructor?.constructorId ?? 'unknown',
    grid: toNumberOrNull(result.grid),
    position: toNumberOrNull(result.position),
    points: Number(result.points ?? 0),
    status: result.status ?? 'Unknown',
    fastestLapRank: toNumberOrNull(result.FastestLap?.rank),
    fastestLapTime: result.FastestLap?.Time?.time ?? null,
    statusCode: 'verified' as const,
  })))
}

export const fetchVerifiedDriverStandings = async (season: number): Promise<DriverStanding[]> => {
  const payload = await request<JolpicaResponse>('driverstandings', season)
  const lists = readTableArray<Record<string, unknown>>(payload, 'StandingsTable', 'StandingsLists')
  const records = (lists[0]?.DriverStandings as DriverStandingRecord[] | undefined) ?? []
  const round = toNumberOrNull(lists[0]?.round as string | undefined)

  return records.flatMap((standing) => standing.Driver?.driverId ? [{
    season,
    round,
    driverId: standing.Driver.driverId,
    teamIds: (standing.Constructors ?? []).map((constructor) => constructor.constructorId),
    position: toNumberOrNull(standing.position),
    points: Number(standing.points ?? 0),
    wins: Number(standing.wins ?? 0),
    status: 'verified' as const,
  }] : [])
}

export const fetchVerifiedConstructorStandings = async (season: number): Promise<ConstructorStanding[]> => {
  const payload = await request<JolpicaResponse>('constructorstandings', season)
  const lists = readTableArray<Record<string, unknown>>(payload, 'StandingsTable', 'StandingsLists')
  const records = (lists[0]?.ConstructorStandings as ConstructorStandingRecord[] | undefined) ?? []
  const round = toNumberOrNull(lists[0]?.round as string | undefined)

  return records.flatMap((standing) => standing.Constructor?.constructorId ? [{
    season,
    round,
    teamId: standing.Constructor.constructorId,
    position: toNumberOrNull(standing.position),
    points: Number(standing.points ?? 0),
    wins: Number(standing.wins ?? 0),
    status: 'verified' as const,
  }] : [])
}

export const applyVerifiedTeamRelationships = (drivers: Driver[], results: RaceResult[]): Driver[] => {
  const latestTeamByDriver = new Map<string, string>()
  const sorted = [...results].sort((a, b) => b.round - a.round)
  for (const result of sorted) {
    if (result.teamId !== 'unknown' && !latestTeamByDriver.has(result.driverId)) {
      latestTeamByDriver.set(result.driverId, result.teamId)
    }
  }
  return drivers.map((driver) => ({ ...driver, teamId: latestTeamByDriver.get(driver.id) ?? driver.teamId }))
}

export const buildVerifiedSeasonData = async (catalog: MotorsportCatalog) => {
  const [results, driverStandings, constructorStandings] = await Promise.all([
    fetchVerifiedSeasonResults(catalog.season, catalog),
    fetchVerifiedDriverStandings(catalog.season),
    fetchVerifiedConstructorStandings(catalog.season),
  ])

  return {
    catalog: { ...catalog, drivers: applyVerifiedTeamRelationships(catalog.drivers, results) },
    results,
    driverStandings,
    constructorStandings,
  }
}

import type {
  Circuit,
  ConstructorStanding,
  Driver,
  DriverStanding,
  MotorsportCatalog,
  Race,
  RaceResult,
  Team,
} from '../types/domain'

type JolpicaResponse = { MRData?: Record<string, unknown> }
type DriverRecord = { driverId: string; givenName: string; familyName: string; code?: string; permanentNumber?: string; nationality?: string }
type ConstructorRecord = { constructorId: string; name: string; nationality?: string }
type CircuitRecord = { circuitId: string; circuitName: string; Location?: { locality?: string; country?: string } }
type RaceRecord = { season: string; round: string; raceName: string; date?: string; Circuit: CircuitRecord }
type ResultRecord = {
  position?: string; points?: string; grid?: string; status?: string
  Driver: { driverId: string }; Constructor: { constructorId: string }
  FastestLap?: { rank?: string; Time?: { time?: string } }
}
type DriverStandingRecord = { position?: string; points?: string; wins?: string; Driver: { driverId: string }; Constructors?: { constructorId: string }[] }
type ConstructorStandingRecord = { position?: string; points?: string; wins?: string; Constructor: { constructorId: string } }

const request = async <T extends JolpicaResponse>(resource: string, season: number, round?: number): Promise<T> => {
  const roundQuery = round ? `&round=${round}` : ''
  const response = await fetch(`/api/f1?resource=${resource}&season=${season}${roundQuery}`)
  if (!response.ok) throw new Error(`F1 data request failed: ${response.status}`)
  return response.json() as Promise<T>
}

const readArray = <T>(payload: JolpicaResponse, table: string, key: string): T[] => {
  const tableValue = payload.MRData?.[table]
  if (!tableValue || typeof tableValue !== 'object') throw new Error(`Unexpected Jolpica ${table} response`)
  const value = (tableValue as Record<string, unknown>)[key]
  if (!Array.isArray(value)) throw new Error(`Unexpected Jolpica ${table}.${key} response`)
  return value as T[]
}

const readStandings = <T>(payload: JolpicaResponse, key: string): T[] => {
  const table = payload.MRData?.StandingsTable
  if (!table || typeof table !== 'object') throw new Error('Unexpected Jolpica standings response')
  const lists = (table as Record<string, unknown>).StandingsLists
  if (!Array.isArray(lists) || !lists[0] || typeof lists[0] !== 'object') throw new Error('Unexpected Jolpica standings list')
  const value = (lists[0] as Record<string, unknown>)[key]
  if (!Array.isArray(value)) throw new Error(`Unexpected Jolpica standings ${key} response`)
  return value as T[]
}

const numberOrNull = (value?: string) => {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
const numberOrZero = (value?: string) => numberOrNull(value) ?? 0
const roundFrom = (payload: JolpicaResponse) => numberOrNull((payload.MRData?.StandingsTable as Record<string, unknown> | undefined)?.round as string | undefined)

export const fetchVerifiedCatalog = async (season: number): Promise<MotorsportCatalog> => {
  const [driversPayload, constructorsPayload, circuitsPayload, racesPayload] = await Promise.all([
    request('drivers', season), request('constructors', season), request('circuits', season), request('races', season),
  ])
  const constructorRecords = readArray<ConstructorRecord>(constructorsPayload, 'ConstructorTable', 'Constructors')
  const driverRecords = readArray<DriverRecord>(driversPayload, 'DriverTable', 'Drivers')
  const circuitRecords = readArray<CircuitRecord>(circuitsPayload, 'CircuitTable', 'Circuits')
  const raceRecords = readArray<RaceRecord>(racesPayload, 'RaceTable', 'Races')
  const teams: Team[] = constructorRecords.map((team) => ({ id: team.constructorId, name: team.name, shortName: team.name, country: team.nationality ?? 'Unknown', status: 'verified' }))
  const drivers: Driver[] = driverRecords.map((driver) => ({ id: driver.driverId, fullName: `${driver.givenName} ${driver.familyName}`, shortName: driver.code ?? driver.driverId.toUpperCase().slice(0, 3), nationality: driver.nationality ?? 'Unknown', number: driver.permanentNumber ? Number(driver.permanentNumber) : null, teamId: null, status: 'verified' }))
  const circuits: Circuit[] = circuitRecords.map((circuit) => ({ id: circuit.circuitId, name: circuit.circuitName, location: circuit.Location?.locality ?? 'Unknown', country: circuit.Location?.country ?? 'Unknown', laps: null, status: 'verified' }))
  const races: Race[] = raceRecords.map((race) => ({ id: `${race.season}-${race.round}-${race.Circuit.circuitId}`, season: Number(race.season), round: Number(race.round), name: race.raceName, circuitId: race.Circuit.circuitId, date: race.date ?? null, status: 'verified' }))
  if (!teams.length || !drivers.length || !circuits.length || !races.length) throw new Error('Verified F1 catalog is incomplete')
  return { season, teams, drivers, circuits, races }
}

export type VerifiedSeasonAnalytics = { results: RaceResult[]; driverStandings: DriverStanding[]; constructorStandings: ConstructorStanding[] }

export const fetchVerifiedSeasonStandings = async (season: number) => {
  const [driverPayload, constructorPayload] = await Promise.all([request('driverstandings', season), request('constructorstandings', season)])
  const driverStandings: DriverStanding[] = readStandings<DriverStandingRecord>(driverPayload, 'DriverStandings').map((standing) => ({ season, round: roundFrom(driverPayload), driverId: standing.Driver.driverId, teamIds: standing.Constructors?.map((constructor) => constructor.constructorId) ?? [], position: numberOrNull(standing.position), points: numberOrZero(standing.points), wins: numberOrZero(standing.wins), status: 'verified' }))
  const constructorStandings: ConstructorStanding[] = readStandings<ConstructorStandingRecord>(constructorPayload, 'ConstructorStandings').map((standing) => ({ season, round: roundFrom(constructorPayload), teamId: standing.Constructor.constructorId, position: numberOrNull(standing.position), points: numberOrZero(standing.points), wins: numberOrZero(standing.wins), status: 'verified' }))
  return { round: roundFrom(driverPayload), driverStandings, constructorStandings }
}

export const fetchVerifiedSeasonAnalytics = async (season: number, rounds: number[]): Promise<VerifiedSeasonAnalytics> => {
  const standings = await fetchVerifiedSeasonStandings(season)
  const resultPayloads: JolpicaResponse[] = []
  for (const round of rounds) resultPayloads.push(await request('results', season, round))
  const results: RaceResult[] = []
  for (let index = 0; index < resultPayloads.length; index += 1) {
    const round = rounds[index]
    const records = readArray<{ season: string; round: string; Results?: ResultRecord[] }>(resultPayloads[index], 'RaceTable', 'Races')
    for (const race of records) for (const result of race.Results ?? []) results.push({ id: `${season}-${round}-${result.Driver.driverId}`, season, round, raceId: `${season}-${round}`, driverId: result.Driver.driverId, teamId: result.Constructor.constructorId, grid: numberOrNull(result.grid), position: numberOrNull(result.position), points: numberOrZero(result.points), status: result.status ?? 'Unknown', fastestLapRank: numberOrNull(result.FastestLap?.rank), fastestLapTime: result.FastestLap?.Time?.time ?? null, statusCode: 'verified' })
  }
  return { results, ...standings }
}

import type { Circuit, Driver, MotorsportCatalog, Race, Team } from '../types/domain'

type JolpicaResponse = { MRData?: Record<string, unknown> }
type DriverRecord = { driverId: string; givenName: string; familyName: string; code?: string; permanentNumber?: string; nationality?: string }
type ConstructorRecord = { constructorId: string; name: string; nationality?: string }
type CircuitRecord = { circuitId: string; circuitName: string; Location?: { locality?: string; country?: string } }
type RaceRecord = { season: string; round: string; raceName: string; date?: string; Circuit: CircuitRecord }

const request = async <T extends JolpicaResponse>(resource: string, season: number): Promise<T> => {
  const response = await fetch(`/api/f1?resource=${resource}&season=${season}`)
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

export const fetchVerifiedCatalog = async (season: number): Promise<MotorsportCatalog> => {
  const [driversPayload, constructorsPayload, circuitsPayload, racesPayload] = await Promise.all([
    request('drivers', season),
    request('constructors', season),
    request('circuits', season),
    request('races', season),
  ])

  const constructorRecords = readArray<ConstructorRecord>(constructorsPayload, 'ConstructorTable', 'Constructors')
  const driverRecords = readArray<DriverRecord>(driversPayload, 'DriverTable', 'Drivers')
  const circuitRecords = readArray<CircuitRecord>(circuitsPayload, 'CircuitTable', 'Circuits')
  const raceRecords = readArray<RaceRecord>(racesPayload, 'RaceTable', 'Races')

  const teams: Team[] = constructorRecords.map((team) => ({
    id: team.constructorId,
    name: team.name,
    shortName: team.name,
    country: team.nationality ?? 'Unknown',
    status: 'verified',
  }))

  const teamIds = new Set(teams.map((team) => team.id))
  const fallbackTeamId = teams[0]?.id ?? 'unassigned'

  const drivers: Driver[] = driverRecords.map((driver) => ({
    id: driver.driverId,
    fullName: `${driver.givenName} ${driver.familyName}`,
    shortName: driver.code ?? driver.driverId.toUpperCase().slice(0, 3),
    nationality: driver.nationality ?? 'Unknown',
    number: driver.permanentNumber ? Number(driver.permanentNumber) : null,
    teamId: fallbackTeamId,
    status: 'verified',
  }))

  const circuits: Circuit[] = circuitRecords.map((circuit) => ({
    id: circuit.circuitId,
    name: circuit.circuitName,
    location: circuit.Location?.locality ?? 'Unknown',
    country: circuit.Location?.country ?? 'Unknown',
    laps: null,
    status: 'verified',
  }))

  const circuitIds = new Set(circuits.map((circuit) => circuit.id))
  const races: Race[] = raceRecords.map((race) => ({
    id: `${race.season}-${race.round}-${race.Circuit.circuitId}`,
    season: Number(race.season),
    round: Number(race.round),
    name: race.raceName,
    circuitId: circuitIds.has(race.Circuit.circuitId) ? race.Circuit.circuitId : race.Circuit.circuitId,
    date: race.date ?? null,
    status: 'verified',
  }))

  if (!teams.length || !drivers.length || !circuits.length || !races.length || !teamIds.size) {
    throw new Error('Verified F1 catalog is incomplete')
  }

  return { season, teams, drivers, circuits, races }
}

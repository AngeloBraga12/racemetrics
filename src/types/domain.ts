export type EntityKind = 'driver' | 'team' | 'race' | 'circuit'

export type DataStatus = 'preview' | 'verified'

export type Driver = {
  id: string
  fullName: string
  shortName: string
  nationality: string
  number: number | null
  teamId: string | null
  status: DataStatus
}

export type Team = {
  id: string
  name: string
  shortName: string
  country: string
  status: DataStatus
}

export type Circuit = {
  id: string
  name: string
  location: string
  country: string
  laps: number | null
  status: DataStatus
}

export type Race = {
  id: string
  season: number
  round: number
  name: string
  circuitId: string
  date: string | null
  status: DataStatus
}

export type RaceResult = {
  id: string
  season: number
  round: number
  raceId: string
  driverId: string
  teamId: string
  grid: number | null
  position: number | null
  points: number
  status: string
  fastestLapRank: number | null
  fastestLapTime: string | null
  statusCode: DataStatus
}

export type DriverStanding = {
  season: number
  round: number | null
  driverId: string
  teamIds: string[]
  position: number | null
  points: number
  wins: number
  status: DataStatus
}

export type ConstructorStanding = {
  season: number
  round: number | null
  teamId: string
  position: number | null
  points: number
  wins: number
  status: DataStatus
}

export type MotorsportCatalog = {
  season: number
  drivers: Driver[]
  teams: Team[]
  circuits: Circuit[]
  races: Race[]
}

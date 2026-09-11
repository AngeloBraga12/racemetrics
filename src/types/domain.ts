export type EntityKind = 'driver' | 'team' | 'race' | 'circuit'

export type DataStatus = 'preview' | 'verified'

export type Driver = {
  id: string
  fullName: string
  shortName: string
  nationality: string
  number: number | null
  teamId: string
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

export type MotorsportCatalog = {
  season: number
  drivers: Driver[]
  teams: Team[]
  circuits: Circuit[]
  races: Race[]
}

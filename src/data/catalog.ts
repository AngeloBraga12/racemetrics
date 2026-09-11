import type { MotorsportCatalog } from '../types/domain'

export const previewCatalog: MotorsportCatalog = {
  season: 2026,
  teams: [
    { id: 'team-alpha', name: 'Team Alpha', shortName: 'ALP', country: 'Preview', status: 'preview' },
    { id: 'team-beta', name: 'Team Beta', shortName: 'BET', country: 'Preview', status: 'preview' },
    { id: 'team-gamma', name: 'Team Gamma', shortName: 'GAM', country: 'Preview', status: 'preview' },
  ],
  drivers: [
    { id: 'driver-one', fullName: 'Driver One', shortName: 'D. ONE', nationality: 'Preview', number: 1, teamId: 'team-alpha', status: 'preview' },
    { id: 'driver-two', fullName: 'Driver Two', shortName: 'D. TWO', nationality: 'Preview', number: 2, teamId: 'team-beta', status: 'preview' },
    { id: 'driver-three', fullName: 'Driver Three', shortName: 'D. THREE', nationality: 'Preview', number: 3, teamId: 'team-gamma', status: 'preview' },
    { id: 'driver-four', fullName: 'Driver Four', shortName: 'D. FOUR', nationality: 'Preview', number: 4, teamId: 'team-alpha', status: 'preview' },
  ],
  circuits: [
    { id: 'circuit-north', name: 'North Loop', location: 'Preview City', country: 'Preview', laps: 56, status: 'preview' },
    { id: 'circuit-coast', name: 'Coastal Ring', location: 'Preview Bay', country: 'Preview', laps: 58, status: 'preview' },
    { id: 'circuit-valley', name: 'Valley Circuit', location: 'Preview Valley', country: 'Preview', laps: 52, status: 'preview' },
  ],
  races: [
    { id: 'race-01', season: 2026, round: 1, name: 'Opening Grand Prix', circuitId: 'circuit-north', date: null, status: 'preview' },
    { id: 'race-02', season: 2026, round: 2, name: 'Coastal Grand Prix', circuitId: 'circuit-coast', date: null, status: 'preview' },
    { id: 'race-03', season: 2026, round: 3, name: 'Valley Grand Prix', circuitId: 'circuit-valley', date: null, status: 'preview' },
  ],
}

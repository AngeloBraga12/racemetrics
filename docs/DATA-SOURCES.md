# RaceMetrics data sources

## Primary F1 catalog and analytics source

RaceMetrics uses Jolpica F1 as the first verified upstream source for Formula 1 reference data, race classifications and championship standings.

Jolpica F1 is the open-source successor to the Ergast F1 API and exposes compatible endpoints for drivers, constructors, circuits, races, results and standings. Its documented API limit is 100 records per request, so RaceMetrics paginates result ingestion instead of silently treating a truncated response as complete.

Reference: https://github.com/jolpica/jolpica-f1

## Integration boundary

The browser does not call the Jolpica upstream host directly. RaceMetrics requests `/api/f1` on its own origin. A Netlify Function validates the resource, season, round, limit and offset, adds the required User-Agent and proxies only the allowlisted resources.

```text
Explore / Analytics
       |
       v
motorsportRepository
       |
       +--> jolpicaRepository
       |
       +--> jolpicaResultsRepository
       |
       v
   /api/f1
       |
       v
  Jolpica F1
```

## Current verified resources

- Drivers
- Constructors / teams
- Circuits
- Races / calendar
- Race results
- Driver standings
- Constructor standings

Race results are normalized into `RaceResult` records containing driver, constructor, grid, finish position, points, status and fastest-lap fields when supplied by the upstream response.

Driver and constructor championship tables are normalized into typed standing records. Driver-to-constructor relationships are now derived from actual race-result evidence for the season, rather than inferred from the driver reference endpoint.

The adapter still preserves `null` when upstream data does not provide a defensible value. Missing information is not converted into decorative fiction.

## Pagination and resilience

The server proxy caps each request at 100 records. The verified result adapter reads the upstream total and requests subsequent pages sequentially, avoiding the common failure mode where a large season is presented as complete after only the first page.

If any verified season ingestion request fails, the season analytics repository returns no verified analytics payload. The catalog repository may still fall back to the explicitly fictional preview catalog. This prevents a partial analytics payload from being presented as authoritative.

## Licensing and operational note

Jolpica F1's published terms state that the API is free for non-commercial use and that its data is licensed CC BY-NC-SA 4.0. Commercial use requires contacting the project maintainers. Rate limits and uptime are not guaranteed.

Before commercializing RaceMetrics, review the provider's current terms and establish an appropriate data-source strategy.

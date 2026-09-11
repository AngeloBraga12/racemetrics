# RaceMetrics data sources

## Primary F1 catalog source

RaceMetrics uses Jolpica F1 as the first verified upstream adapter for Formula 1 catalog data.

Jolpica F1 is the open-source successor to the Ergast F1 API and exposes compatible endpoints for drivers, constructors, circuits and races. The project documents a maximum API result limit of 100 and requests a custom identifying User-Agent.

Reference: https://github.com/jolpica/jolpica-f1/blob/main/docs/README.md

## Integration boundary

The browser does not call the Jolpica upstream host directly. RaceMetrics requests `/api/f1` on its own origin. A Netlify Function validates the resource and season, adds the required User-Agent and proxies only the allowlisted catalog resources.

```text
Explore
  |
  v
motorsportRepository
  |
  v
jolpicaRepository
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

The current adapter deliberately does not infer a driver's constructor from the driver catalog endpoint. The domain therefore allows `teamId: null` until a result/standings ingestion layer supplies a defensible relationship.

Likewise, circuit lap counts remain `null` because the catalog endpoint does not provide a reliable lap-count field. Missing information stays missing instead of becoming decorative fiction.

## Fallback behavior

If the upstream service is unavailable or returns an unexpected payload, the repository falls back to the explicitly fictional preview catalog. The UI labels this state as preview and does not present it as official race data.

## Licensing and operational note

Jolpica F1's published terms state that the API is free for non-commercial use and that its data is licensed CC BY-NC-SA 4.0. Commercial use requires contacting the project maintainers. Rate limits and uptime are not guaranteed.

Before commercializing RaceMetrics, review the provider's current terms and establish an appropriate data-source strategy.

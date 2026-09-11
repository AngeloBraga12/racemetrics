# RaceMetrics

RaceMetrics is a private, authenticated motorsport analytics workspace built to explore seasons, compare performance and turn race results into defensible insights.

The goal is not to build another generic dashboard. The interface is deliberately shaped around motorsport concepts such as classification, gaps, laps, sectors, stints, qualifying and race pace.

## Product model

Each person has an individual account. User-owned information is private and isolated by server-side authorization.

Planned authentication methods:

- Email + password
- Google
- Microsoft

Main product areas:

- Dashboard
- Explore
- Compare
- Analytics

Planned advanced features:

- Driver and team profiles
- Circuit Explorer
- Race Insights
- Favorites and saved comparisons
- Race Replay
- What If?
- AI Race Analyst

## Engineering principles

- TypeScript strict
- Small, domain-oriented components
- Motorsport data separated from presentation
- Authentication separated from business rules
- Server-side authorization for every private resource
- Strong input validation
- Security tests for critical flows
- Accessibility and responsive behavior as release requirements
- CI validation before merge
- No fabricated data presented as official or live data

## Anti-generic design rule

The product must not resemble an AI-generated template. We avoid repetitive card grids, decorative gradients, meaningless charts and fake statistics. Visual patterns must have a reason in the information architecture of a motorsport analysis tool.

See `docs/DESIGN.md` for the visual rules.

## Documentation

- `docs/ARCHITECTURE.md` — system boundaries and data flow
- `docs/SECURITY.md` — authentication, authorization and security gates
- `docs/DESIGN.md` — visual language and anti-generic rules
- `docs/ROADMAP.md` — product and engineering roadmap
- `docs/DEVELOPMENT_LOG.md` — decisions and implementation history
- `CONTRIBUTING.md` — quality and contribution rules

## Current status

**v0.1 · Foundation**

The current release establishes the initial React + TypeScript + Vite application, the dashboard shell and the motorsport-specific visual direction. Displayed values are interface placeholders and are not official race results.

Authentication, real data, backend infrastructure and production security are intentionally implemented in later phases after the boundaries and testing strategy are established.

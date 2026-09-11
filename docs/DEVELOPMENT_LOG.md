# RaceMetrics Development Log

This file records meaningful project decisions and implementation steps so the project remains auditable and reproducible.

## 2026-09-11 — Product foundation

### Decisions

- RaceMetrics is an authenticated motorsport analytics application.
- Each person has an individual account and private user-owned state.
- Email/password, Google and Microsoft sign-in are planned authentication methods.
- Main product areas are Dashboard, Explore, Compare and Analytics.
- Advanced features are planned incrementally rather than forced into the first release.
- Security is a release gate.
- The interface must not resemble a generic AI-generated dashboard.

### Implemented

- React + TypeScript + Vite foundation.
- Initial dashboard composition.
- Motorsport-inspired dark visual system.
- Responsive base layout.
- Product README.
- Architecture documentation.
- Security requirements.
- Roadmap.
- Design and anti-generic rules.

## 2026-09-11 — Authentication UX foundation

### Implemented

- Supabase browser client using only public runtime configuration.
- Persistent session restoration and auth-state subscription.
- Protected application shell: unauthenticated users do not receive the dashboard.
- Email/password sign-in.
- Account creation with display-name metadata.
- Google OAuth entry point.
- Microsoft/Azure OAuth entry point.
- Password recovery request flow.
- Password recovery callback state and password update UI.
- Generic client-facing authentication errors to reduce unnecessary information disclosure.
- Explicit setup state when Supabase environment variables are absent.
- Account identity display and sign-out control in the dashboard.
- Responsive authentication interface aligned with RaceMetrics visual rules.
- No service-role/admin credential exposed to browser code.

### Security notes

- OAuth redirects use the current application origin and must still be allowlisted in the Supabase project configuration.
- The frontend session gate is a UX boundary, not the authorization boundary. Database RLS remains authoritative for private data.
- Real provider credentials are intentionally not committed.
- Password recovery responses are intentionally phrased without confirming whether an account exists.

### Deliberately not implemented yet

- Real authentication provider credentials/configuration in the user's Supabase project.
- Production database deployment/migration execution.
- Automated browser security tests.
- MFA enrollment UX.

## 2026-09-11 — Private data foundation

### Implemented

- Consolidated private-data schema into one versioned migration.
- Added `profiles`, `preferences`, `favorites` and `saved_comparisons`.
- Added automatic profile/preferences creation when a new auth user is created.
- Added ownership indexes and timestamp maintenance triggers.
- Enabled Row Level Security on every user-owned table.
- Added explicit authenticated CRUD policies keyed to `auth.uid()`.
- Revoked anonymous table access explicitly.
- Added `docs/AUTH_SETUP.md` with the external Supabase configuration runbook.
- Removed the superseded duplicate migration before production deployment so fresh environments have one authoritative schema history.

### Security notes

- User-owned tables do not rely on frontend filtering for isolation.
- Cross-user access must be denied by PostgreSQL RLS even if a malicious client changes IDs or request parameters.
- The migration intentionally contains no project-specific secrets.

## 2026-09-11 — Domain data and Explore foundation

### Implemented

- Added TypeScript domain contracts for drivers, teams, circuits, races and catalog state.
- Added an explicit data-status field so preview fixtures cannot silently masquerade as verified motorsport data.
- Added a repository boundary between UI and data source.
- Added a clearly fictional preview catalog for development only.
- Added catalog search across drivers, teams, races and circuits.
- Added the first Explore screen with entity filters and search.
- Connected Dashboard summary structures to the domain catalog instead of maintaining a second unrelated mock model.
- Kept preview values visibly labeled and avoided invented official race results.
- Kept Explore styling isolated in its feature stylesheet to prevent global visual drift.

### Data architecture decision

The UI consumes a repository contract rather than importing an API client directly. The verified ingestion source can therefore replace the preview adapter without redesigning the Explore screens. This follows the project's separation between ingestion, normalization, domain data and presentation.

## 2026-09-11 — Verified F1 catalog ingestion

### Implemented

- Selected Jolpica F1 as the first Formula 1 upstream catalog source after checking its current documentation and terms.
- Added a server-side Netlify Function at `/api/f1` rather than exposing the upstream API directly from the browser.
- Restricted the proxy to `GET` and an explicit allowlist of drivers, constructors, circuits and races.
- Added an identifying `RaceMetrics/0.1.0` User-Agent for upstream requests.
- Added response caching headers to reduce unnecessary upstream traffic.
- Added a typed normalization adapter that converts Jolpica responses into the RaceMetrics domain model.
- Switched the repository to the verified adapter with a preview fallback for upstream outages.
- Updated Explore to distinguish verified upstream data from preview data.
- Changed `Driver.teamId` to nullable instead of inventing a driver-to-team relationship that the current driver catalog endpoint does not establish.
- Added `docs/DATA-SOURCES.md` with source, architecture, licensing and fallback notes.

### Data integrity rules

- No official championship points are synthesized from the catalog endpoint.
- No driver-team relationship is inferred without source evidence.
- Unknown circuit lap counts remain null.
- Preview fixtures remain explicitly fictional.
- Upstream failure produces a labeled preview state rather than fabricated live data.

## 2026-09-11 — Verified F1 results and standings

### Implemented

- Added normalized `RaceResult`, `DriverStanding` and `ConstructorStanding` domain contracts.
- Extended the server-side F1 proxy to results and both championship standings resources.
- Added validated season, round, limit and offset parameters to the proxy.
- Added paginated season-result ingestion with an explicit 100-record page ceiling.
- Added normalization for grid position, finish position, points, status and fastest-lap fields.
- Added verified driver and constructor championship standings ingestion.
- Derived driver-to-constructor relationships from actual race-result evidence rather than reference-data inference.
- Added a cached repository method for a complete verified season payload.
- Kept verified analytics unavailable when upstream ingestion fails instead of mixing partial official data with fabricated values.
- Updated data-source documentation with the new ingestion boundary, pagination and licensing notes.

## 2026-09-11 — First Analytics product surface

### Implemented

- Added a dedicated Analytics view connected to verified 2026 driver and constructor standings.
- Added championship leader, round coverage and constructor-count KPIs.
- Added a real driver standings table with points and wins.
- Added a provenance-oriented leader signal panel.
- Added an explicit unavailable state when verified standings cannot be loaded.
- Connected Analytics to primary navigation without changing the motorsport visual language.
- Avoided decorative fake charts and unsupported metrics until their ingestion exists.

### CI repair

The first CI run failed before dependency installation because `actions/setup-node` was configured with `cache: npm` while the repository had no lockfile. The workflow was corrected to remove the lockfile-dependent cache setting. This is an infrastructure fix, not a suppression of the build gate.

### Deliberately not implemented yet

- Driver/team/race/circuit detail pages.
- Persistent favorite actions from Explore.
- Automated browser security tests.
- Production deployment verification of the Netlify Function.
- Qualifying and sprint analytics.
- Teammate comparison metrics.
- Lap-by-lap and pit-stop analytics.
- Real authentication provider credentials/configuration in the user's Supabase project.

## Documentation rule

Every substantial architectural, security, product or UX decision should be added here before or together with the implementation that depends on it.
